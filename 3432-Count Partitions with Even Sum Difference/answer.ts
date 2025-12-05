function countPartitions(nums: number[]): number {
  const length = nums.length;

  // Compute total sum in a single pass
  let totalSum = 0;
  for (let index = 0; index < length; index++) {
    totalSum += nums[index];
  }

  // If total sum is odd, no partition can give an even difference
  if ((totalSum & 1) !== 0) {
    return 0;
  }

  // If total sum is even, every partition index 0..length-2 is valid
  return length - 1;
}
