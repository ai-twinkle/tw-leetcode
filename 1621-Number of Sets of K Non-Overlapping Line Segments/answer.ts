const MODULUS = 1_000_000_007;
const MAX_INDEX = 2000;

/**
 * Multiplies two residues modulo MODULUS without exceeding double precision.
 * @param left - First residue in [0, MODULUS)
 * @param right - Second residue in [0, MODULUS)
 * @returns (left * right) mod MODULUS
 */
function multiplyModulo(left: number, right: number): number {
  // Split right into 16-bit halves so each partial product stays below 2^47
  const highPart = ((left * (right >>> 16)) % MODULUS) * 65536;
  const lowPart = left * (right & 65535);
  return (highPart + lowPart) % MODULUS;
}

/**
 * Computes base^exponent modulo MODULUS by binary exponentiation.
 * @param base - Residue in [0, MODULUS)
 * @param exponent - Non-negative integer exponent
 * @returns base^exponent mod MODULUS
 */
function powerModulo(base: number, exponent: number): number {
  let result = 1;
  let currentBase = base;
  let remainingExponent = exponent;
  while (remainingExponent > 0) {
    if (remainingExponent & 1) {
      result = multiplyModulo(result, currentBase);
    }
    currentBase = multiplyModulo(currentBase, currentBase);
    remainingExponent >>>= 1;
  }
  return result;
}

const factorial = new Int32Array(MAX_INDEX + 1);
const inverseFactorial = new Int32Array(MAX_INDEX + 1);

// Precompute factorials once at module load
factorial[0] = 1;
for (let index = 1; index <= MAX_INDEX; index++) {
  factorial[index] = multiplyModulo(factorial[index - 1], index);
}

// Fermat's little theorem gives the inverse of the largest factorial, then walk downward
inverseFactorial[MAX_INDEX] = powerModulo(factorial[MAX_INDEX], MODULUS - 2);
for (let index = MAX_INDEX; index > 0; index--) {
  inverseFactorial[index - 1] = multiplyModulo(inverseFactorial[index], index);
}

/**
 * Counts ways to draw exactly k non-overlapping segments on n integer points.
 * @param n - Number of points on the line
 * @param k - Number of segments to draw
 * @returns Number of valid configurations modulo 1e9 + 7
 */
function numberOfSets(n: number, k: number): number {
  const total = n + k - 1;
  const chosen = 2 * k;
  if (chosen > total) {
    return 0;
  }

  // Answer equals C(n + k - 1, 2k) after expanding shared endpoints into distinct slots
  return multiplyModulo(
    multiplyModulo(factorial[total], inverseFactorial[chosen]),
    inverseFactorial[total - chosen]
  );
}
