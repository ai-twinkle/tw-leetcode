function countSubarrays(nums: number[], k: number): number {
  const n = nums.length;

  // window spans nums[leftPointer..rightPointer]
  let leftPointer = 0;
  let rightPointer = 0;

  // sum of values in the current window
  let windowSum = nums[0];

  // total count of valid subarrays
  let totalSubarrays = 0;

  while (rightPointer < n) {
    // length and score of the window
    const windowLength = rightPointer - leftPointer + 1;
    const windowScore = windowLength * windowSum;

    if (windowScore < k) {
      // every subarray ending at rightPointer with start in [leftPointer..rightPointer]
      totalSubarrays += windowLength;

      // expand window to the right
      rightPointer++;
      windowSum += nums[rightPointer];
    } else {
      // shrink window from the left
      windowSum -= nums[leftPointer];
      leftPointer++;
    }
  }

  return totalSubarrays;
}
