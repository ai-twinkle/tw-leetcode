/**
 * Computes the greatest common divisor of two positive integers.
 * @param first The first positive integer.
 * @param second The second positive integer.
 * @returns The greatest common divisor of both inputs.
 */
function greatestCommonDivisor(first: number, second: number): number {
  let left = first;
  let right = second;
  while (right !== 0) {
    const remainder = left % right;
    left = right;
    right = remainder;
  }
  return left;
}

/**
 * Finds the k-th smallest amount that can be produced by repeatedly using a
 * single denomination, where denominations may never be mixed.
 * @param coins The available coin denominations.
 * @param k The rank of the amount to return.
 * @returns The k-th smallest reachable amount.
 */
function findKthSmallest(coins: number[], k: number): number {
  const sortedCoins = coins.slice().sort((first, second) => first - second);

  // A coin that is a multiple of a kept coin generates no new amounts.
  const baseCoins: number[] = [];
  for (let index = 0; index < sortedCoins.length; index++) {
    const candidate = sortedCoins[index];
    let isRedundant = false;
    for (let kept = 0; kept < baseCoins.length; kept++) {
      if (candidate % baseCoins[kept] === 0) {
        isRedundant = true;
        break;
      }
    }
    if (!isRedundant) {
      baseCoins.push(candidate);
    }
  }

  const smallestCoin = baseCoins[0];

  // With a unit coin every positive integer is reachable.
  if (smallestCoin === 1) {
    return k;
  }

  // The first k multiples of the smallest coin already reach rank k.
  const upperBound = smallestCoin * k;
  const coinCount = baseCoins.length;
  const maskCount = 1 << coinCount;

  const lcmByMask = new Float64Array(maskCount);
  const parityByMask = new Uint8Array(maskCount);
  const packedTerms = new Float64Array(maskCount);
  let liveCount = 0;
  lcmByMask[0] = 1;

  for (let mask = 1; mask < maskCount; mask++) {
    parityByMask[mask] = parityByMask[mask >> 1] ^ (mask & 1);

    const previousMask = mask & (mask - 1);
    const previousLcm = lcmByMask[previousMask];

    // Every superset of a dead subset is dead as well.
    if (previousLcm === Infinity) {
      lcmByMask[mask] = Infinity;
      continue;
    }

    const lowestBit = mask & -mask;
    const coin = baseCoins[31 - Math.clz32(lowestBit)];
    const candidateLcm = (previousLcm / greatestCommonDivisor(previousLcm, coin)) * coin;

    if (candidateLcm > upperBound) {
      lcmByMask[mask] = Infinity;
      continue;
    }
    lcmByMask[mask] = candidateLcm;

    // Pack value and inclusion-exclusion sign so one numeric sort orders both.
    packedTerms[liveCount] = candidateLcm * 2 + parityByMask[mask];
    liveCount++;
  }

  // Native numeric sort, no JS comparator is invoked per comparison.
  const liveTerms = packedTerms.subarray(0, liveCount);
  liveTerms.sort();

  const termLcm = new Float64Array(liveCount);
  const termCoefficient = new Int32Array(liveCount);
  let termCount = 0;
  let scanIndex = 0;

  while (scanIndex < liveCount) {
    const firstPacked = liveTerms[scanIndex];
    const firstBit = firstPacked % 2;
    const lcmValue = (firstPacked - firstBit) / 2;
    let coefficient = 0;

    // Equal LCM values are adjacent after sorting, so signs merge in one pass.
    while (scanIndex < liveCount) {
      const currentPacked = liveTerms[scanIndex];
      const currentBit = currentPacked % 2;
      if ((currentPacked - currentBit) / 2 !== lcmValue) {
        break;
      }
      coefficient += currentBit === 1 ? 1 : -1;
      scanIndex++;
    }

    // Fully cancelled subsets are removed from the hot counting loop.
    if (coefficient !== 0) {
      termLcm[termCount] = lcmValue;
      termCoefficient[termCount] = coefficient;
      termCount++;
    }
  }

  let density = 0;
  let errorBudget = 0;
  for (let index = 0; index < termCount; index++) {
    density += termCoefficient[index] / termLcm[index];
    errorBudget += Math.abs(termCoefficient[index]);
  }

  /**
   * Counts how many reachable amounts are less than or equal to a limit.
   * @param limit The inclusive upper limit of the amounts to count.
   * @returns The number of reachable amounts within the limit.
   */
  function countAtMost(limit: number): number {
    let total = 0;
    for (let index = 0; index < termCount; index++) {
      const lcmValue = termLcm[index];

      // Terms are ascending, so nothing further can contribute.
      if (lcmValue > limit) {
        break;
      }
      total += termCoefficient[index] * Math.floor(limit / lcmValue);
    }
    return total;
  }

  // The exact count never deviates from density * x by more than the error budget.
  let low = Math.max(k, Math.floor((k - errorBudget) / density) - 8);
  let high = Math.min(upperBound, Math.ceil((k + errorBudget) / density) + 8);

  // Fall back to the safe range if the analytic window degenerates.
  if (low > high) {
    low = k;
    high = upperBound;
  }

  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (countAtMost(middle) >= k) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }
  return low;
}
