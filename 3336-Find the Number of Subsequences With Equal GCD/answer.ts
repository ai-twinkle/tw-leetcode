const MODULO = 1000000007;
const MAX_VALUE = 200;
const STRIDE = MAX_VALUE + 1;
const TABLE_SIZE = STRIDE * STRIDE;

// Precompute a full GCD lookup table so every gcd query during the DP is O(1).
const gcdTable = new Int32Array(TABLE_SIZE);
for (let firstValue = 0; firstValue <= MAX_VALUE; firstValue++) {
  for (let secondValue = 0; secondValue <= MAX_VALUE; secondValue++) {
    let a = firstValue;
    let b = secondValue;
    while (b !== 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    gcdTable[firstValue * STRIDE + secondValue] = a;
  }
}

/**
 * Counts pairs of disjoint non-empty subsequences whose GCDs are equal.
 * @param nums the input integer array
 * @returns the number of valid pairs modulo 1e9 + 7
 */
function subsequencePairCount(nums: number[]): number {
  // State is encoded as gcd1 * STRIDE + gcd2, where 0 means an empty subsequence.
  const currentCounts = new Float64Array(TABLE_SIZE);
  const nextCounts = new Float64Array(TABLE_SIZE);
  const isInNext = new Uint8Array(TABLE_SIZE);

  currentCounts[0] = 1;

  // Sparse lists of encoded states holding a non-zero count, pre-sized to the maximum.
  const activeStates = new Int32Array(TABLE_SIZE);
  activeStates[0] = 0;
  let activeLength = 1;
  const nextStates = new Int32Array(TABLE_SIZE);
  let nextLength = 0;

  for (const value of nums) {
    nextLength = 0;

    // Branch where the current element is used in neither subsequence: carry states forward.
    for (let index = 0; index < activeLength; index++) {
      const stateKey = activeStates[index];
      nextCounts[stateKey] = currentCounts[stateKey];
      isInNext[stateKey] = 1;
      nextStates[nextLength++] = stateKey;
    }

    // Branches where the current element joins subsequence one or two.
    for (let index = 0; index < activeLength; index++) {
      const stateKey = activeStates[index];
      const waysToReach = currentCounts[stateKey];
      if (waysToReach === 0) {
        continue;
      }

      const gcdOfFirst = (stateKey / STRIDE) | 0;
      const gcdOfSecond = stateKey - gcdOfFirst * STRIDE;

      // Add the element to the first subsequence.
      const newGcdFirst = gcdOfFirst === 0 ? value : gcdTable[gcdOfFirst * STRIDE + value];
      const keyFirst = newGcdFirst * STRIDE + gcdOfSecond;
      if (isInNext[keyFirst] === 0) {
        isInNext[keyFirst] = 1;
        nextCounts[keyFirst] = waysToReach;
        nextStates[nextLength++] = keyFirst;
      } else {
        // Reduce with a single conditional subtraction instead of a modulo operation.
        const sum = nextCounts[keyFirst] + waysToReach;
        nextCounts[keyFirst] = sum >= MODULO ? sum - MODULO : sum;
      }

      // Add the element to the second subsequence.
      const newGcdSecond = gcdOfSecond === 0 ? value : gcdTable[gcdOfSecond * STRIDE + value];
      const keySecond = gcdOfFirst * STRIDE + newGcdSecond;
      if (isInNext[keySecond] === 0) {
        isInNext[keySecond] = 1;
        nextCounts[keySecond] = waysToReach;
        nextStates[nextLength++] = keySecond;
      } else {
        const sum = nextCounts[keySecond] + waysToReach;
        nextCounts[keySecond] = sum >= MODULO ? sum - MODULO : sum;
      }
    }

    // Clear the previous layer's counts.
    for (let index = 0; index < activeLength; index++) {
      currentCounts[activeStates[index]] = 0;
    }

    // Commit the new layer as the current one and reset the membership marks.
    for (let index = 0; index < nextLength; index++) {
      const stateKey = nextStates[index];
      currentCounts[stateKey] = nextCounts[stateKey];
      isInNext[stateKey] = 0;
      activeStates[index] = stateKey;
    }
    activeLength = nextLength;
  }

  // Sum over states where both subsequences are non-empty and share the same GCD.
  let validPairTotal = 0;
  for (let sharedGcd = 1; sharedGcd <= MAX_VALUE; sharedGcd++) {
    validPairTotal = (validPairTotal + currentCounts[sharedGcd * STRIDE + sharedGcd]) % MODULO;
  }
  return validPairTotal;
}
