function lenLongestFibSubseq(arr: number[]): number {
  const n = arr.length;

  // Create a map to store the index of each number
  const indexMap = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    indexMap.set(arr[i], i);
  }

  // Use a map to store the dp state
  // The key of dp is represented by (i << 16) | j,
  // which means the Fibonacci-like sequence ending with arr[i] and arr[j]
  const dp = new Map<number, number>();
  let maxLength = 0;

  // Iterate all possible pairs (i, j) (i < j)
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < j; i++) {

      // For the sequence ending with arr[i] and arr[j], the ideal previous number should be arr[j] - arr[i]
      const prev = arr[j] - arr[i];

      // Because the sequence must be strictly increasing,
      // the previous number must be lower than arr[i] and must exist in the original array
      if (prev < arr[i] && indexMap.has(prev)) {
        // Find the index of the previous number
        const k = indexMap.get(prev)!;

        // Get the length of the sequence ending with (k, i) from dp, default to 2 if not exists
        // (Even if the sequence is not found, the length is at least 2)
        const key = (k << 16) | i; // Combine k and i to form the key
        const currentLength = (dp.get(key) || 2) + 1;

        // Update dp, set the length of the sequence ending with (i, j)
        dp.set((i << 16) | j, currentLength);

        // Update the maximum length
        maxLength = Math.max(maxLength, currentLength);
      }
    }
  }

  // If the maximum length is less than 3, that means no valid sequence is found
  // We should return 0 in this case
  return maxLength >= 3 ? maxLength : 0;
}
