function countGood(nums: number[], k: number): number {
  const totalNumbers = nums.length;
  if (k === 0) {
    // When k is 0, every subarray is good.
    return (totalNumbers * (totalNumbers + 1)) >> 1;
  }

  let currentPairCount = 0;       // current number of good pairs in the sliding window
  let goodSubarrayCount = 0;      // result accumulator for the count of good subarrays
  let leftPointer = 0;

  // Use a Map for frequency counting.
  const frequencyCounter = new Map<number, number>();

  for (let rightPointer = 0; rightPointer < totalNumbers; rightPointer++) {
    const currentNumber = nums[rightPointer];
    const currentFrequency = frequencyCounter.get(currentNumber) || 0;
    currentPairCount += currentFrequency;
    frequencyCounter.set(currentNumber, currentFrequency + 1);

    // Once our window has at least k pairs, contract from the left as much as possible.
    while (currentPairCount >= k) {
      goodSubarrayCount += totalNumbers - rightPointer;

      const leftNumber = nums[leftPointer];
      const leftFrequency = frequencyCounter.get(leftNumber)!;
      // Remove one occurrence from the window.
      frequencyCounter.set(leftNumber, leftFrequency - 1);
      // Removing this occurrence reduces the pair count by (leftFrequency - 1)
      currentPairCount -= (leftFrequency - 1);
      leftPointer++;
    }
  }
  return goodSubarrayCount;
}
