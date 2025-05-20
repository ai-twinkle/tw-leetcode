function isZeroArray(nums: number[], queries: number[][]): boolean {
  const arrayLength = nums.length;

  // Use a typed Int32Array to get native fast increments/decrements
  const differenceArray = new Int32Array(arrayLength + 1);

  // Cache queries.length and avoid array-destructuring and boundary checks
  const queryCount = queries.length;
  for (let i = 0; i < queryCount; ++i) {
    const currentQuery = queries[i];

    // The currentQuery[0] ∈ [0..arrayLength-1], so currentQuery[1]+1 ∈ [1..arrayLength]
    differenceArray[currentQuery[0]] += 1;
    differenceArray[currentQuery[1] + 1] -= 1;
  }

  // Accumulate in place and check on the fly—no extra “operations” array
  let cumulativeOperations = 0;
  for (let currentIndex = 0; currentIndex < arrayLength; ++currentIndex) {
    cumulativeOperations += differenceArray[currentIndex];

    // If nums[currentIndex] needs more decrements than we've recorded so far, we can’t zero it out
    if (nums[currentIndex] > cumulativeOperations) {
      return false;
    }
  }

  return true;
}
