const MOD = 1_000_000_007;

/**
 * Applies a series of range-step multiply queries to nums, then returns the XOR of all elements.
 * @param nums  The input integer array to be mutated by queries.
 * @param queries  Each query is [l, r, k, v]: multiply nums[idx] by v for idx = l, l+k, l+2k, … ≤ r.
 * @return The bitwise XOR of all elements after all queries are applied.
 */
function xorAfterQueries(nums: number[], queries: number[][]): number {
  const length = nums.length;
  const queryCount = queries.length;

  // Copy into a typed array for faster indexed reads and writes
  const workingNums = new Int32Array(nums);

  // Flatten the 2-D queries array into a stride-4 typed array for cache-friendly access
  const flatQueries = new Int32Array(queryCount * 4);
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const sourceQuery = queries[queryIndex];
    const baseOffset = queryIndex * 4;
    flatQueries[baseOffset]     = sourceQuery[0];
    flatQueries[baseOffset + 1] = sourceQuery[1];
    flatQueries[baseOffset + 2] = sourceQuery[2];
    flatQueries[baseOffset + 3] = sourceQuery[3];
  }

  // Apply each query: multiply every k-th element in [l, r] by v, modulo MOD
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const baseOffset = queryIndex * 4;
    const leftBound  = flatQueries[baseOffset];
    const rightBound = flatQueries[baseOffset + 1];
    const stepSize   = flatQueries[baseOffset + 2];
    const multiplier = flatQueries[baseOffset + 3];

    for (let idx = leftBound; idx <= rightBound; idx += stepSize) {
      workingNums[idx] = (workingNums[idx] * multiplier) % MOD;
    }
  }

  // Accumulate the final XOR across all elements
  let xorResult = 0;
  for (let i = 0; i < length; i++) {
    xorResult ^= workingNums[i];
  }

  return xorResult;
}
