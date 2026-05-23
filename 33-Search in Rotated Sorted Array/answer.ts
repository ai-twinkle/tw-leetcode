function search(nums: number[], target: number): number {
  const length = nums.length;

  // Fast path: single-element array
  if (length === 1) {
    return nums[0] === target ? 0 : -1;
  }

  let left = 0;
  let right = length - 1;

  // Fast path: target outside the overall value range of the rotated array
  // The min/max of a rotated sorted array still lies at endpoints' neighborhood,
  // but a cheap reject is target vs both endpoints when array is not rotated
  if (nums[left] <= nums[right]) {
    // Array is not rotated, do plain binary search
    while (left <= right) {
      const middle = (left + right) >> 1;
      const middleValue = nums[middle];

      if (middleValue === target) {
        return middle;
      }

      if (middleValue < target) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    return -1;
  }

  // Rotated case: modified binary search
  while (left <= right) {
    const middle = (left + right) >> 1;
    const middleValue = nums[middle];

    if (middleValue === target) {
      return middle;
    }

    // Determine which half is sorted by comparing middle to left endpoint
    if (nums[left] <= middleValue) {
      // Left half [left..middle] is sorted in ascending order
      if (nums[left] <= target && target < middleValue) {
        // Target lies within the sorted left half
        right = middle - 1;
      } else {
        // Target must be in the right half
        left = middle + 1;
      }
    } else {
      // Right half [middle..right] is sorted in ascending order
      if (middleValue < target && target <= nums[right]) {
        // Target lies within the sorted right half
        left = middle + 1;
      } else {
        // Target must be in the left half
        right = middle - 1;
      }
    }
  }

  return -1;
}
