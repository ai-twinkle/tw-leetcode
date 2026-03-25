function canPartitionGrid(grid: number[][]): boolean {
  const rowCount = grid.length;
  const colCount = grid[0].length;

  // Accumulate row sums and total sum in a single pass
  const rowSums = new Float64Array(rowCount);
  let totalSum = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = grid[rowIndex];
    let rowSum = 0;

    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      rowSum += currentRow[colIndex];
    }

    rowSums[rowIndex] = rowSum;
    totalSum += rowSum;
  }

  // Check horizontal cuts: prefix row sum must equal exactly half the total
  let prefixSum = 0;
  for (let rowIndex = 0; rowIndex < rowCount - 1; rowIndex++) {
    prefixSum += rowSums[rowIndex];

    // Multiply by 2 instead of dividing totalSum to stay in integer domain
    if (prefixSum * 2 === totalSum) {
      return true;
    }
  }

  // Build column sums by iterating in row-major order for cache efficiency
  const colSums = new Float64Array(colCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = grid[rowIndex];

    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      colSums[colIndex] += currentRow[colIndex];
    }
  }

  // Check vertical cuts: prefix column sum must equal exactly half the total
  prefixSum = 0;
  for (let colIndex = 0; colIndex < colCount - 1; colIndex++) {
    prefixSum += colSums[colIndex];

    if (prefixSum * 2 === totalSum) {
      return true;
    }
  }

  return false;
}
