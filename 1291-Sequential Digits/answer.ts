// Pre-compute every possible sequential-digit number once, outside the function.
// The digit sequence 123456789 yields only 36 such numbers total (lengths 2..9).
const ALL_SEQUENTIAL_DIGITS: Int32Array = (function buildSequentialDigits(): Int32Array {
  const digitSource = "123456789";
  const collected: number[] = [];

  // Each starting index and length produces one sequential number.
  for (let length = 2; length <= 9; length++) {
    for (let start = 0; start + length <= 9; start++) {
      collected.push(Number(digitSource.substring(start, start + length)));
    }
  }

  // Sort ascending so range queries can slice directly.
  collected.sort((first, second) => first - second);
  return Int32Array.from(collected);
})();

/**
 * Returns all sequential-digit integers within the inclusive range.
 * @param low Lower bound of the range.
 * @param high Upper bound of the range.
 * @returns Sorted array of sequential-digit integers in [low, high].
 */
function sequentialDigits(low: number, high: number): number[] {
  const result: number[] = [];

  // Single linear pass over the tiny pre-computed table.
  for (let index = 0; index < ALL_SEQUENTIAL_DIGITS.length; index++) {
    const candidate = ALL_SEQUENTIAL_DIGITS[index];

    // The table is sorted, so we can stop once we pass the upper bound.
    if (candidate > high) {
      break;
    }

    if (candidate >= low) {
      result.push(candidate);
    }
  }

  return result;
}
