function minimumDifference(nums: number[], k: number): number {
  const length = nums.length;

  // Handle trivial cases where no comparison is required
  if (k <= 1) {
    return 0;
  }

  // Prepare a typed array for faster numeric sorting and lower memory overhead
  const sortedScores = new Int32Array(length);
  for (let index = 0; index < length; index += 1) {
    sortedScores[index] = nums[index] | 0;
  }
  sortedScores.sort();

  // Track the smallest difference found across all valid windows
  let minimumPossibleDifference = 2147483647;

  // Precompute the fixed window size offset for the sliding window
  const windowEndOffset = k - 1;

  // Evaluate each contiguous window of size k in the sorted array
  for (let windowStart = 0; windowStart + windowEndOffset < length; windowStart += 1) {
    const windowEnd = windowStart + windowEndOffset;
    const difference = sortedScores[windowEnd] - sortedScores[windowStart];

    if (difference < minimumPossibleDifference) {
      minimumPossibleDifference = difference;

      // Zero is the optimal lower bound and allows an immediate exit
      if (minimumPossibleDifference === 0) {
        return 0;
      }
    }
  }

  // Return the minimum difference observed
  return minimumPossibleDifference;
}
