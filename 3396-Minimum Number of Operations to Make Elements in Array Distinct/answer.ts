function minimumOperations(nums: number[]): number {
  // Create a boolean array of size 101; initialized to false.
  const seen = new Array<boolean>(101).fill(false);
  let firstDuplicateIndex = nums.length;

  // Iterate from the end of the array to identify the start of the unique suffix.
  for (let i = nums.length - 1; i >= 0; i--) {
    const num = nums[i];
    // If the number has already been seen, break out as we've found the duplicate.
    if (seen[num]) {
      break;
    }
    seen[num] = true;
    firstDuplicateIndex = i;
  }

  // Each operation removes 3 elements.
  // `|0` is equivalent to Math.floor() for positive numbers.
  return ((firstDuplicateIndex + 2) / 3) | 0;
}
