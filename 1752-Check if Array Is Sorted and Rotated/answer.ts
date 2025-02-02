function check(nums: number[]): boolean {
  const n = nums.length;

  // If the array is only one element, it is sorted.
  if (n === 1) {
    return true;
  }

  let findDecreasing = false;

  for (let i = 1; i < n; i++) {
    if (nums[i] < nums[i - 1]) {
      // If the current element is greater than the previous element, it is not sorted.
      // When it occurs for the second time, it cannot be rotated.
      if (findDecreasing) {
        return false;
      }

      findDecreasing = true;
    }
  }

  // This indicates that the array is already sorted.
  if (!findDecreasing) {
    return true;
  }

  // We check if the first element is greater than the last element.
  // So that we can rotate the array and make it sorted.
  return nums[0] >= nums[n - 1];
}
