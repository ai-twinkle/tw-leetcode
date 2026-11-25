const MAX_LENGTH = 100001;
const MODULUS_FIRST = 67108859;
const MODULUS_SECOND = 67108837;
const BASE_FIRST = 100003;
const BASE_SECOND = 131071;
// p^2 + p stays below 2^53, so one subtraction + one modulo is exact in doubles
const MODULUS_FIRST_SQUARE = MODULUS_FIRST * MODULUS_FIRST;
const MODULUS_SECOND_SQUARE = MODULUS_SECOND * MODULUS_SECOND;

// Powers of both bases, computed once and shared by every call
const powerFirst = new Float64Array(MAX_LENGTH + 1);
const powerSecond = new Float64Array(MAX_LENGTH + 1);
powerFirst[0] = 1;
powerSecond[0] = 1;
for (let index = 1; index <= MAX_LENGTH; index++) {
  powerFirst[index] = (powerFirst[index - 1] * BASE_FIRST) % MODULUS_FIRST;
  powerSecond[index] = (powerSecond[index - 1] * BASE_SECOND) % MODULUS_SECOND;
}

/**
 * Finds the minimum length of a subarray that occurs exactly once in nums.
 * @param nums The input array.
 * @returns The minimum length of a unique subarray.
 */
function smallestUniqueSubarray(nums: number[]): number {
  const length = nums.length;

  // Length 1: any value that appears once is already unique
  const valueCount = new Uint32Array(MAX_LENGTH);
  for (let index = 0; index < length; index++) {
    valueCount[nums[index]]++;
  }
  for (let index = 0; index < length; index++) {
    if (valueCount[nums[index]] === 1) {
      return 1;
    }
  }

  // Prefix hashes under both moduli
  const prefixFirst = new Float64Array(length + 1);
  const prefixSecond = new Float64Array(length + 1);
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    prefixFirst[index + 1] = (prefixFirst[index] * BASE_FIRST + value) % MODULUS_FIRST;
    prefixSecond[index + 1] = (prefixSecond[index] * BASE_SECOND + value) % MODULUS_SECOND;
  }

  // Open-addressing table; a generation stamp avoids clearing between rounds
  let capacity = 1;
  while (capacity < length * 2) {
    capacity <<= 1;
  }
  const mask = capacity - 1;
  const keyFirst = new Int32Array(capacity);
  const keySecond = new Int32Array(capacity);
  const slotCount = new Uint8Array(capacity);
  const slotStamp = new Int32Array(capacity);
  const usedSlots = new Int32Array(length);
  let generation = 0;

  /**
   * Checks whether some subarray of the given width occurs exactly once.
   * @param width The subarray length to test.
   * @returns True if a unique subarray of this width exists.
   */
  const hasUniqueOfWidth = (width: number): boolean => {
    generation++;
    const multiplierFirst = powerFirst[width];
    const multiplierSecond = powerSecond[width];
    let usedCount = 0;

    for (let start = 0, end = width; end <= length; start++, end++) {
      const hashFirst = (prefixFirst[end] + MODULUS_FIRST_SQUARE - prefixFirst[start] * multiplierFirst) % MODULUS_FIRST;
      const hashSecond = (prefixSecond[end] + MODULUS_SECOND_SQUARE - prefixSecond[start] * multiplierSecond) % MODULUS_SECOND;

      // Mix both hashes into a slot index, then probe linearly
      let slot = (Math.imul(hashFirst, 0x9e3779b1) ^ hashSecond) & mask;
      while (true) {
        if (slotStamp[slot] !== generation) {
          slotStamp[slot] = generation;
          keyFirst[slot] = hashFirst;
          keySecond[slot] = hashSecond;
          slotCount[slot] = 1;
          usedSlots[usedCount++] = slot;
          break;
        }
        if (keyFirst[slot] === hashFirst && keySecond[slot] === hashSecond) {
          slotCount[slot] = 2;
          break;
        }
        slot = (slot + 1) & mask;
      }
    }

    for (let index = 0; index < usedCount; index++) {
      if (slotCount[usedSlots[index]] === 1) {
        return true;
      }
    }
    return false;
  };

  // Uniqueness is monotonic in width, so binary search the smallest valid one
  let low = 2;
  let high = length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (hasUniqueOfWidth(middle)) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }
  return low;
}
