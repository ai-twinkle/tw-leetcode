function maximumSum(nums: number[]): number {
  // 1 <= nums[i] <= 10^9
  // Which the largest digit sum is 9 x 9 = 81
  const maxDigitSum = 81;

  // Initialize best for each digit sum to -1 (indicating no value yet)
  const best: number[] = new Array(maxDigitSum + 1).fill(-1);

  // Initialize the max sum to -1
  let maxSum = -1;
  for (const num of nums) {
    let sum = 0;
    // Calculate the sum of the digits of the number
    for (let n = num; n > 0; n = Math.floor(n / 10)) {
      sum += n % 10;
    }

    if (best[sum] !== -1) {
      // If the sum of the digits has been seen before,
      // update the max sum and the best value for that sum
      maxSum = Math.max(maxSum, num + best[sum]);
      best[sum] = Math.max(best[sum], num);
    } else {
      // If the sum of the digits has not been seen before,
      // store the value for that sum
      best[sum] = num;
    }
  }

  return maxSum;
}
