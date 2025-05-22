function maxRemoval(nums: number[], queries: number[][]): number {
  const n = nums.length;
  const queryCount = queries.length;

  // 1. Bucket-count for counting-sort queries by their start index
  const startCounts = new Int32Array(n + 1);
  for (let i = 0; i < queryCount; i++) {
    startCounts[queries[i][0]]++;
  }
  // Prefix sum to get position indices
  for (let i = 1; i <= n; i++) {
    startCounts[i] += startCounts[i - 1];
  }

  // 2. Reorder queries by start index using the counting-sort result
  const sortedStart = new Int32Array(queryCount);
  const sortedEnd = new Int32Array(queryCount);

  for (let i = queryCount - 1; i >= 0; i--) {
    const leftIndex = queries[i][0];
    const rightIndex = queries[i][1];
    startCounts[leftIndex]--;

    const position = startCounts[leftIndex];
    sortedStart[position] = leftIndex;
    sortedEnd[position] = rightIndex;
  }

  // 3. Prepare interval end buckets for available and running intervals
  const availableCounts = new Int32Array(n); // unused intervals ending at each pos
  const runningCounts = new Int32Array(n);   // active intervals ending at each pos

  let totalAvailable = queryCount;       // number of intervals not yet chosen
  let totalRunning = 0;              // number of intervals currently covering pos
  let currentMaxAvailableEnd = -1;   // pointer for max available interval end
  let currentMinRunningEnd = 0;      // pointer for expiring running intervals

  let readPointer = 0; // pointer into sorted queries
  for (let position = 0; position < n; position++) {
    // Enqueue all intervals starting at or before this position
    while (readPointer < queryCount && sortedStart[readPointer] <= position) {
      const endPosition = sortedEnd[readPointer++];
      availableCounts[endPosition] += 1;
      if (endPosition > currentMaxAvailableEnd) {
        currentMaxAvailableEnd = endPosition;
      }
    }

    // Remove (expire) any running intervals that ended before this position
    while (currentMinRunningEnd < position) {
      const count = runningCounts[currentMinRunningEnd];
      if (count !== 0) {
        totalRunning -= count;
        runningCounts[currentMinRunningEnd] = 0;
      }
      currentMinRunningEnd++;
    }

    // Determine how many more intervals we need at this position
    let needed = nums[position] - totalRunning;
    while (needed > 0) {
      // If no available interval can cover this position, return -1
      if (currentMaxAvailableEnd < position) {
        return -1;
      }
      // Use the interval with the furthest end that can cover this position
      const chosenEnd = currentMaxAvailableEnd;
      availableCounts[chosenEnd]--;
      totalAvailable--;

      // Move the pointer to the next non-empty available interval
      if (availableCounts[chosenEnd] === 0) {
        while (
          currentMaxAvailableEnd >= 0 &&
          availableCounts[currentMaxAvailableEnd] === 0
          ) {
          currentMaxAvailableEnd--;
        }
      }

      // Mark this interval as running
      runningCounts[chosenEnd]++;
      totalRunning++;
      needed--;
    }
  }

  // 4. Remaining available intervals are the maximum removable
  return totalAvailable;
}
