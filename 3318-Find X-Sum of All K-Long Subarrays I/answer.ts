/**
 * Compute the x-sum for a window using frequency counts.
 * It scans frequencies from high to low, and for each frequency scans values from high to low,
 * which naturally enforces the tie-breaker: higher value first when counts are equal.
 *
 * @param frequencyCounts Typed counts indexed by value (1...maximumValue)
 * @param maximumValue Maximum value present in nums (<= 50)
 * @param topX Number of distinct values to keep
 * @param windowSize Current window size k
 * @returns The x-sum for the current window
 */
function computeTopXSum(frequencyCounts: Uint16Array, maximumValue: number, topX: number, windowSize: number): number {
  let selectedKinds = 0;
  let sum = 0;

  for (let freq = windowSize; freq >= 1; freq -= 1) {
    for (let value = maximumValue; value >= 1; value -= 1) {
      if (frequencyCounts[value] === freq) {
        sum += freq * value;
        selectedKinds += 1;

        if (selectedKinds === topX) {
          return sum;
        }
      }
    }
  }

  // If we did not reach topX, it means the window has fewer than x distinct values.
  // sum already equals the full window sum in this case.
  return sum;
}

/**
 * Return an array where answer[i] is the x-sum of nums[i...i+k-1].
 *
 * - Uses a typed array (Uint16Array) for frequency counts to reduce overhead.
 * - Maintains window sum and distinct count for O(1) fast paths.
 * - Enforces tie-break (bigger value wins on equal frequency) by scanning values high→low.
 *
 * @param nums Input array
 * @param k Window size
 * @param x Keep the top x most frequent values (tie-break by larger value)
 * @returns Array of x-sums for each window
 */
function findXSum(nums: number[], k: number, x: number): number[] {
  // Find the maximum value to bound loops tightly
  let maximumValue = 1;
  for (let i = 0; i < nums.length; i += 1) {
    if (nums[i] > maximumValue) {
      maximumValue = nums[i];
    }
  }

  // Frequency counts for values 1...maximumValue
  const frequencyCounts = new Uint16Array(maximumValue + 1);

  const n = nums.length;
  const resultLength = n - k + 1;
  const answer = new Array(resultLength);

  // Track current window sum and number of distinct values
  let currentWindowSum = 0;
  let currentDistinctCount = 0;

  // Build the initial window
  for (let i = 0; i < k; i += 1) {
    const value = nums[i];

    if (frequencyCounts[value] === 0) {
      currentDistinctCount += 1;
    }
    frequencyCounts[value] += 1;
    currentWindowSum += value;
  }

  // Compute x-sum for the initial window
  if (currentDistinctCount <= x) {
    answer[0] = currentWindowSum;
  } else {
    answer[0] = computeTopXSum(frequencyCounts, maximumValue, x, k);
  }

  // Slide the window
  for (let startIndex = 1; startIndex < resultLength; startIndex += 1) {
    const outgoingValue = nums[startIndex - 1];
    const incomingValue = nums[startIndex + k - 1];

    // Remove outgoing element
    frequencyCounts[outgoingValue] -= 1;
    if (frequencyCounts[outgoingValue] === 0) {
      currentDistinctCount -= 1;
    }
    currentWindowSum -= outgoingValue;

    // Add incoming element
    if (frequencyCounts[incomingValue] === 0) {
      currentDistinctCount += 1;
    }
    frequencyCounts[incomingValue] += 1;
    currentWindowSum += incomingValue;

    // Fast path if distinct ≤ x, else compute with top-x scan
    if (currentDistinctCount <= x) {
      answer[startIndex] = currentWindowSum;
    } else {
      answer[startIndex] = computeTopXSum(frequencyCounts, maximumValue, x, k);
    }
  }

  return answer;
}
