const MODULO = 1000000007n;
const MAX_N = 10010;
const MAX_PRIME_FACTORS = 15;

// ———— Preallocated, typed buffers for max efficiency ————

/** Minimum prime factor for each integer in [0…MAX_N) */
const minimumPrimeFactor = new Uint16Array(MAX_N);

/** Flattened list of all prime‑exponent counts, for values 0…MAX_N */
let primeExponentsFlat: Uint8Array;
/** Offsets into `primeExponentsFlat` for each value */
const primeExponentsOffset = new Int32Array(MAX_N + 1);

/** combinationCoefficients[i][j] = C(i, j) mod MODULO, stored as BigInt */
const combinationCoefficients: bigint[][] = new Array(MAX_N + MAX_PRIME_FACTORS);

/** One‑time precompute of:
 *  1. Sieve of min‑prime factors
 *  2. Prime‑exponent counts for each number
 *  3. Flattening those counts into typed arrays
 *  4. Pascal’s triangle (n choose k) up to [MAX_N + MAX_P][MAX_P]
 */
(function precomputeAll() {
  // 1. Sieve
  for (let v = 2; v < MAX_N; v++) {
    if (minimumPrimeFactor[v] === 0) {
      for (let m = v; m < MAX_N; m += v) {
        if (minimumPrimeFactor[m] === 0) {
          minimumPrimeFactor[m] = v;
        }
      }
    }
  }

  // 2. Gather exponent lists in a temporary JS array
  const tempExponents: number[][] = Array.from({ length: MAX_N }, () => []);
  for (let v = 2; v < MAX_N; v++) {
    let x = v;
    while (x > 1) {
      const p = minimumPrimeFactor[x];
      let cnt = 0;
      do {
        x = Math.floor(x / p);
        cnt++;
      } while (minimumPrimeFactor[x] === p);
      tempExponents[v].push(cnt);
    }
  }

  // 3. Flatten into a single Uint8Array
  let totalCounts = 0;
  for (let v = 0; v < MAX_N; v++) {
    totalCounts += tempExponents[v].length;
  }
  primeExponentsFlat = new Uint8Array(totalCounts);

  let writePtr = 0;
  for (let v = 0; v < MAX_N; v++) {
    primeExponentsOffset[v] = writePtr;
    const exps = tempExponents[v];
    for (let e = 0; e < exps.length; e++, writePtr++) {
      primeExponentsFlat[writePtr] = exps[e];
    }
  }
  primeExponentsOffset[MAX_N] = writePtr;

  // 4. Build Pascal’s triangle mod MODULO as BigInt
  const totalRows = MAX_N + MAX_PRIME_FACTORS;
  for (let i = 0; i < totalRows; i++) {
    const row = new Array<bigint>(MAX_PRIME_FACTORS + 1);
    row[0] = 1n;
    for (let k = 1; k <= MAX_PRIME_FACTORS; k++) {
      if (k > i) {
        row[k] = 0n;
      } else {
        row[k] = (combinationCoefficients[i - 1][k] + combinationCoefficients[i - 1][k - 1]) % MODULO;
      }
    }
    combinationCoefficients[i] = row;
  }
})();

/**
 * Count the number of ideal arrays of length `n` with values in [1..maxValue]
 * @param n Length of the array
 * @param maxValue Maximum value in the array
 * @return The number of ideal arrays of length `n` with values in [1..maxValue]
 */
function idealArrays(n: number, maxValue: number): number {
  let totalSum = 0n;

  // Local references for speed
  const combos = combinationCoefficients;
  const exponentsFlat = primeExponentsFlat;
  const exponentsOff = primeExponentsOffset;
  const mod = MODULO;

  for (let value = 1; value <= maxValue; value++) {
    let productForValue = 1n;
    const start = exponentsOff[value];
    const end = exponentsOff[value + 1];

    // Multiply together C(n + exp - 1, exp) for each prime‑exponent
    for (let ptr = start; ptr < end; ptr++) {
      const exponentCount = exponentsFlat[ptr];
      productForValue =
        (productForValue * combos[n + exponentCount - 1][exponentCount]) % mod;
    }

    totalSum = (totalSum + productForValue) % mod;
  }

  return Number(totalSum);
}
