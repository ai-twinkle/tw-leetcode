function maxFrequency(nums: number[], k: number, numOperations: number): number {
  // Guard: keep code safe even if empty (though constraints forbid it)
  if (nums.length === 0) {
    return 0;
  }

  // Use a typed array for stable numeric sort and better locality
  const sorted = Int32Array.from(nums);
  sorted.sort();

  const length = sorted.length;

  // Early path: if no operations are allowed, return longest run of equals
  if (numOperations === 0) {
    let bestFrequency = 1;
    let currentRun = 1;

    for (let index = 1; index < length; index++) {
      if (sorted[index] === sorted[index - 1]) {
        currentRun += 1;
      } else {
        if (currentRun > bestFrequency) {
          bestFrequency = currentRun;
        }
        currentRun = 1;
      }
    }

    if (currentRun > bestFrequency) {
      bestFrequency = currentRun;
    }

    return bestFrequency;
  }

  /**
   * Part A: Target an existing value v
   */
  let bestUsingExistingTarget = 1;

  // Two pointers define the inclusive-exclusive window [leftIndex, rightIndex)
  let leftIndex = 0;
  let rightIndex = 0;

  for (let groupStart = 0; groupStart < length; ) {
    const value = sorted[groupStart];

    // Find the end of this equal-value run
    let groupEnd = groupStart;
    while (groupEnd + 1 < length && sorted[groupEnd + 1] === value) {
      groupEnd += 1;
    }

    const runLength = groupEnd - groupStart + 1;

    // Tighten the left boundary so that sorted[leftIndex] >= value - k
    const lowerBound = value - k;
    while (leftIndex < length && sorted[leftIndex] < lowerBound) {
      leftIndex += 1;
    }

    // Expand the right boundary so that sorted[rightIndex - 1] <= value + k
    const upperBound = value + k;
    while (rightIndex < length && sorted[rightIndex] <= upperBound) {
      rightIndex += 1;
    }

    // Window [leftIndex, rightIndex) contains all numbers x with |x - value| ≤ k
    const windowCount = rightIndex - leftIndex;

    // Only those not already equal to value need modification
    const convertible = windowCount - runLength;

    // We can spend at most numOperations modifications
    const usable = convertible < numOperations ? convertible : numOperations;

    const candidate = runLength + (usable > 0 ? usable : 0);
    if (candidate > bestUsingExistingTarget) {
      bestUsingExistingTarget = candidate;
    }

    // Move to the next distinct value
    groupStart = groupEnd + 1;
  }

  /**
   * Part B: Target any integer (not necessarily in nums)
   * -> Find the largest window with max - min ≤ 2k
   */
  let bestWindowSize = 1;
  let windowLeft = 0;

  const spreadLimit = k * 2;

  for (let windowRight = 0; windowRight < length; windowRight++) {
    // Shrink from the left until spread fits
    while (sorted[windowRight] - sorted[windowLeft] > spreadLimit) {
      windowLeft += 1;
    }

    const windowSize = windowRight - windowLeft + 1;
    if (windowSize > bestWindowSize) {
      bestWindowSize = windowSize;
    }
  }

  // If the target is not present, every contributor must be modified
  const bestUsingArbitraryTarget =
    numOperations < bestWindowSize ? numOperations : bestWindowSize;

  // Final result: choose the better of the two strategies
  return bestUsingExistingTarget > bestUsingArbitraryTarget
    ? bestUsingExistingTarget
    : bestUsingArbitraryTarget;
}
