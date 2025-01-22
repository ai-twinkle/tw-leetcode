// Direction array for moving north, east, south, and west
// This using sliding window technique, for less memory usage
const HIGHEST_PEEK_DIRECTIONS: number[] = [0, 1, 0, -1, 0];

function highestPeak(isWater: number[][]): number[][] {
  // Get the number of rows and columns
  const m = isWater.length;
  const n = isWater[0].length;

  // Initialize the result matrix
  const heights = Array.from({ length: m }, () => Array(n).fill(-1));

  // Queue for BFS, starting with all water cells
  let queue: [number, number, number][] = [];
  for (let row = 0; row < m; row++) {
    for (let col = 0; col < n; col++) {
      // If the cell is water, set the height to 0 and add to the queue
      if (isWater[row][col] === 1) {
        heights[row][col] = 0;
        queue.push([row, col, 0]);
      }
    }
  }

  // Perform BFS to calculate heights for land cells
  while (queue.length > 0) {
    const nextQueue: [number, number, number][] = [];
    for (const [currentRow, currentCol, currentHeight] of queue) {
      for (let i = 0; i < 4; i++) {
        const nextRow = currentRow + HIGHEST_PEEK_DIRECTIONS[i];
        const nextCol = currentCol + HIGHEST_PEEK_DIRECTIONS[i + 1];

        // Check bounds and if the cell is unvisited
        if (
          nextRow < 0 ||
          nextRow >= m ||
          nextCol < 0 ||
          nextCol >= n ||
          heights[nextRow][nextCol] !== -1
        ) {
          continue;
        }

        heights[nextRow][nextCol] = currentHeight + 1;
        queue.push([nextRow, nextCol, currentHeight + 1]);
      }
    }
    // Move to the next BFS level
    queue = nextQueue;
  }

  return heights;
}
