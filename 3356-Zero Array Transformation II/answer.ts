function minZeroArray(nums: number[], queries: number[][]): number {
  const n = nums.length;
  const m = queries.length;
  // Difference array to record range updates
  const diff = new Int32Array(n + 1);

  // queriesUsed counts how many queries have been applied so far
  let queriesUsed = 0;
  // cumulativeDecrement holds the total decrement applied up to the previous index
  let cumulativeDecrement = 0;

  // Process each index in nums
  for (let i = 0; i < n; i++) {
    // currentDecrement is the total decrement available at index i
    let currentDecrement = cumulativeDecrement + diff[i];

    // If currentDecrement is insufficient for nums[i],
    // apply additional queries until it meets the requirement.
    while (currentDecrement < nums[i]) {
      // If no more queries are available, it's impossible to reach zero.
      if (queriesUsed === m) {
        return -1;
      }

      // Take the next query.
      const [l, r, v] = queries[queriesUsed++];

      // If the query does not affect index i, skip it.
      if (r < i) {
        continue;
      }

      // Determine the effective starting index for this query update.
      // We only need to update from the later of l or i.
      const effectiveStart = Math.max(l, i);
      diff[effectiveStart] += v;
      diff[r + 1] -= v;

      // Recalculate the current decrement at index i after applying this query.
      currentDecrement = cumulativeDecrement + diff[i];
    }

    // Update the cumulative decrement for the next index.
    cumulativeDecrement = currentDecrement;
  }

  return queriesUsed;
}
