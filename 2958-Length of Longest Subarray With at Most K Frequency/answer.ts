const HASH_MULTIPLIER = 0x9e3779b1;

/**
 * Finds the longest contiguous subarray in which no value occurs more than k times.
 * @param nums - Input array with values in the range [1, 10^9].
 * @param k - Maximum allowed frequency of any single value inside the window.
 * @return Length of the longest good subarray.
 */
function maxSubarrayLength(nums: number[], k: number): number {
  const length = nums.length;

  // No value can appear more than `length` times, so the whole array already qualifies
  if (k >= length) {
    return length;
  }

  // Smallest power-of-two table holding 2 * length, capping the load factor at 0.5
  const tableBits = 32 - Math.clz32(length * 2 - 1);
  const tableSize = 1 << tableBits;
  const tableMask = tableSize - 1;
  const hashShift = 32 - tableBits;

  // Freshly zeroed by the allocator, so key 0 already marks every slot as empty
  const hashSlotKeys = new Int32Array(tableSize);
  const slotCounts = new Int32Array(tableSize);
  const slotOfIndex = new Int32Array(length);

  let bestLength = 0;
  let left = 0;

  for (let right = 0; right < length; right += 1) {
    const value = nums[right];

    // Linear probing; a stored key of 0 means empty because every value is >= 1
    let slot = Math.imul(value, HASH_MULTIPLIER) >>> hashShift;
    let storedKey = hashSlotKeys[slot];
    while (storedKey !== 0 && storedKey !== value) {
      slot = (slot + 1) & tableMask;
      storedKey = hashSlotKeys[slot];
    }
    hashSlotKeys[slot] = value;

    // Caching the resolved slot lets the left pointer shrink without ever re-hashing
    slotOfIndex[right] = slot;

    const updatedCount = slotCounts[slot] + 1;
    slotCounts[slot] = updatedCount;

    // Only the value just added can violate the limit, so shrink until it fits again
    if (updatedCount > k) {
      do {
        slotCounts[slotOfIndex[left]] -= 1;
        left += 1;
      } while (slotCounts[slot] > k);
    }

    const windowLength = right - left + 1;
    if (windowLength > bestLength) {
      bestLength = windowLength;
    }
  }

  return bestLength;
}
