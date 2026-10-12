const MAXIMUM_SUM_MODULO = 1000000007;
const MAXIMUM_SUM_BIT_WIDTH = 30;

/**
 * Packs the four bits of a nibble into four independent 8-bit lanes of one
 * 32-bit word, so a single table lookup and one addition tally four bit
 * positions at once.
 */
const MAXIMUM_SUM_NIBBLE_LANE_TABLE: Int32Array = new Int32Array(16);

for (let nibble = 0; nibble < 16; nibble += 1) {
  MAXIMUM_SUM_NIBBLE_LANE_TABLE[nibble] =
    (nibble & 1) |
    (((nibble >> 1) & 1) << 8) |
    (((nibble >> 2) & 1) << 16) |
    (((nibble >> 3) & 1) << 24);
}

/**
 * Squares a value below 2^30 modulo 1e9+7 without exceeding the exact double
 * range, by splitting the multiplier into high and low 16-bit halves.
 *
 * @param baseValue Non-negative integer strictly below 2^30.
 * @returns (baseValue * baseValue) mod 1e9+7.
 */
function squareModuloMaximumSum(baseValue: number): number {
  const highHalf = (baseValue / 65536) | 0;
  const lowHalf = baseValue - highHalf * 65536;

  return (
    (((highHalf * baseValue) % MAXIMUM_SUM_MODULO) * 65536 + lowHalf * baseValue) %
    MAXIMUM_SUM_MODULO
  );
}

/**
 * Maximizes the sum of squares of k elements after any number of the given
 * AND/OR exchange operations.
 *
 * @param nums Input array of positive integers.
 * @param k Amount of elements to pick from the final array.
 * @returns Maximum achievable sum of squares modulo 1e9+7.
 */
function maxSum(nums: number[], k: number): number {
  const length = nums.length;

  // The operation only relocates set bits, so the population count of every
  // bit position is invariant and fully determines the reachable arrays.
  const bitCounts = new Int32Array(32);

  let laneWord0 = 0;
  let laneWord1 = 0;
  let laneWord2 = 0;
  let laneWord3 = 0;
  let laneWord4 = 0;
  let laneWord5 = 0;
  let laneWord6 = 0;
  let laneWord7 = 0;
  let readIndex = 0;

  while (readIndex < length) {
    // Each 8-bit lane holds at most 255 before overflowing, so the tally is
    // flushed into the wide counters once per 255 elements.
    let chunkEnd = readIndex + 255;

    if (chunkEnd > length) {
      chunkEnd = length;
    }

    for (; readIndex < chunkEnd; readIndex += 1) {
      const element = nums[readIndex];

      laneWord0 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[element & 15];
      laneWord1 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 4) & 15];
      laneWord2 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 8) & 15];
      laneWord3 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 12) & 15];
      laneWord4 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 16) & 15];
      laneWord5 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 20) & 15];
      laneWord6 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 24) & 15];
      laneWord7 += MAXIMUM_SUM_NIBBLE_LANE_TABLE[(element >>> 28) & 15];
    }

    for (let laneIndex = 0; laneIndex < 4; laneIndex += 1) {
      const laneShift = laneIndex * 8;

      bitCounts[laneIndex] += (laneWord0 >>> laneShift) & 255;
      bitCounts[laneIndex + 4] += (laneWord1 >>> laneShift) & 255;
      bitCounts[laneIndex + 8] += (laneWord2 >>> laneShift) & 255;
      bitCounts[laneIndex + 12] += (laneWord3 >>> laneShift) & 255;
      bitCounts[laneIndex + 16] += (laneWord4 >>> laneShift) & 255;
      bitCounts[laneIndex + 20] += (laneWord5 >>> laneShift) & 255;
      bitCounts[laneIndex + 24] += (laneWord6 >>> laneShift) & 255;
      bitCounts[laneIndex + 28] += (laneWord7 >>> laneShift) & 255;
    }

    laneWord0 = 0;
    laneWord1 = 0;
    laneWord2 = 0;
    laneWord3 = 0;
    laneWord4 = 0;
    laneWord5 = 0;
    laneWord6 = 0;
    laneWord7 = 0;
  }

  // Order the occupied bit positions by occurrence; an insertion sort is
  // optimal for at most 30 entries.
  const sortedBitCounts = new Int32Array(MAXIMUM_SUM_BIT_WIDTH);
  const sortedBitWeights = new Int32Array(MAXIMUM_SUM_BIT_WIDTH);
  let occupiedBitTotal = 0;
  let allOccupiedBitsMask = 0;

  for (let bitPosition = 0; bitPosition < MAXIMUM_SUM_BIT_WIDTH; bitPosition += 1) {
    const occurrenceCount = bitCounts[bitPosition];

    if (occurrenceCount === 0) {
      continue;
    }

    allOccupiedBitsMask += 1 << bitPosition;

    let insertIndex = occupiedBitTotal;

    while (insertIndex > 0 && sortedBitCounts[insertIndex - 1] > occurrenceCount) {
      sortedBitCounts[insertIndex] = sortedBitCounts[insertIndex - 1];
      sortedBitWeights[insertIndex] = sortedBitWeights[insertIndex - 1];
      insertIndex -= 1;
    }

    sortedBitCounts[insertIndex] = occurrenceCount;
    sortedBitWeights[insertIndex] = 1 << bitPosition;
    occupiedBitTotal += 1;
  }

  let sumOfSquaresModulo = 0;
  let pickedValue = allOccupiedBitsMask;
  let remainingPicks = k;
  let previousExhaustCount = 0;
  let groupIndex = 0;

  // The t-th greedy pick equals the mask of bits whose occurrence exceeds t,
  // which only changes at the few distinct occurrences, so identical picks
  // are batched into one multiplication.
  while (groupIndex < occupiedBitTotal && remainingPicks > 0) {
    const exhaustCount = sortedBitCounts[groupIndex];
    let identicalPickCount = exhaustCount - previousExhaustCount;

    if (identicalPickCount > remainingPicks) {
      identicalPickCount = remainingPicks;
    }

    sumOfSquaresModulo =
      (sumOfSquaresModulo + identicalPickCount * squareModuloMaximumSum(pickedValue)) %
      MAXIMUM_SUM_MODULO;
    remainingPicks -= identicalPickCount;
    previousExhaustCount = exhaustCount;

    // Retire every bit position exhausted at this occurrence level.
    while (groupIndex < occupiedBitTotal && sortedBitCounts[groupIndex] === exhaustCount) {
      pickedValue -= sortedBitWeights[groupIndex];
      groupIndex += 1;
    }
  }

  return sumOfSquaresModulo;
}
