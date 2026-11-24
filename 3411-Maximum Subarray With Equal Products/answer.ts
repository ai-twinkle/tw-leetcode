/**
 * Prime-factor bitmask for every value in [0, 10].
 * Bit 0 -> 2, bit 1 -> 3, bit 2 -> 5, bit 3 -> 7.
 */
const PRIME_MASK = new Uint8Array([
  0,  // 0 (unused)
  0,  // 1
  1,  // 2
  2,  // 3
  1,  // 4  = 2^2
  4,  // 5
  3,  // 6  = 2 * 3
  8,  // 7
  1,  // 8  = 2^3
  2,  // 9  = 3^2
  5,  // 10 = 2 * 5
]);

/**
 * Finds the length of the longest product equivalent subarray.
 * Any pair is always product equivalent; a longer subarray is product equivalent
 * exactly when its elements are pairwise coprime, i.e. their prime masks are disjoint.
 * @param nums Array of positive integers in [1, 10]
 * @returns Length of the longest product equivalent subarray
 */
function maxLength(nums: number[]): number {
  const length = nums.length;
  let windowMask = 0;
  let leftIndex = 0;
  let bestLength = 2;

  for (let rightIndex = 0; rightIndex < length; rightIndex++) {
    const currentMask = PRIME_MASK[nums[rightIndex]];

    // Shrink the window until the new element shares no prime with it
    while ((windowMask & currentMask) !== 0) {
      windowMask ^= PRIME_MASK[nums[leftIndex]];
      leftIndex++;
    }

    windowMask |= currentMask;

    // Track the longest pairwise coprime window
    const windowLength = rightIndex - leftIndex + 1;
    if (windowLength > bestLength) {
      bestLength = windowLength;
    }
  }

  return bestLength;
}
