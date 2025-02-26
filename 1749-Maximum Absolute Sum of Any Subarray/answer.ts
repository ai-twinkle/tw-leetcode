function maxAbsoluteSum(nums: number[]): number {
  let runningSum = 0;
  let maxSum = 0;
  let minSum = 0;

  for (const num of nums) {
    runningSum += num;

    // Update maxSum and minSum
    maxSum = runningSum > maxSum ? runningSum : maxSum;
    minSum = runningSum < minSum ? runningSum : minSum;
  }

  return maxSum - minSum;
}
