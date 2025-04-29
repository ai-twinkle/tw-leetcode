function countSubarrays(nums: number[], k: number): number {
  const n = nums.length;

  // 1) Find the global maximum
  let globalMax = -Infinity;
  for (let i = 0; i < n; ++i) {
    const v = nums[i];
    if (v > globalMax) {
      globalMax = v;
    }
  }

  // 2) Use a fixed-size typed array as a queue of positions where nums[i] === globalMax
  const positions = new Int32Array(n);
  let tail = 0;
  let maxCountSoFar = 0;
  let result = 0;

  // 3) Slide over nums once more, pushing global-max indices into positions[]
  for (let i = 0; i < n; ++i) {
    if (nums[i] === globalMax) {
      positions[tail++] = i;
      ++maxCountSoFar;
    }
    // Once we've seen at least k, every subarray ending at i
    // with its k-th-last max at positions[tail-k] is valid
    if (maxCountSoFar >= k) {
      // positions[tail-k] is the index of the k-th most recent max
      // any left boundary L ≤ that index gives you ≥k maxes
      result += positions[tail - k] + 1;
    }
  }

  return result;
}
