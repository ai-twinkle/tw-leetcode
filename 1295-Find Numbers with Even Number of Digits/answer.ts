function findNumbers(nums: number[]): number {
  const n = nums.length;
  let totalEvenDigitCount = 0;

  for (let i = 0; i < n; i++) {
    const value = nums[i];

    // direct range checks for 2, 4, 6, 8, … digit numbers
    if (
      (value >= 10         && value < 100)         || //  2 digits
      (value >= 1_000      && value < 10_000)      || //  4 digits
      (value >= 100_000    && value < 1_000_000)      //  6 digits
    ) {
      totalEvenDigitCount++;
    }
  }

  return totalEvenDigitCount;
}
