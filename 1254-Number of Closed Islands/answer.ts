function closedIsland(grid: number[][]): number {
  let result = 0;

  const rows = grid.length;
  const cols = grid[0].length;

  // Without an interior there is no cell off the border, so no island can be closed
  if (rows < 3 || cols < 3) {
    return 0;
  }

  const lastRow = rows - 1;
  const lastCol = cols - 1;

  function flipZero(row: number, col: number) {
    grid[row][col] = 1;

    // Test the neighbour before recursing, so discarded calls never happen
    if (col < lastCol && grid[row][col + 1] === 0) {
      flipZero(row, col + 1);
    }

    if (row < lastRow && grid[row + 1][col] === 0) {
      flipZero(row + 1, col);
    }

    if (row > 0 && grid[row - 1][col] === 0) {
      flipZero(row - 1, col);
    }

    if (col > 0 && grid[row][col - 1] === 0) {
      flipZero(row, col - 1);
    }
  }

  for (let row = 0; row < rows; row++) {
    if (grid[row][0] === 0) {
      flipZero(row, 0);
    }

    if (grid[row][lastCol] === 0) {
      flipZero(row, lastCol);
    }
  }

  for (let col = 0; col < cols; col++) {
    if (grid[0][col] === 0) {
      flipZero(0, col);
    }

    if (grid[lastRow][col] === 0) {
      flipZero(lastRow, col);
    }
  }

  for (let row = 1; row < lastRow; row++) {
    for (let col = 1; col < lastCol; col++) {
      if (grid[row][col] === 0) {
        flipZero(row, col);
        result++;
      }
    }
  }

  return result;
}
