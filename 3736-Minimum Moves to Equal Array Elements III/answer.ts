function minMoves(nums: number[]): number {
  const length = nums.length;
  let maximum = 0;
  let sum = 0;

  // Find the maximum and the sum in one pass
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    sum += value;
    if (value > maximum) {
      maximum = value;
    }
  }

  // Raise every element up to the maximum: total gap = maximum * length - sum
  return maximum * length - sum;
}
