function canPartition(nums: number[]): boolean {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2 !== 0) {
    return false;
  }

  const target = sum / 2;
  // Start with a bitmask where only the 0th bit is set.
  let dp = 1n; // Using BigInt for arbitrary-precision bit operations.

  for (const num of nums) {
    // Shift the dp bitmask left by num and combine it with dp.
    dp |= dp << BigInt(num);
  }

  // Check if the target bit is set.
  return ((dp >> BigInt(target)) & 1n) === 1n;
}
