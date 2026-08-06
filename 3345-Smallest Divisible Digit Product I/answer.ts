/** Maximum value of n allowed by the problem constraints. */
const MAXIMUM_N = 100;

/** Maximum value of t allowed by the problem constraints. */
const MAXIMUM_T = 10;

/**
 * Builds the complete answer lookup table for every (n, t) pair in the constraints.
 * @returns A flat Uint8Array of MAXIMUM_N * MAXIMUM_T precomputed answers.
 */
function buildAnswerTable(): Uint8Array {
  const table = new Uint8Array(MAXIMUM_N * MAXIMUM_T);
  const digitProducts = new Uint8Array(MAXIMUM_N + 1);

  // Digit product of every candidate; the largest possible value is 9 * 9 = 81, so a byte suffices.
  for (let value = 1; value <= MAXIMUM_N; value++) {
    let product = 1;
    let remaining = value;

    while (remaining > 0) {
      product *= remaining % 10;
      remaining = (remaining / 10) | 0;
    }

    digitProducts[value] = product;
  }

  // Sweep downwards so each n reuses the answer already resolved for n + 1 (suffix minimum).
  for (let divisor = 1; divisor <= MAXIMUM_T; divisor++) {
    // 100 has a zero digit, so its product is 0 and it is always a valid fallback.
    let bestSoFar = MAXIMUM_N;

    for (let value = MAXIMUM_N; value >= 1; value--) {
      if (digitProducts[value] % divisor === 0) {
        bestSoFar = value;
      }

      table[(value - 1) * MAXIMUM_T + (divisor - 1)] = bestSoFar;
    }
  }

  return table;
}

/** Precomputed answers, indexed by (n - 1) * MAXIMUM_T + (t - 1). */
const answerTable = buildAnswerTable();

/**
 * Returns the smallest number greater than or equal to n whose digit product is divisible by t.
 * @param n The lower bound of the search.
 * @param t The required divisor of the digit product.
 * @returns The smallest qualifying number, resolved in O(1) from the precomputed table.
 */
function smallestNumber(n: number, t: number): number {
  return answerTable[(n - 1) * MAXIMUM_T + (t - 1)];
}
