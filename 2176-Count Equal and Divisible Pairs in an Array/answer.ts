function countPairs(nums: number[], k: number): number {
  const n = nums.length;
  let total = 0;

  for (let i = 0; i < n; ++i) {
    const vi = nums[i];
    for (let j = i + 1; j < n; ++j) {
      if (vi === nums[j] && (i * j) % k === 0) {
        ++total;
      }
    }
  }
  return total;
}
