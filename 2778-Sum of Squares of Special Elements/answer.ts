const MAXIMUM_SUPPORTED_LENGTH = 50;

// Start offset of each length's divisor block inside DIVISOR_INDICES (end = offset of length + 1)
const DIVISOR_START_OFFSETS = new Int32Array(MAXIMUM_SUPPORTED_LENGTH + 2);

/**
 * Precomputes the 0-based positions of every special element for each possible array length.
 * Done once at module load, so each query only touches the indices it actually needs.
 *
 * @returns A flat table of 0-based special-element positions for lengths 1..50
 */
function buildDivisorIndexTable(): Int8Array {
  // 48 has the most divisors in range (10), so 10 slots per length is a safe upper bound
  const indices = new Int8Array(MAXIMUM_SUPPORTED_LENGTH * 10);
  let writeCursor = 0;

  for (let length = 1; length <= MAXIMUM_SUPPORTED_LENGTH; length++) {
    DIVISOR_START_OFFSETS[length] = writeCursor;

    for (let divisor = 1; divisor <= length; divisor++) {
      if (length % divisor !== 0) {
        continue;
      }

      // Store the 0-based position, removing the 1-indexed adjustment from the hot path
      indices[writeCursor] = divisor - 1;
      writeCursor++;
    }
  }

  DIVISOR_START_OFFSETS[MAXIMUM_SUPPORTED_LENGTH + 1] = writeCursor;

  return indices.subarray(0, writeCursor);
}

const DIVISOR_INDICES = buildDivisorIndexTable();

/**
 * Returns the sum of the squares of all special elements of nums.
 *
 * @param nums The 1-indexed input array
 * @returns The sum of squares of elements whose 1-based index divides nums.length
 */
function sumOfSquares(nums: number[]): number {
  const length = nums.length;
  let result = 0;

  if (length <= MAXIMUM_SUPPORTED_LENGTH) {
    const blockEnd = DIVISOR_START_OFFSETS[length + 1];

    // Visit only the divisor positions: at most 10 reads instead of n modulo operations
    for (let cursor = DIVISOR_START_OFFSETS[length]; cursor < blockEnd; cursor++) {
      const value = nums[DIVISOR_INDICES[cursor]];
      result += value * value;
    }

    return result;
  }

  // Defensive path for out-of-constraint lengths: pair up divisors around the square root
  for (let divisor = 1; divisor * divisor <= length; divisor++) {
    if (length % divisor !== 0) {
      continue;
    }

    const lowValue = nums[divisor - 1];
    result += lowValue * lowValue;

    const pairedDivisor = length / divisor;

    if (pairedDivisor !== divisor) {
      const highValue = nums[pairedDivisor - 1];
      result += highValue * highValue;
    }
  }

  return result;
}
