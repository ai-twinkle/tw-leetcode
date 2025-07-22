function maximumUniqueSubarray(nums: number[]): number {
  // Presence map for values 1..10000
  const presenceMap = new Uint8Array(10001);
  const arrayLength = nums.length;

  let maxScore = 0;
  let windowSum = 0;
  let leftIndex = 0;

  // Cache reference to nums for faster access
  const values = nums;

  for (let rightIndex = 0; rightIndex < arrayLength; rightIndex++) {
    const currentValue = values[rightIndex];

    // If duplicate, slide leftIndex until it's gone
    if (presenceMap[currentValue]) {
      do {
        const removedValue = values[leftIndex++];
        presenceMap[removedValue] = 0;
        windowSum -= removedValue;
      } while (presenceMap[currentValue]);
    }

    // Include currentValue in window
    presenceMap[currentValue] = 1;
    windowSum += currentValue;

    // Update maxScore
    maxScore = windowSum > maxScore ? windowSum : maxScore;
  }

  return maxScore;
}
