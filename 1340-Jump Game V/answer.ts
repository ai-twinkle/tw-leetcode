function maxJumps(arr: number[], d: number): number {
  const arrayLength = arr.length;

  // Copy input into a typed array for faster repeated access
  const values = new Int32Array(arr);

  // Pack (value, index) into single integers for efficient sorting
  // value occupies high bits, index occupies low 10 bits (since arrayLength <= 1000 < 1024)
  const packedPairs = new Float64Array(arrayLength);
  for (let index = 0; index < arrayLength; index++) {
    packedPairs[index] = values[index] * 1024 + index;
  }

  // Sort ascending: process smaller values first so dependencies are ready
  packedPairs.sort();

  // dp[i] = maximum indices visitable starting from index i (includes itself)
  const dp = new Int32Array(arrayLength);

  let globalMaximum = 1;

  // Process each index in ascending order of its value
  for (let order = 0; order < arrayLength; order++) {
    const currentIndex = packedPairs[order] & 1023;
    const currentValue = values[currentIndex];

    // Track best dp among reachable destinations
    let bestReachableDp = 0;

    // Scan rightward: stop when distance exceeds d or a value >= currentValue blocks the path
    const rightLimit = currentIndex + d < arrayLength ? currentIndex + d : arrayLength - 1;
    for (let neighbor = currentIndex + 1; neighbor <= rightLimit; neighbor++) {
      // Blocked: arr[neighbor] >= currentValue means we cannot jump over or onto it
      if (values[neighbor] >= currentValue) {
        break;
      }
      if (dp[neighbor] > bestReachableDp) {
        bestReachableDp = dp[neighbor];
      }
    }

    // Scan leftward with the same blocking rule
    const leftLimit = currentIndex - d > 0 ? currentIndex - d : 0;
    for (let neighbor = currentIndex - 1; neighbor >= leftLimit; neighbor--) {
      if (values[neighbor] >= currentValue) {
        break;
      }
      if (dp[neighbor] > bestReachableDp) {
        bestReachableDp = dp[neighbor];
      }
    }

    // Current index contributes 1, plus the best chain from any reachable neighbor
    const currentDp = bestReachableDp + 1;
    dp[currentIndex] = currentDp;

    if (currentDp > globalMaximum) {
      globalMaximum = currentDp;
    }
  }

  return globalMaximum;
}
