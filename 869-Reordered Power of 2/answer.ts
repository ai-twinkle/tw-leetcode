// Precompute base-11 powers for digits 0..9 (typed array for speed & cache locality)
const BASE_ELEVEN_POWERS = new Float64Array(10);
BASE_ELEVEN_POWERS[0] = 1;
for (let index = 1; index < 10; index++) {
  BASE_ELEVEN_POWERS[index] = BASE_ELEVEN_POWERS[index - 1] * 11;
}

/**
 * Compute a collision-free "digit-count signature" in base 11.
 * For a number x with digit counts c[d], signature = Σ c[d] * 11^d.
 * Incrementing the count of digit d just adds 11^d — so no arrays needed.
 */
function computeDigitCountSignatureBase11(value: number): number {
  let signature = 0;
  while (value > 0) {
    signature += BASE_ELEVEN_POWERS[(value % 10) | 0];
    value = (value / 10) | 0; // Integer divide by 10
  }
  return signature;
}

// Precompute all power-of-two signatures up to 1e9 (once, outside the function)
const POWER_OF_TWO_SIGNATURES = (() => {
  const maxLimit = 1_000_000_000;
  const set = new Set<number>();
  let current = 1;
  while (current <= maxLimit) {
    set.add(computeDigitCountSignatureBase11(current));
    current <<= 1;
  }
  return set;
})();

function reorderedPowerOf2(n: number): boolean {
  // O(d) time, O(1) extra space per call; membership is O(1)
  return POWER_OF_TWO_SIGNATURES.has(computeDigitCountSignatureBase11(n));
}
