function waysToSplitArray(nums: number[]): number {
  const prefixSum = new Array(nums.length + 1).fill(0);
  const postfixSum = new Array(nums.length + 1).fill(0);

  for (let i = 1; i <= nums.length; i++) {
    prefixSum[i] = prefixSum[i - 1] + nums[i - 1];
    postfixSum[nums.length - i] = postfixSum[nums.length - i + 1] + nums[nums.length - i];
  }

  let validSplits = 0;
  for (let i = 1; i < nums.length; i++) {
    if (prefixSum[i] >= postfixSum[i]) {
      validSplits++;
    }
  }
  return validSplits;
}
