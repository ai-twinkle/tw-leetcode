const MAXIMUM_SUM = 300;

// Precompute DP tables for all exponents 1..5 once, to enable O(1) queries later.
const PRECOMPUTED_DYNAMIC_PROGRAMMING: Int32Array[] = new Array(6);
PRECOMPUTED_DYNAMIC_PROGRAMMING[0] = new Int32Array(MAXIMUM_SUM + 1); // Unused sentinel

for (let exponent = 1; exponent <= 5; exponent++) {
  PRECOMPUTED_DYNAMIC_PROGRAMMING[exponent] = buildDynamicProgrammingForExponent(exponent);
}

/**
 * Build the DP table for a fixed exponent.
 * dynamicProgramming[s] = number of ways to represent s as sum of distinct x-th powers (<= MAXIMUM_SUM).
 */
function buildDynamicProgrammingForExponent(exponent: number): Int32Array {
  const MODULUS = 1_000_000_007;

  // Count and collect all x-th powers <= MAXIMUM_SUM using integer arithmetic with early exit.
  const count = countPowersUpToLimit(exponent, MAXIMUM_SUM);
  const powers = new Uint16Array(count);
  for (let base = 1, index = 0; index < count; base++) {
    const value = integerPowerLimited(base, exponent, MAXIMUM_SUM);
    if (value <= MAXIMUM_SUM) {
      powers[index++] = value;
    }
  }

  // 1D DP over sums, descending to ensure each power is used at most once (uniqueness).
  const dynamicProgramming = new Int32Array(MAXIMUM_SUM + 1);
  dynamicProgramming[0] = 1;

  const modulus = MODULUS;
  for (let i = 0; i < powers.length; i++) {
    const powerValue = powers[i];
    for (let currentSum = MAXIMUM_SUM; currentSum >= powerValue; currentSum--) {
      const candidate = dynamicProgramming[currentSum] + dynamicProgramming[currentSum - powerValue];
      dynamicProgramming[currentSum] = candidate >= modulus ? candidate - modulus : candidate;
    }
  }
  return dynamicProgramming;
}

/**
 * Returns how many bases produce base^exponent <= limit.
 */
function countPowersUpToLimit(exponent: number, limit: number): number {
  let count = 0;
  for (let base = 1; ; base++) {
    if (integerPowerLimited(base, exponent, limit) > limit) {
      break;
    }
    count++;
  }
  return count;
}

/**
 * Computes base^exponent as an integer; if it exceeds 'limit' at any step, returns limit+1 immediately.
 * This avoids floating-point Math.pow overhead and prevents unnecessary multiplications.
 */
function integerPowerLimited(base: number, exponent: number, limit: number): number {
  let value = 1;
  for (let i = 0; i < exponent; i++) {
    value *= base;
    if (value > limit) {
      return limit + 1;
    }
  }
  return value;
}

/**
 * Return the number of ways n can be expressed as the sum of distinct x-th powers.
 * Runs in O(1) time thanks to precomputation; uses typed arrays for low overhead.
 */
function numberOfWays(n: number, x: number): number {
  // Constraints guarantee 1 <= x <= 5 and 1 <= n <= 300.
  // Guard is kept for robustness; returns 0 for out-of-range exponent.
  if (x < 1 || x > 5) {
    return 0;
  }
  return PRECOMPUTED_DYNAMIC_PROGRAMMING[x][n]; // Already reduced modulo during build.
}
