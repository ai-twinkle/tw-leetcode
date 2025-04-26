function countSubarrays(nums: number[], minK: number, maxK: number): number {
  const n = nums.length;

  let totalCount = 0;
  let lastMinKIndex = -1;
  let lastMaxKIndex = -1;
  let lastInvalidIndex = -1;

  for (let i = 0; i < n; ++i) {
    const v = nums[i];

    // mark any “invalid” position that breaks the bounds
    if (v < minK || v > maxK) {
      lastInvalidIndex = i;
    }

    // update latest minK/maxK positions
    if (v === minK) lastMinKIndex = i;
    if (v === maxK) lastMaxKIndex = i;

    // earliest position at which a valid subarray ending at i can start
    // (avoid the Math.min call)
    const earliestStart = lastMinKIndex < lastMaxKIndex
      ? lastMinKIndex
      : lastMaxKIndex;

    // any start after lastInvalidIndex is valid
    if (earliestStart > lastInvalidIndex) {
      totalCount += earliestStart - lastInvalidIndex;
    }
  }

  return totalCount;
}
