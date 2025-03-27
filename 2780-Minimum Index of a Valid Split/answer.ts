function minimumIndex(nums: number[]): number {
  // Step 1: Find the dominant element using Boyer-Moore majority vote algorithm.
  let candidate = nums[0];
  let count = 0;
  for (const num of nums) {
    if (count === 0) {
      candidate = num;
    }
    count += (num === candidate ? 1 : -1);
  }

  // Count the total occurrences of the candidate.
  const totalCount = nums.reduce((acc, num) => num === candidate ? acc + 1 : acc, 0);
  const n = nums.length;

  // Step 2: Check each valid split index.
  let prefixCount = 0;
  for (let i = 0; i < n - 1; i++) {
    if (nums[i] === candidate) {
      prefixCount++;
    }
    // Check if candidate is dominant in the prefix and suffix.
    if (prefixCount > (i + 1) / 2 && (totalCount - prefixCount) > (n - i - 1) / 2) {
      return i;
    }
  }

  // Step 3: Return -1 if no valid split exists.
  return -1;
}
