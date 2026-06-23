const MOD = 1_000_000_007;

// Maximum constraint boundaries for n and span
const MAX_DIMENSION = 2005;
const CACHE_SIZE = MAX_DIMENSION * MAX_DIMENSION;

// Global typed array to memoize function results for O(1) repeated queries.
// Filled with -1 to represent uncomputed states.
const resultCache = new Int32Array(CACHE_SIZE);
resultCache.fill(-1);

/**
 * Calculates the number of valid ZigZag arrays of length n.
 *
 * @param {number} n - The length of the ZigZag array.
 * @param {number} l - The lower bound of the elements (inclusive).
 * @param {number} r - The upper bound of the elements (inclusive).
 * @returns {number} The total number of valid ZigZag arrays modulo 1000000007.
 */
function zigZagArrays(n: number, l: number, r: number): number {
  const span = r - l + 1;

  // Generate a unique 1D cache key based on the input combinations
  const cacheKey = n * MAX_DIMENSION + span;

  // Return the precomputed result immediately if it exists
  if (resultCache[cacheKey] !== -1) {
    return resultCache[cacheKey];
  }

  // Arrays to store DP states for the current and next lengths
  let currentDp = new Uint32Array(span + 1);
  let nextDp = new Uint32Array(span + 1);

  // Initialize the base case for arrays of length 1
  for (let index = 1; index <= span; index++) {
    currentDp[index] = 1;
  }

  // Iterate from length 2 up to n
  for (let length = 1; length < n; length++) {
    nextDp[1] = 0;

    let currentSum = 0;
    let reverseIndex = span;

    // Use a running accumulator and a decreasing pointer to skip redundant array lookups
    for (let valueIndex = 2; valueIndex <= span; valueIndex++) {
      currentSum += currentDp[reverseIndex];
      reverseIndex -= 1;

      // Fast modulo using conditional subtraction instead of the slow modulo operator
      if (currentSum >= MOD) {
        currentSum -= MOD;
      }

      nextDp[valueIndex] = currentSum;
    }

    // Swap current and next DP arrays to avoid memory allocation in the loop
    const temporaryDp = currentDp;
    currentDp = nextDp;
    nextDp = temporaryDp;
  }

  // Aggregate the total valid sequences ending with an increasing step
  let totalIncreasingEnds = 0;
  for (let index = 1; index <= span; index++) {
    totalIncreasingEnds += currentDp[index];

    if (totalIncreasingEnds >= MOD) {
      totalIncreasingEnds -= MOD;
    }
  }

  // Total sequences is double the sequences ending in an increasing step (due to symmetry)
  let totalSequences = totalIncreasingEnds * 2;

  // Final fast modulo applied to the multiplied result
  if (totalSequences >= MOD) {
    totalSequences -= MOD;
  }

  // Cache the processed sequence count before returning
  resultCache[cacheKey] = totalSequences;

  return totalSequences;
}
