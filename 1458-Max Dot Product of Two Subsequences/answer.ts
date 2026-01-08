function maxDotProduct(nums1: number[], nums2: number[]): number {
  // Ensure the second dimension is smaller to reduce DP memory and cache misses
  let firstNumbers = nums1;
  let secondNumbers = nums2;

  if (secondNumbers.length > firstNumbers.length) {
    const swapNumbers = firstNumbers;
    firstNumbers = secondNumbers;
    secondNumbers = swapNumbers;
  }

  // Convert to Int32Array to avoid boxed number overhead in hot loops
  const firstArray = new Int32Array(firstNumbers);
  const secondArray = new Int32Array(secondNumbers);

  const firstLength = firstArray.length;
  const secondLength = secondArray.length;

  // Use the minimum 32-bit integer as negative infinity for DP initialization
  const integerMinimum = -2147483648;

  // Two rolling rows to reduce space complexity from O(n*m) to O(min(n,m))
  let previousRow = new Int32Array(secondLength);
  let currentRow = new Int32Array(secondLength);

  // Initialize DP base with negative infinity to enforce a non-empty subsequence
  previousRow.fill(integerMinimum);

  for (let firstIndex = 0; firstIndex < firstLength; firstIndex++) {
    const firstValue = firstArray[firstIndex];

    for (let secondIndex = 0; secondIndex < secondLength; secondIndex++) {
      const secondValue = secondArray[secondIndex];

      // Multiply the current pair as the minimal valid subsequence
      const product = firstValue * secondValue;

      let bestValue = product;

      // Extend the previous valid subsequence only if it improves the result
      if (firstIndex > 0 && secondIndex > 0) {
        const diagonalValue = previousRow[secondIndex - 1];
        if (diagonalValue > 0) {
          const extendedValue = product + diagonalValue;
          if (extendedValue > bestValue) {
            bestValue = extendedValue;
          }
        }
      }

      // Carry forward the best result by skipping the current element in nums1
      const upperValue = previousRow[secondIndex];
      if (upperValue > bestValue) {
        bestValue = upperValue;
      }

      // Carry forward the best result by skipping the current element in nums2
      if (secondIndex > 0) {
        const leftValue = currentRow[secondIndex - 1];
        if (leftValue > bestValue) {
          bestValue = leftValue;
        }
      }

      currentRow[secondIndex] = bestValue;
    }

    // Swap rows instead of reallocating to avoid GC pressure
    const swapRow = previousRow;
    previousRow = currentRow;
    currentRow = swapRow;
  }

  // The final cell contains the maximum dot product for non-empty subsequences
  return previousRow[secondLength - 1];
}
