/** Largest possible digit sum for any value in the constraint range 0..1000 (from 999). */
const MAXIMUM_DIGIT_SUM = 27;

/**
 * Builds a lookup table of digit sums for every value in the constraint range.
 * @returns A Uint8Array where index v holds the digit sum of v.
 */
function buildDigitSumTable(): Uint8Array {
  const table = new Uint8Array(1001);

  // Each value reuses the already-computed sum of itself without its last digit.
  for (let value = 1; value <= 1000; value++) {
    table[value] = (value % 10) + table[(value / 10) | 0];
  }

  return table;
}

// Precomputed once at module load so every call is a pure O(1) table read.
const DIGIT_SUM_TABLE = buildDigitSumTable();

/**
 * Finds the smallest index whose value has a digit sum equal to that index.
 * @param nums The input array of integers.
 * @returns The smallest matching index, or -1 when none exists.
 */
function smallestIndex(nums: number[]): number {
  const length = nums.length;

  // Indices above the maximum achievable digit sum can never match, so cap the scan.
  const scanLimit = length < MAXIMUM_DIGIT_SUM + 1 ? length : MAXIMUM_DIGIT_SUM + 1;

  for (let index = 0; index < scanLimit; index++) {
    if (DIGIT_SUM_TABLE[nums[index]] === index) {
      return index;
    }
  }

  return -1;
}
