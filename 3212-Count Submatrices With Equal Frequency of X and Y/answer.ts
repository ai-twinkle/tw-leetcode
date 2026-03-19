function numberOfSubmatrices(grid: string[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // Store vertical accumulated (countX - countY) for each column
  const columnBalance = new Int32Array(columnCount);

  // Store vertical accumulated count of non-dot cells for each column
  const columnMarkedCount = new Int32Array(columnCount);

  let totalValidSubmatrices = 0;

  for (let row = 0; row < rowCount; row++) {
    const currentRow = grid[row];
    let prefixBalance = 0;
    let prefixMarkedCount = 0;

    for (let column = 0; column < columnCount; column++) {
      const cell = currentRow[column];

      // Update the vertical contribution of this column
      if (cell === 'X') {
        columnBalance[column]++;
        columnMarkedCount[column]++;
      } else if (cell === 'Y') {
        columnBalance[column]--;
        columnMarkedCount[column]++;
      }

      // Build the prefix rectangle ending at (row, column)
      prefixBalance += columnBalance[column];
      prefixMarkedCount += columnMarkedCount[column];

      // Equal X/Y and at least one X => balance is 0 and there is at least one marked cell
      if (prefixBalance === 0 && prefixMarkedCount !== 0) {
        totalValidSubmatrices++;
      }
    }
  }

  return totalValidSubmatrices;
}
