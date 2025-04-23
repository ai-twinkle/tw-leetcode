/**
 * Maximum `n` supported by our caches.
 */
const MAX_INPUT_VALUE = 10000;

/**
 * digitSumArray[x] = sum of decimal digits of x, for x = 0…MAX_INPUT_VALUE
 */
const digitSumArray = new Uint8Array(MAX_INPUT_VALUE + 1);

/**
 * largestGroupCountCache[n] = count of digit-sum groups
 * that hit the maximum size among [1…n].
 */
const largestGroupCountCache = new Uint16Array(MAX_INPUT_VALUE + 1);

/**
 * Pre–compute digit sums via DP:
 *   sum(x) = sum(floor(x/10)) + (x % 10)
 */
for (let value = 1; value <= MAX_INPUT_VALUE; value++) {
  // Divide by 10 (integer) to peel off the last digit
  const quotient = (value / 10) | 0;
  // Compute last digit without `%` for performance
  const lastDigit = value - quotient * 10;
  // Build on previously computed sum
  digitSumArray[value] = digitSumArray[quotient] + lastDigit;
}

/**
 * Determine the highest digit-sum observed in our range.
 */
let observedMaxDigitSum = 0;
for (let value = 1; value <= MAX_INPUT_VALUE; value++) {
  const sum = digitSumArray[value];
  if (sum > observedMaxDigitSum) {
    observedMaxDigitSum = sum;  // track max for array sizing
  }
}

/**
 * Pre–fill largestGroupCountCache using a single sweep:
 * - groupSizeBySum[s] tracks counts per digit-sum
 * - currentLargestSize and currentCountOfLargest update on the fly
 */
(function () {
  // Enough size to cover all possible sums (0…observedMaxDigitSum)
  const groupSizeBySum = new Uint16Array(observedMaxDigitSum + 1);
  let currentLargestSize = 0;
  let currentCountOfLargest = 0;

  for (let value = 1; value <= MAX_INPUT_VALUE; value++) {
    const sum = digitSumArray[value];
    const newSize = ++groupSizeBySum[sum];  // increment bucket count

    if (newSize > currentLargestSize) {
      // Found a bigger group: reset largest count
      currentLargestSize = newSize;
      currentCountOfLargest = 1;
    } else if (newSize === currentLargestSize) {
      // Another group matches the current max size
      currentCountOfLargest++;
    }

    // Cache result for this `value` in O(1)
    largestGroupCountCache[value] = currentCountOfLargest;
  }
})();

/**
 * Each integer in [1…n] is grouped by its digit-sum.
 * @param {number} n – upper bound of the range [1…n]
 * @returns {number} how many groups reach the maximum size
 */
function countLargestGroup(n: number): number {
  if (n < 1 || n > MAX_INPUT_VALUE) {
    throw new RangeError(
      `Argument 'n' must be between 1 and ${MAX_INPUT_VALUE}.`
    );
  }
  // Instant O(1) lookup of precomputed answer
  return largestGroupCountCache[n];
}
