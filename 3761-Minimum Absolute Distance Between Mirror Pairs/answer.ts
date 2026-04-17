/**
 * Reverses the digits of a non-negative integer.
 * @param num - The integer to reverse
 * @returns The reversed integer with leading zeros omitted
 */
function reverseNumber(num: number): number {
  let reversed = 0;
  while (num > 0) {
    // Extract last digit and append to reversed
    reversed = reversed * 10 + (num % 10);
    num = (num / 10) | 0;
  }
  return reversed;
}

/**
 * Finds the minimum absolute distance between indices of any mirror pair.
 * A mirror pair (i, j) satisfies reverse(nums[i]) == nums[j] with i < j.
 * Scans left-to-right tracking where each reversed value last appeared for O(n) time.
 * @param nums - The input integer array
 * @returns The minimum distance between any mirror pair, or -1 if none exists
 */
function minMirrorPairDistance(nums: number[]): number {
  const length = nums.length;
  // Map from reversed value -> last index that produced it via reverse(nums[i])
  const reversedValueLastIndex = new Map<number, number>();

  // Use an impossible distance so early exit only triggers on real pairs
  let minimumDistance = length + 1;

  for (let index = 0; index < length; index++) {
    const currentValue = nums[index];
    const currentReversed = reverseNumber(currentValue);

    // Check if nums[index] matches reverse(nums[i]) for some earlier i
    const previousIndex = reversedValueLastIndex.get(currentValue);
    if (previousIndex !== undefined) {
      const distance = index - previousIndex;
      if (distance < minimumDistance) {
        minimumDistance = distance;
      }
    }

    // Early exit: distance of 1 is the theoretical minimum
    if (minimumDistance === 1) {
      return 1;
    }

    // Store that reverse(nums[index]) = currentReversed was produced at this index
    const existingIndex = reversedValueLastIndex.get(currentReversed);
    if (existingIndex === undefined || index > existingIndex) {
      reversedValueLastIndex.set(currentReversed, index);
    }
  }

  return minimumDistance <= length ? minimumDistance : -1;
}
