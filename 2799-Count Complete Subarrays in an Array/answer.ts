function countCompleteSubarrays(nums: number[]): number {
  // Since 1 <= nums[i] <= 2000, we can allocate fixed buffers of size 2001.
  const MAX_VALUE = 2000;

  // frequency[value] === how many times 'value' appears in the current window
  const frequency = new Uint16Array(MAX_VALUE + 1);

  // seenGlobal[value] === 1 if 'value' appears anywhere in nums
  const seenGlobal = new Uint8Array(MAX_VALUE + 1);

  // 1) Compute how many distinct values exist in the whole array.
  let totalDistinct = 0;
  for (const value of nums) {
    if (seenGlobal[value] === 0) {
      seenGlobal[value] = 1;
      totalDistinct++;
    }
  }

  // 2) Sliding window [leftIndex .. rightIndex]
  let leftIndex = 0;
  let distinctInWindow = 0;
  let resultCount = 0;
  const n = nums.length;

  for (let rightIndex = 0; rightIndex < n; rightIndex++) {
    const v = nums[rightIndex];
    if (frequency[v] === 0) {
      // first time this value enters the window
      distinctInWindow++;
    }
    frequency[v]++;

    // 3) As soon as window contains all distinct values,
    //    every subarray extending to the right end is “complete.”
    while (distinctInWindow === totalDistinct) {
      // all subarrays nums[leftIndex..rightIndex], nums[leftIndex..rightIndex+1], … nums[leftIndex..n-1]
      resultCount += (n - rightIndex);

      // shrink window from the left
      const leftValue = nums[leftIndex];
      frequency[leftValue]--;
      if (frequency[leftValue] === 0) {
        distinctInWindow--;
      }
      leftIndex++;
    }
  }

  return resultCount;
}
