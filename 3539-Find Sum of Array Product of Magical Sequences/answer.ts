const MOD_BIGINT = 1000000007n;
const MAX_M = 30;

let globalCombination: BigInt64Array | null = null;
let globalCombinationRowStart: Int32Array | null = null;
let globalPopcount: Uint8Array | null = null;

/**
 * Fast modular multiplication for BigInt.
 * @param a left factor
 * @param b right factor
 * @returns (a * b) % MOD_BIGINT
 */
function multiplyModulo(a: bigint, b: bigint): bigint {
  return (a * b) % MOD_BIGINT;
}

/**
 * Precompute combination C(n, k) for 0 <= n <= MAX_M.
 * Stored as a flattened Pascal triangle table to improve cache efficiency.
 */
function ensureGlobalCombination(): void {
  if (globalCombination !== null) {
    return;
  }

  // Calculate total elements needed for flattened Pascal triangle
  let totalSize = 0;
  for (let n = 0; n <= MAX_M; n += 1) {
    totalSize += (n + 1);
  }

  const combination = new BigInt64Array(totalSize);
  const rowStart = new Int32Array(MAX_M + 1);

  let currentIndex = 0;
  for (let n = 0; n <= MAX_M; n += 1) {
    rowStart[n] = currentIndex;
    for (let k = 0; k <= n; k += 1) {
      if (k === 0 || k === n) {
        combination[currentIndex] = 1n;
      } else {
        combination[currentIndex] =
          (combination[rowStart[n - 1] + (k - 1)] + combination[rowStart[n - 1] + k]) % MOD_BIGINT;
      }
      currentIndex += 1;
    }
  }

  globalCombination = combination;
  globalCombinationRowStart = rowStart;
}

/**
 * Precompute popcount values for integers 0...MAX_M.
 * This helps determine how many bits remain set in final carry.
 */
function ensureGlobalPopcount(): void {
  if (globalPopcount !== null) {
    return;
  }

  const popcountArray = new Uint8Array(MAX_M + 1);
  for (let value = 0; value <= MAX_M; value += 1) {
    let bitValue = value;
    let bitCount = 0;
    while (bitValue > 0) {
      bitValue &= (bitValue - 1);
      bitCount += 1;
    }
    popcountArray[value] = bitCount as number;
  }
  globalPopcount = popcountArray;
}

/**
 * Compute flattened DP index.
 * @param numberUsed number of elements already chosen
 * @param carry current carry before processing the next bit
 * @param onesCount number of set bits realized so far
 * @param carryDimension dimension size for carry
 * @param onesDimension dimension size for onesCount
 * @returns flattened index in the DP array
 */
function dpIndex(
  numberUsed: number,
  carry: number,
  onesCount: number,
  carryDimension: number,
  onesDimension: number
): number {
  // ((numberUsed * carryDimension) + carry) * onesDimension + onesCount
  return ((numberUsed * carryDimension) + carry) * onesDimension + onesCount;
}

/**
 * Compute the sum of products for all magical sequences satisfying the condition.
 *
 * A magical sequence is one where:
 * - It has size `m`.
 * - The sum of powers of two for its indices has exactly `k` set bits.
 *
 * @param m number of picks in the sequence
 * @param k required number of set bits in the sum of powers-of-two
 * @param nums array of base values for products; index j corresponds to power 2^j
 * @returns result modulo 1e9+7
 */
function magicalSum(m: number, k: number, nums: number[]): number {
  ensureGlobalCombination();
  ensureGlobalPopcount();

  const combination = globalCombination as BigInt64Array;
  const rowStart = globalCombinationRowStart as Int32Array;
  const popcount = globalPopcount as Uint8Array;

  const numsLength = nums.length;
  const totalUsedDimension = m + 1;
  const carryDimension = m + 1;
  const onesDimension = k + 1;

  // Initialize DP arrays for current and next layers
  const totalStates = totalUsedDimension * carryDimension * onesDimension;
  let currentDp = new BigInt64Array(totalStates);
  let nextDp = new BigInt64Array(totalStates);

  // Temporary arrays for powers and weights
  const powerArray = new BigInt64Array(m + 1);
  const weightArray = new BigInt64Array(m + 1);

  // Initialize base DP state
  currentDp[dpIndex(0, 0, 0, carryDimension, onesDimension)] = 1n;

  // Iterate through all indices in nums
  for (let index = 0; index < numsLength; index += 1) {
    // Clear the next DP layer
    nextDp.fill(0n);

    // Current base value modulo MOD
    const currentBase = BigInt(nums[index]) % MOD_BIGINT;

    // Process for each number of used picks
    for (let numberUsed = 0; numberUsed <= m; numberUsed += 1) {
      const remaining = m - numberUsed;
      const carryLimit = numberUsed >> 1;
      const onesLimit = Math.min(k, numberUsed);

      // Precompute base powers incrementally for efficiency
      powerArray[0] = 1n;
      for (let count = 1; count <= remaining; count += 1) {
        powerArray[count] = multiplyModulo(powerArray[count - 1], currentBase);
      }

      // Precompute weights using precomputed combination table
      const row = rowStart[remaining];
      for (let chooseCount = 0; chooseCount <= remaining; chooseCount += 1) {
        weightArray[chooseCount] = multiplyModulo(combination[row + chooseCount], powerArray[chooseCount]);
      }

      // Iterate through all valid DP states
      for (let carry = 0; carry <= carryLimit; carry += 1) {
        for (let onesCount = 0; onesCount <= onesLimit; onesCount += 1) {
          const currentIndex = dpIndex(numberUsed, carry, onesCount, carryDimension, onesDimension);
          const currentWays = currentDp[currentIndex];
          if (currentWays === 0n) {
            continue;
          }

          // Choose the number of current index copies to use
          for (let chooseCount = 0; chooseCount <= remaining; chooseCount += 1) {
            const totalAtBit = carry + chooseCount;
            const additionalBit = totalAtBit & 1;
            const newOnes = onesCount + additionalBit;

            if (newOnes > k) {
              continue;
            }

            const newCarry = totalAtBit >> 1;
            const newUsed = numberUsed + chooseCount;

            const destinationIndex = dpIndex(newUsed, newCarry, newOnes, carryDimension, onesDimension);
            const contribution = multiplyModulo(currentWays, weightArray[chooseCount]);
            nextDp[destinationIndex] = (nextDp[destinationIndex] + contribution) % MOD_BIGINT;
          }
        }
      }
    }

    // Swap DP layers for next iteration
    const temp = currentDp;
    currentDp = nextDp;
    nextDp = temp;
  }

  // Compute final answer considering the remaining carry bits
  let result = 0n;
  const carryUpperLimit = (m >> 1) + 1;
  for (let carry = 0; carry <= carryUpperLimit && carry <= m; carry += 1) {
    const extraOnes = popcount[carry];
    const requiredOnesBefore = k - extraOnes;
    if (requiredOnesBefore < 0 || requiredOnesBefore > k) {
      continue;
    }

    const finalIndex = dpIndex(m, carry, requiredOnesBefore, carryDimension, onesDimension);
    result = (result + currentDp[finalIndex]) % MOD_BIGINT;
  }

  return Number(result);
}
