function findLHS(nums: number[]): number {
  const totalItemsCount = nums.length;
  if (totalItemsCount < 2) {
    return 0;
  }

  // 1. Copy into a 32-bit typed array and sort in native code
  const sortedItems = new Int32Array(nums);
  sortedItems.sort();

  // 2. One pass with two pointers to maintain max–min ≤ 1
  let maximumHarmoniousSubsequenceLength = 0;
  let leftPointer = 0;

  for (let rightPointer = 0; rightPointer < totalItemsCount; rightPointer++) {
    // Move leftPointer forward until window is valid again
    while (sortedItems[rightPointer] - sortedItems[leftPointer] > 1) {
      leftPointer++;
    }
    // If exactly 1 apart, try to update the best length
    if (sortedItems[rightPointer] - sortedItems[leftPointer] === 1) {
      const currentWindowLength = rightPointer - leftPointer + 1;
      if (currentWindowLength > maximumHarmoniousSubsequenceLength) {
        maximumHarmoniousSubsequenceLength = currentWindowLength;
      }
    }
  }

  return maximumHarmoniousSubsequenceLength;
}
