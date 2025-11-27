function maxSubarraySum(nums: number[], k: number): number {
  const numsLength = nums.length;

  // Pre-allocate typed array for minimum prefix sum per residue class
  const residueMinimumPrefixSumArray = new Float64Array(k);

  // Initialize all residues to +Infinity so the first real prefixSum becomes the minimum
  for (let index = 0; index < k; index += 1) {
    residueMinimumPrefixSumArray[index] = Number.POSITIVE_INFINITY;
  }

  // Handle subarrays starting from index 0 with length divisible by k
  residueMinimumPrefixSumArray[k - 1] = 0;

  // Use a strong negative initial value for maximum sum
  const negativeMaxSafeInteger = -Number.MAX_SAFE_INTEGER;

  let prefixSum = 0;
  let maximumSum = negativeMaxSafeInteger;

  // Track residue index without using modulo in the loop
  let residueIndex = 0;

  // Single pass over the array to compute the best subarray sum
  for (let index = 0; index < numsLength; index += 1) {
    // Update prefix sum with current value
    prefixSum += nums[index];

    // Compute candidate using best (minimum) prefixSum for this residue
    const candidateSum = prefixSum - residueMinimumPrefixSumArray[residueIndex];

    // Update global maximum if current candidate is better
    if (candidateSum > maximumSum) {
      maximumSum = candidateSum;
    }

    // Maintain minimum prefix sum for this residue class
    if (prefixSum < residueMinimumPrefixSumArray[residueIndex]) {
      residueMinimumPrefixSumArray[residueIndex] = prefixSum;
    }

    // Move residue index forward and wrap around without modulo
    residueIndex += 1;
    if (residueIndex === k) {
      residueIndex = 0;
    }
  }

  return maximumSum;
}
