function findMin(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  // Early exit: strictly ascending from first to last means no effective rotation
  if (nums[left] < nums[right]) {
    return nums[left];
  }

  // Binary search for the inflection point (the minimum element)
  while (left < right) {
    // Unsigned right shift for fast integer midpoint
    const middle = (left + right) >>> 1;
    const middleValue = nums[middle];
    const rightValue = nums[right];

    if (middleValue > rightValue) {
      // Minimum is strictly in the right half
      left = middle + 1;
    } else if (middleValue < rightValue) {
      // Minimum is at middle or in the left half
      right = middle;
    } else {
      // Equal values: safely shrink the right boundary by one
      right = right - 1;
    }
  }

  return nums[left];
}
