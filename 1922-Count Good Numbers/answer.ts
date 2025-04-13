/**
 * Optimized Modular Exponentiation using BigInt.
 * Computes (base^exponent) % mod.
 *
 * @param {bigint} base - The base number.
 * @param {bigint} exponent - The exponent to which the base is raised.
 * @param {bigint} mod - The modulus.
 * @returns {bigint} - The result of (base^exponent) % mod.
 */
function modPow(base: bigint, exponent: bigint, mod: bigint): bigint {
  let result = 1n;
  base %= mod;
  while (exponent > 0n) {
    // Use bitwise AND to check if the exponent is odd.
    if (exponent & 1n) {
      result = (result * base) % mod;
    }
    // Square the base and shift the exponent one bit right.
    base = (base * base) % mod;
    exponent >>= 1n;
  }
  return result;
}

/**
 * Count Good Numbers
 * @param {number} n - The length of the digit string to be formed.
 * @returns {number} - The count of good numbers of length n modulo 10^9 + 7.
 */
function countGoodNumbers(n: number): number {
  const MOD = 1000000007n;
  const evenCount = 5n; // Even-indexed digits (0, 2, 4, 6, 8)
  const oddCount  = 4n; // Odd-indexed digits (2, 3, 5, 7)

  // Pre-compute the base for exponentiation.
  const baseVal = evenCount * oddCount;
  const half = BigInt(Math.floor(n / 2));

  const power = modPow(baseVal, half, MOD);
  // For odd n, multiply by evenCount for the extra even-indexed digit.
  return Number(n % 2 === 0 ? power : (power * evenCount) % MOD);
}
