function minMoves(nums: number[]): number {
  const length = nums.length;
  let minimumValue = nums[0];
  let totalSum = 0;

  // Single pass: accumulate the sum and track the minimum together
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    totalSum += value;
    if (value < minimumValue) {
      minimumValue = value;
    }
  }

  // Each element must drop down to the minimum, so moves = sum - n * min
  return totalSum - length * minimumValue;
}
