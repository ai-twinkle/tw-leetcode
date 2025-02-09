function countBadPairs(nums: number[]): number {
  // Total number of elements in the array.
  const n = nums.length;

  // Create a Map to store frequencies of the computed diff (nums[i] - i).
  const count = new Map<number, number>();

  // This will accumulate the count of good pairs where nums[i] - i is equal.
  let goodPairs = 0;

  // Loop through each element in the array.
  for (let i = 0; i < n; i++) {
    // Calculate the difference for the current index.
    // Two indices i and j form a good pair if nums[i] - i equals nums[j] - j.
    const diff = nums[i] - i;

    // Get the current frequency of this diff.
    // If the diff hasn't been seen before, default to 0.
    const current = count.get(diff) || 0;

    // Every previous occurrence with the same diff contributes to a good pair with the current index.
    goodPairs += current;

    // Update the frequency count for this diff.
    count.set(diff, current + 1);
  }

  // Calculate the total number of pairs (i, j) with i < j.
  const totalPairs = (n * (n - 1)) / 2;

  // The number of bad pairs is the total pairs minus the good pairs.
  return totalPairs - goodPairs;
}
