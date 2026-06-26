function countMajoritySubarrays(nums: number[], target: number): number {
  const length = nums.length;

  // Typed array avoids boxing and gives contiguous cache-friendly storage.
  const prefixFrequency = new Int32Array(length * 2 + 1);

  // Index 'length' corresponds to a running balance of 0 (the empty prefix).
  prefixFrequency[length] = 1;

  // 'balanceIndex' is the current balance shifted by 'length' to stay non-negative.
  let balanceIndex = length;

  // 'runningPositiveCount' tracks how many earlier prefixes form a positive-sum subarray ending here.
  let runningPositiveCount = 0;
  let majoritySubarrayCount = 0;

  for (let i = 0; i < length; ++i) {
    if (nums[i] === target) {
      // Balance rises: previous prefixes at the old top become valid.
      runningPositiveCount += prefixFrequency[balanceIndex];
      ++balanceIndex;
      ++prefixFrequency[balanceIndex];
    } else {
      // Balance falls: the prefix just below loses its positive contribution.
      --balanceIndex;
      runningPositiveCount -= prefixFrequency[balanceIndex];
      ++prefixFrequency[balanceIndex];
    }

    majoritySubarrayCount += runningPositiveCount;
  }

  return majoritySubarrayCount;
}
