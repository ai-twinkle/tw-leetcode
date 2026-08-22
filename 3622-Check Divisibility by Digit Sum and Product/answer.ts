/** Size of one digit block; n is split as highBlock * BLOCK_SIZE + lowBlock. */
const BLOCK_SIZE = 1000;

/** Highest block index reachable, since n <= 10^6 gives floor(n / 1000) <= 1000. */
const HIGH_BLOCK_COUNT = 1001;

/** digitSumTable[value] = sum of the decimal digits of value. */
const digitSumTable = new Int32Array(HIGH_BLOCK_COUNT);

/** digitProductTable[value] = product of the decimal digits of value, without leading zeros. */
const digitProductTable = new Int32Array(HIGH_BLOCK_COUNT);

/** digitProductPaddedTable[value] = product of value written as exactly three digits ("007" -> 0). */
const digitProductPaddedTable = new Int32Array(BLOCK_SIZE);

// Neutral seeds: an empty digit list sums to 0 and multiplies to 1, which makes the
// recurrence below correct for single-digit values (index 0 is never queried directly).
digitSumTable[0] = 0;
digitProductTable[0] = 1;

// Build the natural tables incrementally: every value reuses the result of value / 10.
for (let value = 1; value < HIGH_BLOCK_COUNT; value++) {
  const quotient = (value / 10) | 0;
  const lastDigit = value - quotient * 10;

  digitSumTable[value] = digitSumTable[quotient] + lastDigit;
  digitProductTable[value] = digitProductTable[quotient] * lastDigit;
}

// Build the zero-padded table: leading zeros are genuine digits of n, so they zero the product.
for (let value = 0; value < BLOCK_SIZE; value++) {
  const hundredsDigit = (value / 100) | 0;
  const tensDigit = ((value / 10) | 0) - hundredsDigit * 10;
  const unitsDigit = value - ((value / 10) | 0) * 10;

  digitProductPaddedTable[value] = hundredsDigit * tensDigit * unitsDigit;
}

/**
 * Determines whether n is divisible by the sum of its digit sum and its digit product.
 *
 * @param n - A positive integer in the range [1, 10^6].
 * @returns True when n is divisible by (digit sum + digit product), otherwise false.
 */
function checkDivisibility(n: number): boolean {
  // Small values fit in a single block, so one lookup pair already answers the query.
  if (n < BLOCK_SIZE) {
    const smallDivisor = digitSumTable[n] + digitProductTable[n];

    return n % smallDivisor === 0;
  }

  const highBlock = (n / BLOCK_SIZE) | 0;
  const lowBlock = n - highBlock * BLOCK_SIZE;

  // Digit sum is additive across blocks; the digit product uses the padded low block
  // so that the low block's leading zeros are counted as actual digits of n.
  const divisor =
    digitSumTable[highBlock] +
    digitSumTable[lowBlock] +
    digitProductTable[highBlock] * digitProductPaddedTable[lowBlock];

  return n % divisor === 0;
}
