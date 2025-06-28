function maxSubsequence(nums: number[], k: number): number[] {
  const n = nums.length;
  // Build [0,1,2,…,n-1]
  const indices = Array.from({ length: n }, (_, i) => i);

  // Sort indices by corresponding nums value, descending
  indices.sort((a, b) => nums[b] - nums[a]);

  // Take the top k indices
  const topK = indices.slice(0, k);
  // put them back in original order
  topK.sort((a, b) => a - b);

  // Map back to values
  return topK.map(i => nums[i]);
}
