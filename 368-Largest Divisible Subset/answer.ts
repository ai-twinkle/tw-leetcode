function largestDivisibleSubset(nums: number[]): number[] {
  const n = nums.length;

  if (n === 0) {
    return [];
  }

  // Sort the numbers in ascending order
  nums.sort((a, b) => a - b);

  // Create an array to store the size of the largest divisible subset ending at each index
  const dp = new Uint16Array(n).fill(1);

  // Create an array to store the previous index of each number in the largest divisible subset
  const prev = new Int16Array(n).fill(-1);

  let maxSize = 1;
  let maxIndex = 0;
  // Fill the dp and prev arrays
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] % nums[j] === 0 && dp[i] < dp[j] + 1) {
        dp[i] = dp[j] + 1;
        prev[i] = j;
      }
    }
    // Update the maximum size and index if needed
    if (dp[i] > maxSize) {
      maxSize = dp[i];
      maxIndex = i;
    }
  }

  // Reconstruct the largest divisible subset
  const result: number[] = [];
  while (maxIndex !== -1) {
    result.push(nums[maxIndex]);
    maxIndex = prev[maxIndex];
  }

  // Reverse the result to get the correct order
  result.reverse();
  return result;
}
