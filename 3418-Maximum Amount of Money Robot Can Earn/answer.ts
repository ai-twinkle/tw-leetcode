function maximumAmount(coins: number[][]): number {
  const columnCount = coins[0].length;
  const strideLength = columnCount + 1;

  // Single flat Float64Array holding all three DP levels contiguously.
  // Layout: [k=0 slots 0..n | k=1 slots 0..n | k=2 slots 0..n]
  const dp = new Float64Array(strideLength * 3).fill(-Infinity);

  // Offsets into the flat buffer for each neutralization level.
  const levelZeroOffset = 0;
  const levelOneOffset = strideLength;
  const levelTwoOffset = strideLength * 2;

  // Column 1 is the entry point; sentinel column 0 stays -Infinity.
  dp[levelZeroOffset + 1] = 0;
  dp[levelOneOffset + 1] = 0;
  dp[levelTwoOffset + 1] = 0;

  for (let rowIndex = 0; rowIndex < coins.length; rowIndex++) {
    const currentRow = coins[rowIndex];

    dp[levelZeroOffset] = -Infinity;
    dp[levelOneOffset] = -Infinity;
    dp[levelTwoOffset] = -Infinity;

    for (let j = 1; j <= columnCount; j++) {
      const cellValue = currentRow[j - 1];

      // Read all six predecessor values before any writes (preserves original semantics).
      const leftZero  = dp[levelZeroOffset + j - 1];
      const leftOne   = dp[levelOneOffset  + j - 1];
      const leftTwo   = dp[levelTwoOffset  + j - 1];
      const aboveZero = dp[levelZeroOffset + j];
      const aboveOne  = dp[levelOneOffset  + j];
      const aboveTwo  = dp[levelTwoOffset  + j];

      // Best predecessor for each level (from left or above).
      const bestZero = leftZero > aboveZero ? leftZero : aboveZero;
      const bestOne  = leftOne  > aboveOne  ? leftOne  : aboveOne;
      const bestTwo  = leftTwo  > aboveTwo  ? leftTwo  : aboveTwo;

      // Exact translation of original update order (k=2, k=1, k=0).
      // "spend" terms read from the level below using pre-read old values.
      dp[levelTwoOffset + j] = (bestTwo + cellValue) > bestOne ? (bestTwo + cellValue) : bestOne;
      dp[levelOneOffset + j] = (bestOne + cellValue) > bestZero ? (bestOne + cellValue) : bestZero;
      dp[levelZeroOffset + j] = bestZero + cellValue;
    }
  }

  return dp[levelTwoOffset + columnCount];
}
