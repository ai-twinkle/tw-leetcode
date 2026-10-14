/** Character codes for digits, avoiding a numeric-to-string conversion at runtime. */
const DIGIT_CHARACTERS: readonly string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Builds the `num`-digit number with digit sum `sum` that maximizes the sum of
 * squares of its digits, choosing the numerically largest one on ties.
 *
 * @param num - Exact number of digits the result must have.
 * @param sum - Exact digit sum the result must have.
 * @returns The optimal number as a string, or an empty string when none exists.
 */
function maxSumOfSquares(num: number, sum: number): string {
  // No num-digit number can carry more than 9 per digit.
  if (sum > 9 * num) {
    return '';
  }

  // Sum of squares is Schur-convex, so the most unequal multiset wins: all 9s plus one remainder.
  const nineCount = (sum / 9) | 0;
  const remainderDigit = sum - nineCount * 9;

  // Largest number for a fixed multiset is its digits in descending order.
  const nines = nineCount > 0 ? '9'.repeat(nineCount) : '';

  if (remainderDigit === 0) {
    const zeroCount = num - nineCount;
    return zeroCount > 0 ? nines + '0'.repeat(zeroCount) : nines;
  }

  const zeroCount = num - nineCount - 1;
  const head = nines + DIGIT_CHARACTERS[remainderDigit];

  return zeroCount > 0 ? head + '0'.repeat(zeroCount) : head;
}
