function minimumCost(nums: number[]): number {
  // Basic constants: array length and mandatory first subarray cost
  const length = nums.length;
  const firstCost = nums[0];

  // State for minimizing the combined cost of the second and third subarrays
  let minimumSecondStart = nums[1];
  let minimumSecondThirdSum = minimumSecondStart + nums[2];

  // Single pass to enumerate the valid third-subarray starts while tracking the best second-subarray start
  for (let thirdStartIndex = 2; thirdStartIndex < length; thirdStartIndex++) {
    const candidateSum = minimumSecondStart + nums[thirdStartIndex];
    if (candidateSum < minimumSecondThirdSum) {
      minimumSecondThirdSum = candidateSum;
    }

    if (nums[thirdStartIndex] < minimumSecondStart) {
      minimumSecondStart = nums[thirdStartIndex];
    }
  }

  // Combine the fixed first cost with the optimal remaining cost
  return firstCost + minimumSecondThirdSum;
}
