/**
 * Checks whether splitting into blocks of a given length allows sorting by independent cyclic rotations.
 * @param values Typed view of the input array.
 * @param descentPrefix Prefix counts of strict descents between adjacent entries.
 * @param cutBlocked Flags marking boundaries whose prefix maximum exceeds the following suffix minimum.
 * @param blockLength Candidate divisor of the array length.
 * @returns True when every block can be rotated into its final sorted position.
 */
function canSortWithBlockLength(
  values: Int32Array,
  descentPrefix: Int32Array,
  cutBlocked: Uint8Array,
  blockLength: number,
): boolean {
  const length = values.length;

  // Every block boundary must split the array into a prefix whose maximum fits under the suffix minimum.
  for (let boundary = blockLength; boundary < length; boundary += blockLength) {
    if (cutBlocked[boundary] === 1) {
      return false;
    }
  }

  // A block is rotatable into sorted order exactly when it holds at most one cyclic descent.
  for (let start = 0; start < length; start += blockLength) {
    const end = start + blockLength - 1;
    let cyclicDescents = descentPrefix[end] - descentPrefix[start];

    // The wrap-around pair closes the cycle for the rotation that would be chosen.
    if (values[end] > values[start]) {
      cyclicDescents++;
    }

    if (cyclicDescents > 1) {
      return false;
    }
  }

  return true;
}

function sortableIntegers(nums: number[]): number {
  const length = nums.length;
  const values = new Int32Array(length);
  const suffixMinimum = new Int32Array(length);

  // Backward pass builds a typed copy of the input together with the minimum of every suffix.
  let runningMinimum = 2147483647;
  for (let index = length - 1; index >= 0; index--) {
    const value = nums[index];
    values[index] = value;

    if (value < runningMinimum) {
      runningMinimum = value;
    }

    suffixMinimum[index] = runningMinimum;
  }

  const descentPrefix = new Int32Array(length);
  const cutBlocked = new Uint8Array(length);

  // Forward pass accumulates descent counts and marks boundaries that can never separate sorted parts.
  let runningMaximum = values[0];
  let descentCount = 0;
  for (let index = 1; index < length; index++) {
    const previous = values[index - 1];
    const current = values[index];

    if (previous > current) {
      descentCount++;
    }

    descentPrefix[index] = descentCount;

    if (runningMaximum > suffixMinimum[index]) {
      cutBlocked[index] = 1;
    }

    if (current > runningMaximum) {
      runningMaximum = current;
    }
  }

  // With no descent at all the array is sorted, so every divisor of the length works.
  const alreadySorted = descentCount === 0;
  let total = 0;

  // Divisors are enumerated in pairs up to the square root of the length.
  for (let candidate = 1; candidate * candidate <= length; candidate++) {
    if (length % candidate !== 0) {
      continue;
    }

    if (alreadySorted || canSortWithBlockLength(values, descentPrefix, cutBlocked, candidate)) {
      total += candidate;
    }

    const paired = length / candidate;
    if (paired === candidate) {
      continue;
    }

    if (alreadySorted || canSortWithBlockLength(values, descentPrefix, cutBlocked, paired)) {
      total += paired;
    }
  }

  return total;
}
