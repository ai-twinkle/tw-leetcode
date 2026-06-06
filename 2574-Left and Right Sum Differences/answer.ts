function leftRightDifference(nums: number[]): number[] {
  const length = nums.length;
  // Int32Array is sufficient: max |difference| <= sum <= 1000 * 1e5 = 1e8 < 2^31
  const absoluteDifferences = new Int32Array(length);

  // First pass: accumulate the total sum used to derive rightSum implicitly
  let totalSum = 0;
  for (let index = 0; index < length; index++) {
    totalSum += nums[index];
  }

  // Second pass: maintain running leftSum, compute |leftSum - rightSum| in O(1)
  let leftSum = 0;
  for (let index = 0; index < length; index++) {
    const currentValue = nums[index];
    // Algebraic simplification: leftSum - rightSum = 2*leftSum + nums[i] - totalSum
    const signedDifference = (leftSum << 1) + currentValue - totalSum;
    // Branchless absolute value using sign-mask on 32-bit integer representation
    const signMask = signedDifference >> 31;
    absoluteDifferences[index] = (signedDifference ^ signMask) - signMask;
    leftSum += currentValue;
  }

  return absoluteDifferences as unknown as number[];
}
