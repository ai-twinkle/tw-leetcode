const MOD = 1_000_000_007;
const MAX_N = 100_000;

// Precompute factorials and inverse-factorials modulo MOD using Uint32Array for efficiency
const factorial = new Uint32Array(MAX_N + 1);
const inverseFactorial = new Uint32Array(MAX_N + 1);

// Initialize factorial and inverse-factorial tables
(function initializeFactorials(): void {
  factorial[0] = 1;
  for (let i = 1; i <= MAX_N; i++) {
    factorial[i] = (factorial[i - 1] * i) % MOD;
  }
  // Compute inverse factorial of MAX_N using Fermat's little theorem
  inverseFactorial[MAX_N] = modularExponentiation(factorial[MAX_N], MOD - 2);
  // Fill downwards for all values
  for (let i = MAX_N; i >= 1; i--) {
    inverseFactorial[i - 1] = (inverseFactorial[i] * i) % MOD;
  }
})();

/**
 * Computes (a * b) % MOD efficiently, avoiding JS number overflow.
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number} (a * b) % MOD
 */
function multiplyModulo(a: number, b: number): number {
  let result = 0;
  let x = a % MOD;
  let y = b;
  while (y > 0) {
    if (y & 1) {
      result += x;
      if (result >= MOD) {
        result -= MOD;
      }
    }
    x <<= 1;
    if (x >= MOD) {
      x -= MOD;
    }
    y >>>= 1;
  }
  return result;
}

/**
 * Computes (base ^ exponent) % MOD using fast exponentiation.
 * @param {number} base - The base
 * @param {number} exponent - The exponent
 * @returns {number} base^exponent % MOD
 */
function modularExponentiation(base: number, exponent: number): number {
  let result = 1;
  let b = base % MOD;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = multiplyModulo(result, b);
    b = multiplyModulo(b, b);
    e >>>= 1;
  }
  return result;
}

/**
 * Counts the number of "good arrays" of length n,
 * with values from 1 to m, and exactly k adjacent-equal pairs.
 * @param {number} n - Length of the array
 * @param {number} m - Range of values (1 to m)
 * @param {number} k - Number of adjacent-equal pairs
 * @returns {number} The count of good arrays modulo 1e9+7
 */
function countGoodArrays(n: number, m: number, k: number): number {
  if (k < 0 || k > n - 1) {
    return 0; // Impossible case
  }

  // C(n-1, k) mod MOD
  const partial = multiplyModulo(inverseFactorial[k], inverseFactorial[n - 1 - k]);
  const combinationCount = multiplyModulo(factorial[n - 1], partial);

  // (m-1)^(n-1-k) mod MOD
  const powerTerm = modularExponentiation(m - 1, n - 1 - k);

  // Combine: m * C(n-1, k) * (m-1)^(n-1-k) % MOD
  // Safe direct multiply: m <= 1e5, product < 1e9
  return (m * multiplyModulo(combinationCount, powerTerm)) % MOD;
}
