function minCapability(nums: number[], k: number): number {
  /**
   * Helper function: checks if it's possible to rob at least k houses
   * without stealing from adjacent houses given a specific capability.
   * @param capability
   */
  const canRobWithCapability = (capability: number): boolean => {
    let count = 0;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] <= capability) {
        count++;
        i++; // Skip the adjacent house.

        if (count >= k) {
          // Early exit if we've reached k houses.
          return true;
        }
      }
    }
    return false;
  };

  // Set the search bounds based on the array values.
  let lower = Math.min(...nums);
  let higher = Math.max(...nums);

  // Binary search to find the minimum capability.
  while (lower < higher) {
    const middleNumber =(lower + higher) >> 1; // Equal to Math.floor((lower + higher) / 2)
    if (canRobWithCapability(middleNumber)) {
      // Found a valid capability, try to lower it.
      higher = middleNumber;
    } else {
      // Capability too low, increase it.
      lower = middleNumber + 1;
    }
  }

  return lower;
}
