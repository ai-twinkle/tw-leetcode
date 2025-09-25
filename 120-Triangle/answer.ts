function minimumTotal(triangle: number[][]): number {
  const rowCount = triangle.length;

  // Early return for the smallest valid input
  if (rowCount === 1) {
    return triangle[0][0] | 0;
  }

  // Use Int32Array: sums fit into 32-bit signed given constraints (≤ 2,000,000)
  const dp = new Int32Array(rowCount);

  // Initialize with the apex value
  dp[0] = triangle[0][0] | 0;

  // Bottom-up in-place DP over a single row buffer
  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    const row = triangle[rowIndex];

    // Update from right-to-left to preserve previous row state in dp
    for (let colIndex = rowIndex; colIndex >= 0; colIndex--) {
      const cellValue = row[colIndex] | 0;

      if (colIndex === rowIndex) {
        // The last element in the row can only come from dp[colIndex - 1]
        dp[colIndex] = (dp[colIndex - 1] + cellValue) | 0;
      } else if (colIndex === 0) {
        // The first element in the row can only come from dp[colIndex]
        dp[0] = (dp[0] + cellValue) | 0;
      } else {
        // Middle elements: choose the better of two parents
        const leftParent = dp[colIndex - 1];
        const rightParent = dp[colIndex];
        const minParent = leftParent < rightParent ? leftParent : rightParent;
        dp[colIndex] = (minParent + cellValue) | 0;
      }
    }
  }

  // Scan for the minimum in the last dp row (avoid spread/Math.min(...))
  let result = dp[0];
  for (let i = 1; i < rowCount; i++) {
    if (dp[i] < result) {
      result = dp[i];
    }
  }

  return result | 0;
}
