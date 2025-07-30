function longestSubarray(nums: number[]): number {
  // 1. Find the maximum value in nums
  let maximumValue = -1;
  for (let i = 0; i < nums.length; ++i) {
    if (nums[i] > maximumValue) {
      maximumValue = nums[i];
    }
  }

  // 2. Find the length of the longest contiguous subarray of maximumValue
  let longestLength = 0;
  let currentLength = 0;
  for (let i = 0; i < nums.length; ++i) {
    if (nums[i] === maximumValue) {
      currentLength += 1;
      if (currentLength > longestLength) {
        longestLength = currentLength;
      }
    } else {
      currentLength = 0;
    }
  }
  return longestLength;
}
