function longestNiceSubarray(nums: number[]): number {
  if (nums.length === 0) {
    return 0;
  }

  let max = 1;

  for (let i = 0; i < nums.length; i++) {
    let count = 1;
    let currentBitmask = nums[i];

    for (let j = i + 1; j < nums.length; j++) {
      // If there is no overlapping bit between currentBitmask and nums[j]
      if ((currentBitmask & nums[j]) === 0) {
        count++;
        currentBitmask |= nums[j];
      } else {
        // Stop if adding nums[j] creates a conflict
        break;
      }
    }
    max = Math.max(max, count);
  }

  return max;
}
