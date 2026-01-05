function maxMatrixSum(matrix: number[][]): number {
  const rowCount = matrix.length;

  let totalAbsoluteSum = 0;
  let negativeCount = 0;
  let minAbsoluteValue = Number.POSITIVE_INFINITY;
  let hasZero = false;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = matrix[rowIndex];
    const columnCount = row.length;

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const value = row[columnIndex];

      if (value < 0) {
        negativeCount++;
      } else if (value === 0) {
        hasZero = true;
      }

      // Important step: accumulate absolute sum and track the smallest absolute value once.
      const absoluteValue = value < 0 ? -value : value;
      totalAbsoluteSum += absoluteValue;

      if (absoluteValue < minAbsoluteValue) {
        minAbsoluteValue = absoluteValue;
      }
    }
  }

  // If there is a zero, we can always reach the all-nonnegative configuration for max sum.
  if (hasZero) {
    return totalAbsoluteSum;
  }

  // If negatives are even, we can flip to make all entries nonnegative.
  if ((negativeCount & 1) === 0) {
    return totalAbsoluteSum;
  }

  // If negatives are odd and no zero exists, exactly one value must remain negative:
  // choose the smallest absolute value to minimize the penalty.
  return totalAbsoluteSum - (minAbsoluteValue * 2);
}
