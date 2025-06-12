function maxAdjacentDistance(nums: number[]): number {
  const n = nums.length;
  let maxDiff = 0;

  for (let i = 0; i < n; i++) {
    const nextIndex = (i + 1) % n;
    const diff = Math.abs(nums[i] - nums[nextIndex]);
    maxDiff = Math.max(maxDiff, diff);
  }

  return maxDiff;
}
