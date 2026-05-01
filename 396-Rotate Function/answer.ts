function maxRotateFunction(nums: number[]): number {
  const n = nums.length;

  // Compute total sum and initial F(0) in a single pass to avoid double iteration
  let totalSum = 0;
  let currentF = 0;
  for (let index = 0; index < n; index++) {
    const value = nums[index];
    totalSum += value;
    currentF += index * value;
  }

  let maxF = currentF;

  // Use recurrence relation: F(k) = F(k-1) + totalSum - n * nums[n-k]
  // Iterate index from n-1 down to 1, which corresponds to nums[n-k] for k from 1 to n-1
  for (let index = n - 1; index >= 1; index--) {
    currentF += totalSum - n * nums[index];
    // Inline max comparison is faster than Math.max function call
    if (currentF > maxF) {
      maxF = currentF;
    }
  }

  return maxF;
}
