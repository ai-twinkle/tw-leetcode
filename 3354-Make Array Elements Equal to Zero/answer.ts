function countValidSelections(nums: number[]): number {
  const length = nums.length;

  // Compute total sum of all elements
  let totalSum = 0;
  for (let i = 0; i < length; i++) {
    totalSum += nums[i];
  }

  let totalValidSelections = 0;
  let leftSum = 0; // Running sum of elements to the left

  for (let i = 0; i < length; i++) {
    // Check only positions where value is zero
    if (nums[i] === 0) {
      // Compute the difference between left and right sums
      const difference = Math.abs(2 * leftSum - totalSum);

      // Valid if difference <= 1 (add 2 for diff=0, add 1 for diff=1)
      if (difference <= 1) {
        totalValidSelections += 2 - difference;
      }
    }

    // Update prefix sum including current element
    leftSum += nums[i];
  }

  // Return total number of valid selections
  return totalValidSelections;
}
