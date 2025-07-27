function countHillValley(nums: number[]): number {
  // Preprocess to remove consecutive duplicates for efficiency and clarity
  const length = nums.length;
  const filteredArray = new Uint8Array(length);
  let filteredLength = 0;
  let previousValue = -1;
  for (let i = 0; i < length; ++i) {
    if (nums[i] !== previousValue) {
      filteredArray[filteredLength++] = nums[i];
      previousValue = nums[i];
    }
  }

  let count = 0;
  // Only need to check inner elements, i.e., indices 1 to filteredLength - 2
  for (let i = 1; i < filteredLength - 1; ++i) {
    const leftNeighbor = filteredArray[i - 1];
    const rightNeighbor = filteredArray[i + 1];
    const currentValue = filteredArray[i];

    // Must have non-equal neighbors on both sides (guaranteed after filtering)
    if (
      (currentValue > leftNeighbor && currentValue > rightNeighbor) || // Hill
      (currentValue < leftNeighbor && currentValue < rightNeighbor)    // Valley
    ) {
      count++;
    }
  }
  return count;
}
