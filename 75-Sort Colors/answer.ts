function sortColors(nums: number[]): void {
  const lengthOfArray = nums.length;
  let zeroCount = 0;
  let oneCount = 0;

  // 1. Count how many 0’s and 1’s (2’s can be derived)
  for (let index = 0; index < lengthOfArray; index++) {
    const currentValue = nums[index];
    if (currentValue === 0) {
      zeroCount++;
    } else if (currentValue === 1) {
      oneCount++;
    }
    // No else – if it's 2 we just skip
  }

  // 2. Rewrite segments in-place using native .fill (O(1) per element in C++)
  const firstPartitionEnd = zeroCount;
  const secondPartitionEnd = zeroCount + oneCount;

  nums.fill(0, 0, firstPartitionEnd);
  nums.fill(1, firstPartitionEnd, secondPartitionEnd);
  nums.fill(2, secondPartitionEnd, lengthOfArray);
}
