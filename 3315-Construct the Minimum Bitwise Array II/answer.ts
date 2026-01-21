function minBitwiseArray(nums: number[]): number[] {
  for (let index = 0; index < nums.length; index++) {
    const value = nums[index] | 0;

    // a | (a + 1) is always odd, so only prime=2 is impossible here.
    if ((value & 1) === 0) {
      nums[index] = -1;
    } else {
      // Use the lowest set bit of (value + 1) to jump directly to the minimal answer.
      const nextValue = (value + 1) | 0;
      const lowestSetBit = nextValue & -nextValue;
      nums[index] = value - (lowestSetBit >>> 1);
    }
  }

  return nums;
}
