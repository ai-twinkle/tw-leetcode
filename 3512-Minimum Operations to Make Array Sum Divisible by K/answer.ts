function minOperations(nums: number[], k: number): number {
  // Accumulate the sum using a simple for-loop to avoid callback overhead
  let totalSum = 0;
  for (let index = 0; index < nums.length; index++) {
    totalSum += nums[index];
  }

  // Compute how far the sum is from the nearest multiple of k below it
  const remainder = totalSum % k;

  // If already divisible, no operation is needed
  if (remainder === 0) {
    return 0;
  }

  // Otherwise, the minimal number of decrements equals the remainder
  return remainder;
}
