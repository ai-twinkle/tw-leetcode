function getMinDistance(nums: number[], target: number, start: number): number {
  const length = nums.length;

  // Expand outward from start; first match is guaranteed to be minimal distance
  for (let distance = 0; distance < length; distance++) {
    const leftIndex = start - distance;
    const rightIndex = start + distance;

    // Check left bound
    if (leftIndex >= 0 && nums[leftIndex] === target) {
      return distance;
    }

    // Check right bound
    if (rightIndex < length && nums[rightIndex] === target) {
      return distance;
    }
  }

  // Guaranteed to have target in nums, so this is unreachable
  return -1;
}
