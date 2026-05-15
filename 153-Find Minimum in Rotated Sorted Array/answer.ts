function findMin(nums: number[]): number {
  const length = nums.length;
  let right = length - 1;
  const rightmostValue = nums[right];

  // Early exit: array is not effectively rotated, first element is the minimum
  if (nums[0] <= rightmostValue) {
    return nums[0];
  }

  let left = 0;
  // Binary search for the inflection point (the minimum element)
  while (left < right) {
    // Unsigned right shift for fast integer midpoint, avoids overflow
    const middle = (left + right) >>> 1;
    const middleValue = nums[middle];

    // If middle value is greater than rightmost, minimum is in the right half
    if (middleValue > nums[right]) {
      left = middle + 1;
    } else {
      // Minimum is at middle or in the left half (middle is a candidate)
      right = middle;
    }
  }

  return nums[left];
}
