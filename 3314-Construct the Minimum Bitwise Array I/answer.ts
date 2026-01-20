function minBitwiseArray(nums: number[]): number[] {
  const length = nums.length;

  for (let index = 0; index < length; index++) {
    const value = nums[index];

    if ((value & 1) === 0) {
      // Even x cannot be formed by a OR (a + 1).
      nums[index] = -1;
    } else {
      // Lowest zero bit of value; the answer is value - (thatBit / 2).
      const lowestZeroBit = ((~value) & (value + 1)) >>> 0;
      nums[index] = value - (lowestZeroBit >>> 1);
    }
  }

  return nums;
}
