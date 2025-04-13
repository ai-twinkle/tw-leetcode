/**
 * Count Good Numbers
 * @param {bigint} base - The base number to be raised to the power.
 * @param {bigint} exponent - The exponent to which the base is raised.
 * @param {bigint} mod - The modulus to be used for the operation.
 * @returns {bigint} - The result of (base^exponent) % mod.
 */
function modPow(base: bigint, exponent: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  while (exponent > 0n) {
    // If the least significant bit of exponent is 1, multiply result by base.
    if (exponent % 2n === 1n) {
      result = (result * base) % mod;
    }
    // Square the base and cut the exponent in half.
    base = (base * base) % mod;
    exponent = exponent / 2n;
  }
  return result;
}

/**
 * Count Good Numbers
 * @param {number} n - The length of the number to be formed.
 * @returns {number} - The count of good numbers of length n modulo 10^9 + 7.
 */
function countGoodNumbers(n: number): number {
  const MOD = 1000000007n;
  const evenCount = 5n; // possible digits: 0, 2, 4, 6, 8
  const oddCount  = 4n; // possible digits: 2, 3, 5, 7

  // Convert half-length to BigInt
  const half = BigInt(Math.floor(n / 2));

  if (n % 2 === 0) {
    // For even n, there are equal count of even-indexed and odd-indexed digits.
    // The answer is (evenCount * oddCount)^(n/2) modulo MOD.
    return Number(modPow(evenCount * oddCount, half, MOD));
  } else {
    // For odd n, there is one extra even-indexed digit (at index 0).
    // Multiply by evenCount to account for that extra position.
    return Number((modPow(evenCount * oddCount, half, MOD) * evenCount) % MOD);
  }
}
