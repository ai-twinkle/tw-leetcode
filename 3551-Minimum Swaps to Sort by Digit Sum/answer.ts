/**
 * Digit sums for every 4-digit chunk, built once so a value's digit sum costs
 * three table lookups instead of a divide-and-modulo loop over its digits.
 */
const DIGIT_SUM_BY_CHUNK = (() => {
  const table = new Uint8Array(10000);

  for (let value = 1; value < 10000; value++) {
    table[value] = table[(value / 10) | 0] + (value % 10);
  }

  return table;
})();

/** Digit sums of 1..10^9 never exceed 81 (reached by 999999999). */
const DIGIT_SUM_BUCKET_COUNT = 82;

/** Below this length an insertion sort beats setting up radix counters. */
const INSERTION_SORT_LIMIT = 160;

/** Values stay under 2^30, so 11-bit digits need three passes and 15-bit two. */
const NARROW_RADIX_BITS = 11;
const WIDE_RADIX_BITS = 15;
const WIDE_RADIX_LENGTH_THRESHOLD = 16384;

/**
 * Counts the minimum swaps needed to put nums into digit-sum order, breaking
 * ties by value. The answer is length minus the number of cycles in the
 * permutation that maps sorted rank to original index.
 *
 * @param nums Distinct positive integers, each at most 10^9.
 * @returns The minimum number of swaps required.
 */
function minSwaps(nums: number[]): number {
  const length = nums.length;

  if (length < 2) {
    return 0;
  }

  const digitSums = new Uint8Array(length);
  const values = new Int32Array(length);
  let maxValue = 0;

  // Single pass: cache each value, its digit sum, and the overall maximum.
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    const upperChunks = (value / 10000) | 0;

    values[index] = value;
    digitSums[index] =
      DIGIT_SUM_BY_CHUNK[value % 10000] +
      DIGIT_SUM_BY_CHUNK[upperChunks % 10000] +
      DIGIT_SUM_BY_CHUNK[(upperChunks / 10000) | 0];

    if (value > maxValue) {
      maxValue = value;
    }
  }

  let order = new Int32Array(length);

  if (length <= INSERTION_SORT_LIMIT) {
    // Pack (digitSum, value) into one exact double so the inner loop does a
    // single numeric compare; 81 * 2^30 + 10^9 stays well inside 2^53.
    const sortKeys = new Float64Array(length);

    for (let index = 0; index < length; index++) {
      sortKeys[index] = digitSums[index] * 1073741824 + values[index];
      order[index] = index;
    }

    for (let index = 1; index < length; index++) {
      const currentKey = sortKeys[index];
      const currentIndex = order[index];
      let scan = index - 1;

      while (scan >= 0 && sortKeys[scan] > currentKey) {
        sortKeys[scan + 1] = sortKeys[scan];
        order[scan + 1] = order[scan];
        scan--;
      }

      sortKeys[scan + 1] = currentKey;
      order[scan + 1] = currentIndex;
    }
  } else {
    const radixBits = length >= WIDE_RADIX_LENGTH_THRESHOLD ? WIDE_RADIX_BITS : NARROW_RADIX_BITS;
    const radixSize = 1 << radixBits;
    const radixMask = radixSize - 1;

    let sortedValues = new Int32Array(length);
    let spareOrder = new Int32Array(length);
    let spareValues = new Int32Array(length);
    const counts = new Int32Array(radixSize);

    for (let index = 0; index < length; index++) {
      order[index] = index;
      sortedValues[index] = values[index];
    }

    // Least-significant-digit radix pass per chunk of the value; the shift
    // guard keeps the loop safe against JavaScript's mod-32 shift wrapping.
    for (let shift = 0; shift < 31 && (maxValue >>> shift) !== 0; shift += radixBits) {
      counts.fill(0);

      for (let index = 0; index < length; index++) {
        counts[(sortedValues[index] >>> shift) & radixMask]++;
      }

      let runningTotal = 0;

      for (let bucket = 0; bucket < radixSize; bucket++) {
        const bucketSize = counts[bucket];
        counts[bucket] = runningTotal;
        runningTotal += bucketSize;
      }

      for (let index = 0; index < length; index++) {
        const value = sortedValues[index];
        const slot = counts[(value >>> shift) & radixMask]++;
        spareValues[slot] = value;
        spareOrder[slot] = order[index];
      }

      const previousOrder = order;
      order = spareOrder;
      spareOrder = previousOrder;

      const previousValues = sortedValues;
      sortedValues = spareValues;
      spareValues = previousValues;
    }

    // Final stable pass on the digit sum promotes it to the primary key while
    // the value ordering established above survives as the tiebreaker.
    const digitSumCounts = new Int32Array(DIGIT_SUM_BUCKET_COUNT);

    for (let index = 0; index < length; index++) {
      digitSumCounts[digitSums[order[index]]]++;
    }

    let digitSumTotal = 0;

    for (let bucket = 0; bucket < DIGIT_SUM_BUCKET_COUNT; bucket++) {
      const bucketSize = digitSumCounts[bucket];
      digitSumCounts[bucket] = digitSumTotal;
      digitSumTotal += bucketSize;
    }

    for (let index = 0; index < length; index++) {
      const originalIndex = order[index];
      spareOrder[digitSumCounts[digitSums[originalIndex]]++] = originalIndex;
    }

    order = spareOrder;
  }

  // Walk the permutation, blanking visited slots instead of keeping a separate
  // visited array; a cycle of size k costs exactly k - 1 swaps.
  let cycleCount = 0;

  for (let index = 0; index < length; index++) {
    if (order[index] < 0) {
      continue;
    }

    cycleCount++;
    let cursor = index;

    while (order[cursor] >= 0) {
      const nextCursor = order[cursor];
      order[cursor] = -1;
      cursor = nextCursor;
    }
  }

  return length - cycleCount;
}
