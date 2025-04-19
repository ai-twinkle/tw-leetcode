function countFairPairs(nums: number[], lower: number, upper: number): number {
  // 1. Convert to Int32Array so that .sort() is a built‑in numeric sort
  const sortedNumbers = Int32Array.from(nums);
  sortedNumbers.sort();

  const lengthOfNumbers = sortedNumbers.length;

  // 2. Helper to count number of (i,j) with i<j and sortedNumbers[i]+sortedNumbers[j] ≤ limit
  function countPairsAtMost(limit: number): number {
    let pairCount = 0;
    let leftIndex = 0;
    let rightIndex = lengthOfNumbers - 1;

    while (leftIndex < rightIndex) {
      const sumOfPair = sortedNumbers[leftIndex] + sortedNumbers[rightIndex];
      if (sumOfPair <= limit) {
        // all indices k in (leftIndex, rightIndex] form valid pairs with leftIndex
        pairCount += rightIndex - leftIndex;
        leftIndex++;
      } else {
        rightIndex--;
      }
    }

    return pairCount;
  }

  // 3. Number of pairs with sum in [lower, upper]
  const countUpToUpper = countPairsAtMost(upper);
  const countBelowLower = countPairsAtMost(lower - 1);
  return countUpToUpper - countBelowLower;
}
