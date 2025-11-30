function minSubarray(nums: number[], p: number): number {
  const length = nums.length;

  // Any integer sum is divisible by 1, so no removal is needed
  if (p === 1) {
    return 0;
  }

  // Compute total sum modulo p using a running accumulator
  let totalSumModulo = 0;
  for (let index = 0; index < length; index++) {
    // Keep value reduced modulo p to avoid large intermediate numbers
    totalSumModulo = (totalSumModulo + nums[index]) % p;
  }

  // If already divisible by p, we do not need to remove anything
  if (totalSumModulo === 0) {
    return 0;
  }

  const targetRemainder = totalSumModulo;

  // Map from prefix-sum remainder to the latest index where it appears
  const remainderIndexMap = new Map<number, number>();
  remainderIndexMap.set(0, -1);

  let currentPrefixModulo = 0;
  let minimumRemovalLength = length;

  // Single pass: maintain prefix modulo and use the map for O(1) lookups
  for (let index = 0; index < length; index++) {
    // Maintain current prefix modulo to keep values bounded
    currentPrefixModulo = (currentPrefixModulo + nums[index]) % p;

    // We want a previous prefix such that:
    // (currentPrefixModulo - previousPrefixModulo) % p === targetRemainder
    const requiredRemainder =
      (currentPrefixModulo - targetRemainder + p) % p;

    // Query the latest index of the required remainder
    const previousIndex = remainderIndexMap.get(requiredRemainder);

    if (previousIndex !== undefined) {
      const candidateLength = index - previousIndex;

      // We are not allowed to remove the whole array
      if (
        candidateLength < minimumRemovalLength &&
        candidateLength < length
      ) {
        // Update the current best answer
        minimumRemovalLength = candidateLength;
      }
    }

    // Store the latest index for this remainder to keep candidate windows short
    remainderIndexMap.set(currentPrefixModulo, index);
  }

  // If no valid subarray was found, return -1
  if (minimumRemovalLength === length) {
    return -1;
  }

  return minimumRemovalLength;
}
