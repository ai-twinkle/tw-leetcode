function countNegatives(grid: number[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  let currentRow = rowCount - 1;
  let currentColumn = 0;
  let negativeCount = 0;

  // Start from bottom-left and move only up or right (staircase scan).
  let currentRowArray = grid[currentRow];

  while (currentRow >= 0 && currentColumn < columnCount) {
    if (currentRowArray[currentColumn] < 0) {
      // All values to the right in this row are also negative.
      negativeCount += columnCount - currentColumn;

      currentRow--;
      if (currentRow >= 0) {
        currentRowArray = grid[currentRow];
      }
    } else {
      currentColumn++;
    }
  }

  return negativeCount;
}
