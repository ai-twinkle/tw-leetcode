function maximumJumps(nums: number[], target: number): number {
  const length = nums.length;

  // Use Int16Array since n <= 1000, so max jumps fits easily; -1 marks unreachable
  const dp = new Int16Array(length);
  dp[0] = 0;
  for (let index = 1; index < length; index++) {
    dp[index] = -1;
  }

  for (let i = 1; i < length; i++) {
    // Cache current value and pre-compute the valid range bounds to avoid Math.abs overhead
    const currentValue = nums[i];
    const lowerBound = currentValue - target;
    const upperBound = currentValue + target;
    let bestJumps = -1;

    for (let j = 0; j < i; j++) {
      const previousJumps = dp[j];

      // Skip unreachable predecessors to prune the search space
      if (previousJumps < 0) {
        continue;
      }

      const previousValue = nums[j];

      // Replace Math.abs with two direct comparisons for speed
      if (previousValue < lowerBound || previousValue > upperBound) {
        continue;
      }

      // Track the maximum jumps inline instead of calling Math.max
      if (previousJumps > bestJumps) {
        bestJumps = previousJumps;
      }
    }

    // bestJumps stays -1 if no valid predecessor was found, propagating unreachability
    if (bestJumps >= 0) {
      dp[i] = bestJumps + 1;
    }
  }

  return dp[length - 1];
}
