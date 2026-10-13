const ABSOLUTE_VALUE_LIMIT = 40001;
const QUICKSELECT_LENGTH_LIMIT = 16384;

/**
 * Computes the maximum alternating score obtainable by rearranging the array.
 *
 * Rearranging freely means the alternating pattern only fixes how many elements
 * receive a plus sign, namely ceil(n / 2). Squaring also discards the original
 * sign, so the answer is simply the sum of the largest ceil(n / 2) squares minus
 * the sum of the remaining ones, which equals 2 * largestSum - totalSum.
 *
 * @param nums - The integer array whose elements may be rearranged.
 * @returns The maximum possible alternating score.
 */
function maxAlternatingSum(nums: number[]): number {
  const length = nums.length;

  // A single element always sits on a plus position.
  if (length === 1) {
    return nums[0] * nums[0];
  }

  // Plus positions are the even indices, so there are ceil(length / 2) of them.
  const positiveSlotCount = (length + 1) >> 1;

  if (length <= QUICKSELECT_LENGTH_LIMIT) {
    // Squares stay within 1.6e9, so Int32Array holds them without truncation.
    const squares = new Int32Array(length);
    let totalSquareSum = 0;
    for (let index = 0; index < length; index++) {
      const value = nums[index];
      const square = value * value;
      squares[index] = square;
      totalSquareSum += square;
    }

    // Quickselect only needs the top group gathered in the tail, not a full sort.
    const splitIndex = length - positiveSlotCount;
    let low = 0;
    let high = length - 1;
    while (low < high) {
      // Median-of-three pivot keeps sorted and reverse-sorted inputs linear.
      const middle = (low + high) >> 1;
      const first = squares[low];
      const second = squares[middle];
      const third = squares[high];
      let pivot: number;
      if (first < second) {
        pivot = second < third ? second : first < third ? third : first;
      } else {
        pivot = first < third ? first : second < third ? third : second;
      }

      // Hoare partition splits duplicates evenly, so equal values stay O(n).
      let left = low;
      let right = high;
      while (left <= right) {
        while (squares[left] < pivot) {
          left++;
        }
        while (squares[right] > pivot) {
          right--;
        }
        if (left <= right) {
          const swapped = squares[left];
          squares[left] = squares[right];
          squares[right] = swapped;
          left++;
          right--;
        }
      }

      // Recurse into the single side that still contains the split boundary.
      if (splitIndex <= right) {
        high = right;
      } else if (splitIndex >= left) {
        low = left;
      } else {
        break;
      }
    }

    let largestSquareSum = 0;
    for (let index = splitIndex; index < length; index++) {
      largestSquareSum += squares[index];
    }
    return largestSquareSum * 2 - totalSquareSum;
  }

  // Large inputs: bucket by absolute value, which bounds the work by the value range.
  const absoluteValueCounts = new Int32Array(ABSOLUTE_VALUE_LIMIT);
  let totalSquareSum = 0;
  for (let index = 0; index < length; index++) {
    let value = nums[index];
    if (value < 0) {
      value = -value;
    }
    absoluteValueCounts[value]++;
    totalSquareSum += value * value;
  }

  // Walk buckets downward and stop as soon as every plus slot is filled.
  let remainingSlots = positiveSlotCount;
  let largestSquareSum = 0;
  for (let value = ABSOLUTE_VALUE_LIMIT - 1; remainingSlots > 0; value--) {
    const count = absoluteValueCounts[value];
    if (count === 0) {
      continue;
    }
    const taken = count < remainingSlots ? count : remainingSlots;
    largestSquareSum += taken * value * value;
    remainingSlots -= taken;
  }

  return largestSquareSum * 2 - totalSquareSum;
}
