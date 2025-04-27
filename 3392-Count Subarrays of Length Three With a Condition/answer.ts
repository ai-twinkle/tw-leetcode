function countSubarrays(nums: number[]): number {
  const lengthOfNums = nums.length;
  let validSubarrayCount = 0;

  // iterate so that [i-1, i, i+1] are always in-bounds
  for (let centerIndex = 1; centerIndex < lengthOfNums - 1; ++centerIndex) {
    // one addition + one divide + one comparison
    if (nums[centerIndex - 1] + nums[centerIndex + 1] === nums[centerIndex] / 2) {
      validSubarrayCount++;
    }
  }

  return validSubarrayCount;
}
