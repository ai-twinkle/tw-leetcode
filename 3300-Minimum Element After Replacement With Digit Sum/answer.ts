// Pre-compute digit sums for all values up to 10^4 for O(1) lookup across all invocations
const MAX_DIGIT_SUM_VALUE = 10001;
const digitSumTable = new Uint8Array(MAX_DIGIT_SUM_VALUE);
for (let value = 1; value < MAX_DIGIT_SUM_VALUE; value++) {
  // Recurrence reuses previously computed sums, avoiding per-value digit-loop
  digitSumTable[value] = digitSumTable[(value / 10) | 0] + (value % 10);
}

/**
 * Replaces each element with the sum of its digits and returns the minimum.
 * @param nums - Array of positive integers, each at most 10^4
 * @returns The smallest digit sum among the replaced elements
 */
function minElement(nums: number[]): number {
  const length = nums.length;
  // 36 is the maximum possible digit sum for any value within the constraint (e.g., 9999 -> 36)
  let minimum = 36;

  for (let index = 0; index < length; index++) {
    const currentSum = digitSumTable[nums[index]];
    if (currentSum < minimum) {
      minimum = currentSum;
      // Early exit: 1 is the smallest possible digit sum for any positive integer
      if (minimum === 1) {
        return 1;
      }
    }
  }

  return minimum;
}
