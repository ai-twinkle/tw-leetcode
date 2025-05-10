function minSum(nums1: number[], nums2: number[]): number {
  // 1. Track sum of non-zero elements and count of zeros in each array
  let sumWithoutZeros1 = 0;
  let sumWithoutZeros2 = 0;
  let zeroCount1 = 0;
  let zeroCount2 = 0;

  // 2. First pass: for nums1, accumulate non-zero values and count zeros
  for (let i = 0, n = nums1.length; i < n; ++i) {
    const v = nums1[i];
    if (v === 0) {
      zeroCount1++;
    } else {
      sumWithoutZeros1 += v;
    }
  }

  // 3. Second pass: for nums2, same accumulation and zero count
  for (let i = 0, n = nums2.length; i < n; ++i) {
    const v = nums2[i];
    if (v === 0) {
      zeroCount2++;
    } else {
      sumWithoutZeros2 += v;
    }
  }

  // 4. Compute the minimal achievable sums by replacing every zero with 1
  const minimalSum1 = sumWithoutZeros1 + zeroCount1;
  const minimalSum2 = sumWithoutZeros2 + zeroCount2;

  // 5. Choose the larger minimal sum as our target equal sum
  const target = minimalSum1 > minimalSum2 ? minimalSum1 : minimalSum2;

  // 6. Impossibility check:
  //    if an array has no zeros but its current sum < target, we can’t raise it
  if (
    (zeroCount1 === 0 && target > sumWithoutZeros1) ||
    (zeroCount2 === 0 && target > sumWithoutZeros2)
  ) {
    return -1;
  }

  // 7. Otherwise, that target is the minimal equal sum achievable
  return target;
}
