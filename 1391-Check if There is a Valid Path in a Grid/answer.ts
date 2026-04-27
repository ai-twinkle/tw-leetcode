// Bit positions for the four directions used by the connection bitmask
// bit 0 = LEFT, bit 1 = RIGHT, bit 2 = UP, bit 3 = DOWN
const LEFT_BIT = 1;
const RIGHT_BIT = 2;
const UP_BIT = 4;
const DOWN_BIT = 8;

// Precomputed connection bitmask for each street type (index 0 unused)
// Each entry holds the OR of the two directions the street is connected to.
// Computed once at module load so repeated invocations of hasValidPath share it.
const STREET_CONNECTIONS = new Uint8Array([
  0,
  LEFT_BIT | RIGHT_BIT,    // type 1: connects left and right
  UP_BIT | DOWN_BIT,       // type 2: connects up and down
  LEFT_BIT | DOWN_BIT,     // type 3: connects left and down
  RIGHT_BIT | DOWN_BIT,    // type 4: connects right and down
  LEFT_BIT | UP_BIT,       // type 5: connects left and up
  RIGHT_BIT | UP_BIT,      // type 6: connects right and up
]);

/**
 * Determine whether a valid path exists from the upper-left cell to the
 * bottom-right cell when only travelling along street connections.
 * @param grid - 2D street grid where each value is in [1, 6]
 * @returns true when a valid path exists, otherwise false
 */
function hasValidPath(grid: number[][]): boolean {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // Trivial single-cell grid: start cell is also the destination
  if (rowCount === 1 && columnCount === 1) {
    return true;
  }

  const totalCells = rowCount * columnCount;
  const lastIndex = totalCells - 1;

  // Uint8Array gives the smallest, cache-friendly visited bitmap
  const visited = new Uint8Array(totalCells);

  // Two regular arrays act as the BFS frontier and its successor.
  // Regular arrays outperform a pre-sized Int32Array queue here because we
  // never pay the cost of pre-zeroing a large buffer when most BFS searches
  // terminate early after touching only a few cells.
  let currentFrontier: number[] = [0];
  let nextFrontier: number[] = [];
  visited[0] = 1;

  while (currentFrontier.length > 0) {
    const frontierSize = currentFrontier.length;
    for (let i = 0; i < frontierSize; i++) {
      const currentIndex = currentFrontier[i];
      const currentRow = (currentIndex / columnCount) | 0;
      const currentColumn = currentIndex - currentRow * columnCount;
      const currentConnections = STREET_CONNECTIONS[grid[currentRow][currentColumn]];

      // Move LEFT: current must expose LEFT, neighbor must expose RIGHT
      if ((currentConnections & LEFT_BIT) !== 0 && currentColumn > 0) {
        const neighborIndex = currentIndex - 1;
        if (visited[neighborIndex] === 0 &&
          (STREET_CONNECTIONS[grid[currentRow][currentColumn - 1]] & RIGHT_BIT) !== 0) {
          if (neighborIndex === lastIndex) {
            return true;
          }
          visited[neighborIndex] = 1;
          nextFrontier.push(neighborIndex);
        }
      }

      // Move RIGHT: current must expose RIGHT, neighbor must expose LEFT
      if ((currentConnections & RIGHT_BIT) !== 0 && currentColumn < columnCount - 1) {
        const neighborIndex = currentIndex + 1;
        if (visited[neighborIndex] === 0 &&
          (STREET_CONNECTIONS[grid[currentRow][currentColumn + 1]] & LEFT_BIT) !== 0) {
          if (neighborIndex === lastIndex) {
            return true;
          }
          visited[neighborIndex] = 1;
          nextFrontier.push(neighborIndex);
        }
      }

      // Move UP: current must expose UP, neighbor must expose DOWN
      if ((currentConnections & UP_BIT) !== 0 && currentRow > 0) {
        const neighborIndex = currentIndex - columnCount;
        if (visited[neighborIndex] === 0 &&
          (STREET_CONNECTIONS[grid[currentRow - 1][currentColumn]] & DOWN_BIT) !== 0) {
          if (neighborIndex === lastIndex) {
            return true;
          }
          visited[neighborIndex] = 1;
          nextFrontier.push(neighborIndex);
        }
      }

      // Move DOWN: current must expose DOWN, neighbor must expose UP
      if ((currentConnections & DOWN_BIT) !== 0 && currentRow < rowCount - 1) {
        const neighborIndex = currentIndex + columnCount;
        if (visited[neighborIndex] === 0 &&
          (STREET_CONNECTIONS[grid[currentRow + 1][currentColumn]] & UP_BIT) !== 0) {
          if (neighborIndex === lastIndex) {
            return true;
          }
          visited[neighborIndex] = 1;
          nextFrontier.push(neighborIndex);
        }
      }
    }

    // Swap frontiers and reuse the underlying array storage for the next layer
    const swapHelper = currentFrontier;
    currentFrontier = nextFrontier;
    nextFrontier = swapHelper;
    nextFrontier.length = 0;
  }

  return false;
}
