/**
 * Precomputed powers of 1000 at which a number gains an additional comma.
 * Stored as doubles because 1e12 and 1e15 exceed the 32-bit integer range.
 */
const COMMA_THRESHOLDS = new Float64Array([1e3, 1e6, 1e9, 1e12, 1e15]);

/**
 * Counts the total commas used when writing every integer from 1 to n in standard formatting.
 * @param n The upper bound of the range (1 <= n <= 10^15).
 * @returns The total number of commas across all integers in [1, n].
 */
function countCommas(n: number): number {
  let totalCommas = 0;

  for (let index = 0; index < COMMA_THRESHOLDS.length; index++) {
    const threshold = COMMA_THRESHOLDS[index];

    // Thresholds are ascending, so once n is below one it is below all remaining ones
    if (n < threshold) {
      break;
    }

    // Every integer in [threshold, n] contributes exactly one comma for this threshold
    totalCommas += n - threshold + 1;
  }

  return totalCommas;
}
