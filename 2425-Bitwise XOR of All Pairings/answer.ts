function xorAllNums(nums1: number[], nums2: number[]): number {
  let result = 0;

  if (nums2.length % 2 === 1) {
    for (const num of nums1) {
      result ^= num;
    }
  }

  if (nums1.length % 2 === 1) {
    for (const num of nums2) {
      result ^= num;
    }
  }

  return result;
}
