function updateMatrix(mat: number[][]): number[][] {
  const UPDATE_MATRIX_DIRECTIONS: number[] = [0, 1, 0, -1, 0];

  // Get the number of rows and columns
  const m = mat.length;
  const n = mat[0].length;

  // Initialize the result matrix
  const newMatrix = Array.from({ length: m }, () => Array(n).fill(-1));

  // Queue for BFS, starting with all cells with 0s
  let queue: [number, number, number][] = [];
  for (let row = 0; row < m; row++) {
    for (let col = 0; col < n; col++) {
      // If the cell is 0, set the newMatrix distance to 0 and add to the queue
      if (mat[row][col] === 0) {
        newMatrix[row][col] = 0;
        queue.push([row, col, 0]);
      }
    }
  }

  // Perform BFS to calculate newMatrix distance for non-0 cells
  while (queue.length > 0) {
    const nextQueue: [number, number, number][] = [];
    for (const [currentRow, currentCol, currentHeight] of queue) {
      for (let i = 0; i < 4; i++) {
        const nextRow = currentRow + UPDATE_MATRIX_DIRECTIONS[i];
        const nextCol = currentCol + UPDATE_MATRIX_DIRECTIONS[i + 1];

        // Check bounds and if the cell is unvisited
        if (
          nextRow < 0 ||
          nextRow >= m ||
          nextCol < 0 ||
          nextCol >= n ||
          newMatrix[nextRow][nextCol] !== -1
        ) {
          continue;
        }

        newMatrix[nextRow][nextCol] = currentHeight + 1;
        queue.push([nextRow, nextCol, currentHeight + 1]);
      }
    }
    // Move to the next BFS level
    queue = nextQueue;
  }

  return newMatrix;
}
