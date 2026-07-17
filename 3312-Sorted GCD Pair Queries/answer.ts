const MAXIMUM_VALUE = 50000;

/**
 * Finds, for each query, the element at the queried index in the sorted array of
 * pairwise GCD values of nums.
 * @param nums Input integer array.
 * @param queries Indices into the conceptually sorted gcdPairs array.
 * @returns The gcdPairs value at each queried index.
 */
function gcdValues(nums: number[], queries: number[]): number[] {
  const length = nums.length;

  // Count occurrences of each value in nums.
  const valueCount = new Int32Array(MAXIMUM_VALUE + 1);
  let maximumPresent = 0;
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    valueCount[value]++;
    if (value > maximumPresent) {
      maximumPresent = value;
    }
  }

  // multiplesCount[g] = how many nums are divisible by g.
  const multiplesCount = new Int32Array(maximumPresent + 1);
  for (let divisor = 1; divisor <= maximumPresent; divisor++) {
    let total = 0;
    for (let multiple = divisor; multiple <= maximumPresent; multiple += divisor) {
      total += valueCount[multiple];
    }
    multiplesCount[divisor] = total;
  }

  // pairsWithExactGcd[g] = number of pairs whose gcd is exactly g.
  // First compute pairs whose gcd is a multiple of g, then subtract to isolate exact.
  const pairsWithExactGcd = new Float64Array(maximumPresent + 1);
  for (let divisor = maximumPresent; divisor >= 1; divisor--) {
    const count = multiplesCount[divisor];
    // Pairs where both elements are divisible by divisor.
    let exact = (count * (count - 1)) / 2;
    for (let multiple = 2 * divisor; multiple <= maximumPresent; multiple += divisor) {
      exact -= pairsWithExactGcd[multiple];
    }
    pairsWithExactGcd[divisor] = exact;
  }

  // Build a prefix-sum of pair counts so a query index maps to a gcd value via binary search.
  const prefixCount = new Float64Array(maximumPresent + 1);
  let running = 0;
  for (let value = 1; value <= maximumPresent; value++) {
    running += pairsWithExactGcd[value];
    prefixCount[value] = running;
  }

  // Answer each query by locating the first gcd value whose prefix count exceeds the index.
  const queryLength = queries.length;
  const gcdPairValues = new Array<number>(queryLength);
  for (let queryIndex = 0; queryIndex < queryLength; queryIndex++) {
    const target = queries[queryIndex];
    let low = 1;
    let high = maximumPresent;
    // Binary search for the smallest value with prefixCount[value] > target.
    while (low < high) {
      const middle = (low + high) >> 1;
      if (prefixCount[middle] > target) {
        high = middle;
      } else {
        low = middle + 1;
      }
    }
    gcdPairValues[queryIndex] = low;
  }

  return gcdPairValues;
}
