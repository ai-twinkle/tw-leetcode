function minimumSumSubarray(nums: number[], l: number, r: number): number {
  const length = nums.length;
  const noAnswerSentinel = 2147483647;

  // Build prefix sums in a typed array (max magnitude 100 * 1000 fits in Int32)
  const prefixSum = new Int32Array(length + 1);
  for (let index = 0; index < length; index++) {
    prefixSum[index + 1] = prefixSum[index] + nums[index];
  }

  let minimumPositiveSum = noAnswerSentinel;

  for (let endIndex = l; endIndex <= length; endIndex++) {
    const endPrefix = prefixSum[endIndex];
    const lowestStartIndex = endIndex - r > 0 ? endIndex - r : 0;

    // Check every start position that keeps the window length within [l, r]
    for (let startIndex = endIndex - l; startIndex >= lowestStartIndex; startIndex--) {
      const windowSum = endPrefix - prefixSum[startIndex];

      if (windowSum > 0 && windowSum < minimumPositiveSum) {
        // 1 is the smallest possible positive integer sum, so stop immediately
        if (windowSum === 1) {
          return 1;
        }
        minimumPositiveSum = windowSum;
      }
    }
  }

  return minimumPositiveSum === noAnswerSentinel ? -1 : minimumPositiveSum;
}
