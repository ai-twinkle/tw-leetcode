function stoneGameVIII(stones: number[]): number {
  const stoneCount = stones.length;

  // Total of all stones, which is also prefix[stoneCount - 1].
  let runningPrefixSum = 0;
  for (let index = 0; index < stoneCount; index++) {
    runningPrefixSum += stones[index];
  }

  // Base case: the last boundary forces taking every stone.
  let bestDifference = runningPrefixSum;

  // Walk boundaries right-to-left, shrinking the prefix sum as we go.
  for (let index = stoneCount - 2; index >= 1; index--) {
    runningPrefixSum -= stones[index + 1];

    // Take everything up to this boundary and hand the rest to the opponent.
    const takeNowDifference = runningPrefixSum - bestDifference;

    // Manual comparison avoids Math.max call overhead in the hot loop.
    if (takeNowDifference > bestDifference) {
      bestDifference = takeNowDifference;
    }
  }

  return bestDifference;
}
