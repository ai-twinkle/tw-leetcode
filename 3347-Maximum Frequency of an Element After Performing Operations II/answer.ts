function maxFrequency(nums: number[], k: number, numOperations: number): number {
  // Guard: if array is empty, no frequency possible
  if (nums.length === 0) {
    return 0;
  }

  // Use typed array for consistent numeric operations and locality
  const arr = Int32Array.from(nums);
  arr.sort(); // Numeric sort for ascending order

  const n = arr.length;

  /**
   * Case A — Arbitrary target value
   * Find the largest subset with max-min ≤ 2k (all intervals overlap).
   * Each element in that subset could be shifted to the same value.
   */
  let leftPointer = 0;
  let maxWithinRange = 1;

  // Sliding window to find the largest interval span ≤ 2k
  for (let rightPointer = 0; rightPointer < n; rightPointer++) {
    while (arr[rightPointer] - arr[leftPointer] > 2 * k) {
      leftPointer += 1; // Shrink window from left until condition fits
    }
    const windowSize = rightPointer - leftPointer + 1;
    if (windowSize > maxWithinRange) {
      maxWithinRange = windowSize; // Update largest valid subset
    }
  }

  // If arbitrary target chosen, we can modify at most numOperations elements
  const bestArbitrary = Math.min(maxWithinRange, numOperations);

  /**
   * Case B — Target equals an existing value in the array
   * For each distinct value v:
   *   - Find how many numbers already equal v.
   *   - Count how many fall inside [v - k, v + k].
   *   - Compute achievable frequency using numOperations conversions.
   */
  let bestExisting = 1;
  let leftBound = 0;
  let rightBound = -1;
  let startIndex = 0;

  // Iterate over groups of identical values
  while (startIndex < n) {
    let endIndex = startIndex;
    const value = arr[startIndex];

    // Find the range of equal values
    while (endIndex + 1 < n && arr[endIndex + 1] === value) {
      endIndex += 1;
    }

    // Compute the allowed numeric range for transformation
    const minAllowed = value - k;
    const maxAllowed = value + k;

    // Move leftBound to maintain arr[leftBound] >= minAllowed
    while (leftBound < n && arr[leftBound] < minAllowed) {
      leftBound += 1;
    }

    // Expand rightBound while arr[rightBound] <= maxAllowed
    while (rightBound + 1 < n && arr[rightBound + 1] <= maxAllowed) {
      rightBound += 1;
    }

    // Number of existing occurrences of this value
    const countEqual = endIndex - startIndex + 1;

    // Total elements within transformable range
    const totalWithin = rightBound >= leftBound ? (rightBound - leftBound + 1) : 0;

    // Elements that could be converted to value
    const convertible = totalWithin > countEqual ? (totalWithin - countEqual) : 0;

    // Potential frequency if we pick this value as target
    const candidate = countEqual + Math.min(numOperations, convertible);
    if (candidate > bestExisting) {
      bestExisting = candidate; // Update best found so far
    }

    // Move to the next distinct value group
    startIndex = endIndex + 1;
  }

  // The final result combines both strategies; cannot exceed total elements
  const best = Math.max(bestExisting, bestArbitrary);
  return best < n ? best : n;
}
