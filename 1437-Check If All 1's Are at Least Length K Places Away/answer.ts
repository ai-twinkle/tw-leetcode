function kLengthApart(nums: number[], k: number): boolean {
  // Cache length to avoid repeated property access in the loop
  const length = nums.length;

  // Track index of the previous '1'; initialize far enough to always pass for the first '1'
  let previousOneIndex = -k - 1;

  for (let index = 0; index < length; index++) {
    // Read once to avoid repeated indexing cost
    const value = nums[index];

    // Only act when we see a '1'
    if (value === 1) {
      // Check distance from the previous '1'; if too close, return early
      if (index - previousOneIndex <= k) {
        return false;
      }

      // Update previous '1' position
      previousOneIndex = index;
    }
  }

  // If we never violated the distance constraint, the layout is valid
  return true;
}
