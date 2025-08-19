function zeroFilledSubarray(nums: number[]): number {
  let totalSubarrays = 0;
  let consecutiveZeros = 0;

  for (let index = 0, length = nums.length; index < length; index++) {
    if (nums[index] === 0) {
      consecutiveZeros++;
      totalSubarrays += consecutiveZeros;
    } else {
      consecutiveZeros = 0;
    }
  }

  return totalSubarrays;
}
