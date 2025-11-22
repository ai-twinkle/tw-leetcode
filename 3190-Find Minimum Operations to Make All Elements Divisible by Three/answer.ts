function minimumOperations(nums: number[]): number {
  // Total operations required to fix all elements
  let totalOperations = 0;

  const length = nums.length;
  for (let index= 0; index < length; index++) {
    const value = nums[index];
    const remainder = value % 3;

    // If remainder is not zero, we need exactly 1 operation for this element
    if (remainder !== 0) {
      totalOperations = totalOperations + 1;
    }
  }

  return totalOperations;
}
