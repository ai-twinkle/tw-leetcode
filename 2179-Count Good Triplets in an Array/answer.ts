function goodTriplets(nums1: number[], nums2: number[]): number {
  const n = nums1.length;

  // Build mapping: value -> its index in nums2.
  const posInNums2 = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    posInNums2[nums2[i]] = i;
  }

  // BIT is stored in a Uint32Array with 1-indexed logic.
  const bit = new Uint32Array(n + 1);
  let count = 0;

  for (let i = 0; i < n; i++) {
    const pos2 = posInNums2[nums1[i]];
    let left = 0;
    // --- BIT query: get prefix sum for pos2 ---
    // Convert to 1-indexed value for BIT.
    let j = pos2 + 1;
    while (j > 0) {
      left += bit[j];
      j -= j & -j;
    }

    // Calculate the remaining values:
    // totalGreater: total numbers with positions greater than pos2 in nums2.
    // placedGreater: how many of those have already been processed.
    const totalGreater = n - 1 - pos2;
    const placedGreater = i - left;
    const right = totalGreater - placedGreater;
    count += left * right;

    // --- BIT update: add 1 at position pos2 ---
    let index = pos2 + 1;
    while (index <= n) {
      bit[index]++;
      index += index & -index;
    }
  }

  return count;
}
