function countSubmatrices(grid: number[][], k: number): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // Store vertical prefix sums for the still-possible columns only
  const columnSums = new Int32Array(columnCount);

  let totalValidSubmatrices = 0;
  let rightmostValidColumn = columnCount - 1;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    if (rightmostValidColumn < 0) {
      break;
    }

    const currentRow = grid[rowIndex];
    let prefixSum = 0;
    let newRightmostValidColumn = -1;

    for (let columnIndex = 0; columnIndex <= rightmostValidColumn; columnIndex++) {
      const updatedColumnSum = columnSums[columnIndex] + currentRow[columnIndex];
      columnSums[columnIndex] = updatedColumnSum;
      prefixSum += updatedColumnSum;

      // Prefix sums are non-decreasing because all values are non-negative
      if (prefixSum <= k) {
        newRightmostValidColumn = columnIndex;
      } else {
        break;
      }
    }

    // No prefix in this row is valid, and later rows can only be larger
    if (newRightmostValidColumn < 0) {
      break;
    }

    totalValidSubmatrices += newRightmostValidColumn + 1;
    rightmostValidColumn = newRightmostValidColumn;
  }

  return totalValidSubmatrices;
}
