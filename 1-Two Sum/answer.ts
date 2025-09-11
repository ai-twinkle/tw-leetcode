function twoSum(nums: number[], target: number): number[] {
  // Map from value -> the earliest index where it appears
  const indexByValue = new Map<number, number>();

  // Single pass: for each value, check if its complement was seen earlier.
  for (let index = 0; index < nums.length; index++) {
    const value = nums[index];
    const required = target - value;

    // If we have seen the required complement, return the pair of indices.
    const complementIndex = indexByValue.get(required);
    if (complementIndex !== undefined) {
      return [complementIndex, index];
    }

    // Store the current value's index only if not present to keep the earliest index.
    // (Ensures we never reuse the same element and helps with duplicates.)
    if (!indexByValue.has(value)) {
      indexByValue.set(value, index);
    }
  }

  // Per problem statement, a solution always exists; this is a safety fallback.
  return [];
}
