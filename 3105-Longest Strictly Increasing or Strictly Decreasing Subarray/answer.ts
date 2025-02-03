function longestMonotonicSubarray(nums: number[]): number {
  const n = nums.length;

  let maxLength = 1;
  let currentLength = 1;
  // The type of the current subarray:
  // 1 for increasing,
  // -1 for decreasing,
  // 0 for none (or reset)
  let currentType = 0;

  for (let i = 1; i < n; i++) {
    const different = nums[i] - nums[i - 1];
    // Determine the new trend
    const newType = different > 0 ? 1 : different < 0 ? -1 : 0;

    if (newType === 0) {
      // Reset when equal.
      currentLength = 1;
      currentType = 0;
    } else if (newType === currentType) {
      // Continue in the same direction.
      currentLength++;
    } else {
      // New trend: start a new subarray that includes the previous element.
      currentLength = 2;
      currentType = newType;
    }

    // Update the maximum length.
    if (currentLength > maxLength) {
      maxLength = currentLength;
    }
  }

  return maxLength;
}
