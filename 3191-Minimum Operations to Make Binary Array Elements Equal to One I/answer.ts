function minOperations(nums: number[]): number {
  let count = 0;

  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] === 0) {
      // When the current element is 0, we need to flip the group of 3 bits
      nums[i] = 1;
      nums[i + 1] = nums[i + 1] === 0 ? 1 : 0;
      nums[i + 2] = nums[i + 2] === 0 ? 1 : 0;

      // Increment the count
      count++;
    }
  }

  if (nums[nums.length - 1] === 1 && nums[nums.length - 2] === 1) {
    // If the last two elements all are 1, it satisfies the condition
    return count;
  }

  // Otherwise, we cannot obtain a valid result
  return -1;
}
