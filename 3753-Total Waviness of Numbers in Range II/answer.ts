// Module-level precomputed lookup tables, built once at load time

/** Number of distinct (started, prev, prevPrev) tuples encoded as a single index. */
const STATE_SIZE = 242;

/** Maps (state * 10 + digit) to the next state index after appending that digit. */
const NEXT_STATE_TABLE = new Int16Array(STATE_SIZE * 10);

/** Maps (state * 10 + digit) to 1 if the transition turns the previous digit into a peak/valley, else 0. */
const WAVINESS_TABLE = new Int8Array(STATE_SIZE * 10);

// Build the transition tables for every possible (state, digit) pair
for (let state = 0; state < STATE_SIZE; state++) {
  const started = state >= 121 ? 1 : 0;
  const stateRemainder = state - started * 121;
  const previousDigit = (stateRemainder / 11) | 0;
  const previousPreviousDigit = stateRemainder - previousDigit * 11;

  for (let digit = 0; digit < 10; digit++) {
    let newStarted = started;
    let newPreviousDigit = previousDigit;
    let newPreviousPreviousDigit = previousPreviousDigit;
    let wavinessIncrement = 0;

    if (started === 0) {
      // Still in the leading-zero region; only switch on a non-zero digit
      if (digit !== 0) {
        newStarted = 1;
        newPreviousDigit = digit;
        newPreviousPreviousDigit = 10;
      }
    } else if (previousPreviousDigit === 10) {
      // Only one actual digit placed so far; just shift the new digit in
      newPreviousPreviousDigit = previousDigit;
      newPreviousDigit = digit;
    } else {
      // Three consecutive digits available; classify the middle one
      const isPeak = previousDigit > previousPreviousDigit && previousDigit > digit;
      const isValley = previousDigit < previousPreviousDigit && previousDigit < digit;
      if (isPeak || isValley) {
        wavinessIncrement = 1;
      }
      newPreviousPreviousDigit = previousDigit;
      newPreviousDigit = digit;
    }

    const newState = newStarted * 121 + newPreviousDigit * 11 + newPreviousPreviousDigit;
    const tableIndex = state * 10 + digit;
    NEXT_STATE_TABLE[tableIndex] = newState;
    WAVINESS_TABLE[tableIndex] = wavinessIncrement;
  }
}

/**
 * Computes the sum of waviness for all integers in the inclusive range [0, upperBound] using digit DP.
 * @param upperBound - The upper bound; must be a non-negative safe integer.
 * @returns The cumulative waviness across the range.
 */
function computeWavinessPrefixSum(upperBound: number): number {
  // Numbers with fewer than three digits contribute no waviness
  if (upperBound < 100) {
    return 0;
  }

  // Extract the digits of upperBound into a typed array in big-endian order
  const digitBuffer = new Int8Array(16);
  let digitCount = 0;
  let remaining = upperBound;
  while (remaining > 0) {
    const lastDigit = remaining % 10;
    digitBuffer[digitCount] = lastDigit;
    remaining = (remaining - lastDigit) / 10;
    digitCount++;
  }
  // Reverse the buffer in place so the most significant digit comes first
  for (let leftIndex = 0, rightIndex = digitCount - 1; leftIndex < rightIndex; leftIndex++, rightIndex--) {
    const swapValue = digitBuffer[leftIndex];
    digitBuffer[leftIndex] = digitBuffer[rightIndex];
    digitBuffer[rightIndex] = swapValue;
  }

  // Double-buffered loose-state arrays, swapped after each position to avoid reallocation
  let looseCount = new Float64Array(STATE_SIZE);
  let looseSum = new Float64Array(STATE_SIZE);
  let nextLooseCount = new Float64Array(STATE_SIZE);
  let nextLooseSum = new Float64Array(STATE_SIZE);

  // Single deterministic tight state tracking the prefix that still equals upperBound
  let tightState = 120; // initial encoding for (started=0, prev=10, prevPrev=10)
  let tightSum = 0;

  for (let position = 0; position < digitCount; position++) {
    const limitDigit = digitBuffer[position];

    // Reset the destination buffers for this position
    nextLooseCount.fill(0);
    nextLooseSum.fill(0);

    // Expand every populated loose state across all ten digit choices
    for (let state = 0; state < STATE_SIZE; state++) {
      const stateCount = looseCount[state];
      if (stateCount === 0) {
        continue;
      }
      const stateSum = looseSum[state];
      const baseIndex = state * 10;

      for (let digit = 0; digit < 10; digit++) {
        const tableIndex = baseIndex + digit;
        const newState = NEXT_STATE_TABLE[tableIndex];
        const wavinessIncrement = WAVINESS_TABLE[tableIndex];
        nextLooseCount[newState] += stateCount;
        nextLooseSum[newState] += stateSum + stateCount * wavinessIncrement;
      }
    }

    // Expand the tight state: digits below the limit branch off into the loose set
    const tightBaseIndex = tightState * 10;
    for (let digit = 0; digit < limitDigit; digit++) {
      const tableIndex = tightBaseIndex + digit;
      const newState = NEXT_STATE_TABLE[tableIndex];
      const wavinessIncrement = WAVINESS_TABLE[tableIndex];
      nextLooseCount[newState] += 1;
      nextLooseSum[newState] += tightSum + wavinessIncrement;
    }
    // The digit equal to the limit keeps the path tight
    const tightTableIndex = tightBaseIndex + limitDigit;
    tightSum += WAVINESS_TABLE[tightTableIndex];
    tightState = NEXT_STATE_TABLE[tightTableIndex];

    // Swap the buffer pairs for the next iteration without reallocating
    const tempCount = looseCount;
    const tempSum = looseSum;
    looseCount = nextLooseCount;
    looseSum = nextLooseSum;
    nextLooseCount = tempCount;
    nextLooseSum = tempSum;
  }

  // Aggregate the cumulative waviness across all final loose states plus the tight contribution
  let total = tightSum;
  for (let state = 0; state < STATE_SIZE; state++) {
    total += looseSum[state];
  }

  return total;
}

/**
 * Computes the total waviness for every integer in the inclusive range [num1, num2].
 * @param num1 - The lower bound of the range (inclusive).
 * @param num2 - The upper bound of the range (inclusive).
 * @returns The sum of waviness values across the range.
 */
function totalWaviness(num1: number, num2: number): number {
  return computeWavinessPrefixSum(num2) - computeWavinessPrefixSum(num1 - 1);
}
