// Maximum value of n per problem constraints
const MAX_N: number = 10000;

// Digit classification lookup: -1 = invalid, 0 = self-rotates (0,1,8), 1 = changes (2,5,6,9)
// Indexed by digit 0-9 for O(1) access
const DIGIT_TYPE: Int8Array = new Int8Array([0, 0, 1, -1, -1, 1, 1, -1, 0, 1]);

// Prefix sum table: PREFIX_GOOD_COUNT[i] = number of good integers in [1, i]
// Precomputed once at module load for O(1) query time
const PREFIX_GOOD_COUNT: Int32Array = new Int32Array(MAX_N + 1);

// Precompute the prefix sum of good integers across the full range
(function precomputeGoodIntegers(): void {
  let runningCount: number = 0;
  for (let currentNumber = 1; currentNumber <= MAX_N; currentNumber++) {
    let remainingDigits = currentNumber;
    let hasChangingDigit = 0;
    let isValid = 1;
    // Extract digits via integer division to avoid string conversion overhead
    while (remainingDigits > 0) {
      const digitType = DIGIT_TYPE[remainingDigits % 10];
      if (digitType < 0) {
        // Found an invalid digit (3, 4, or 7), this number cannot be good
        isValid = 0;
        break;
      }
      // Track whether at least one digit changes on rotation
      hasChangingDigit |= digitType;
      remainingDigits = (remainingDigits / 10) | 0;
    }
    // A number is good only if all digits are valid AND at least one digit changes
    runningCount += isValid & hasChangingDigit;
    PREFIX_GOOD_COUNT[currentNumber] = runningCount;
  }
})();

/**
 * Counts good integers in the range [1, n] where a good integer becomes a
 * different valid number after rotating each digit 180 degrees.
 * @param n The upper bound of the range, inclusive (1 <= n <= 10^4).
 * @return The count of good integers in [1, n].
 */
function rotatedDigits(n: number): number {
  // Direct O(1) lookup from the precomputed prefix sum table
  return PREFIX_GOOD_COUNT[n];
}
