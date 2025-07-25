function maxSum(nums: number[]): number {
  // Use a typed array to efficiently track which positive values have been counted.
  // Index 1~100 maps to value 1~100.
  const presenceArray = new Uint8Array(101);

  // Store the sum of all unique positive values in the array.
  let positiveSum = 0;

  // Track the maximum element in the original array, for the case where all elements are non-positive.
  let maxElement = nums[0];

  // Iterate through each number in the input array.
  for (let i = 0, n = nums.length; i < n; ++i) {
    const current = nums[i];

    // If the current number is positive and has not been counted, add it to the sum.
    if (current > 0) {
      if (presenceArray[current] === 0) {
        presenceArray[current] = 1;
        positiveSum += current;
      }
    }

    // Always update the maximum element seen so far.
    if (current > maxElement) {
      maxElement = current;
    }
  }

  // If we found any positive numbers, return their sum. Otherwise, return the maximum element.
  return positiveSum > 0 ? positiveSum : maxElement;
}
