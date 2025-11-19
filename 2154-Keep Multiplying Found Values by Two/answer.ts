const MAXIMUM_ALLOWED_VALUE = 1000;

/**
 * Repeatedly doubles `original` while it is present in `nums`,
 * then returns the final value when it is no longer found.
 *
 * @param nums - The list of numbers to search within.
 * @param original - The starting value that will be repeatedly doubled.
 * @returns The final value of original after the doubling process stops.
 */
function findFinalValue(nums: number[], original: number): number {
  // Presence map for values in nums, using a compact typed array
  const presenceMap = new Uint8Array(MAXIMUM_ALLOWED_VALUE + 1);

  const length = nums.length;

  // Mark all values in nums as present (within the allowed range)
  for (let index = 0; index < length; index += 1) {
    const value = nums[index];

    if (value <= MAXIMUM_ALLOWED_VALUE) {
      // Mark this value as present
      presenceMap[value] = 1;
    }
  }

  // Start with the given original value
  let currentValue = original;

  // Keep doubling while the current value exists in nums
  // As soon as currentValue exceeds the constraint upper bound,
  // it cannot be in nums anymore, so we can stop.
  while (
    currentValue <= MAXIMUM_ALLOWED_VALUE &&
    presenceMap[currentValue] === 1
    ) {
    // Multiply the current value by 2 and continue checking
    currentValue = currentValue * 2;
  }

  // When it is no longer found, return the final value
  return currentValue;
}
