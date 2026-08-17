function stoneGameV(stoneValue: number[]): number {
  const stoneCount = stoneValue.length;

  // A lone stone can never be divided, so no round is ever played.
  if (stoneCount < 2) {
    return 0;
  }

  // Prefix sums turn every range sum into a single subtraction.
  // The largest possible total is 500 * 10^6, which still fits in Int32.
  const prefixSum = new Int32Array(stoneCount + 1);
  for (let index = 0; index < stoneCount; index++) {
    prefixSum[index + 1] = prefixSum[index] + stoneValue[index];
  }

  // Both tables are flattened to one typed array each so that the inner
  // loop walks contiguous memory instead of chasing nested array objects.
  const bestKeepLeft = new Int32Array(stoneCount * stoneCount);
  const bestKeepRight = new Int32Array(stoneCount * stoneCount);

  // Holds dp[start][end] of the current range; the very last range solved is
  // the whole row, so after both loops this already carries the answer.
  let bestScore = 0;

  // Ranges are solved by decreasing start, which guarantees that every
  // shorter sub-range needed below has already been folded into the tables.
  for (let start = stoneCount - 1; start >= 0; start--) {
    const rowOffset = start * stoneCount;
    const startPrefix = prefixSum[start];
    const singleValue = prefixSum[start + 1] - startPrefix;

    // A one stone range scores nothing, so both tables only carry its value.
    bestKeepLeft[rowOffset + start] = singleValue;
    bestKeepRight[rowOffset + start] = singleValue;

    // The balance point never moves backwards while the end grows.
    let balanceIndex = start;

    for (let end = start + 1; end < stoneCount; end++) {
      const totalSum = prefixSum[end + 1] - startPrefix;

      // Advance until the left part reaches at least half of the range.
      while ((prefixSum[balanceIndex + 1] - startPrefix) * 2 < totalSum) {
        balanceIndex++;
      }

      const doubledLeftSum = (prefixSum[balanceIndex + 1] - startPrefix) * 2;

      if (doubledLeftSum === totalSum) {
        // Perfectly even split: Alice may keep either side at this point,
        // so the keep left block extends up to and including the balance.
        bestScore = bestKeepLeft[rowOffset + balanceIndex];
        const rightScore = bestKeepRight[(balanceIndex + 1) * stoneCount + end];
        if (rightScore > bestScore) {
          bestScore = rightScore;
        }
      } else {
        bestScore = 0;
        // Splits before the balance leave a strictly lighter left part.
        if (balanceIndex > start) {
          const leftScore = bestKeepLeft[rowOffset + balanceIndex - 1];
          if (leftScore > bestScore) {
            bestScore = leftScore;
          }
        }
        // Splits from the balance on leave a strictly lighter right part.
        if (balanceIndex < end) {
          const rightScore = bestKeepRight[(balanceIndex + 1) * stoneCount + end];
          if (rightScore > bestScore) {
            bestScore = rightScore;
          }
        }
      }

      // Fold the freshly solved range into both running maximum tables.
      const wholeRangeValue = bestScore + totalSum;
      const previousLeft = bestKeepLeft[rowOffset + end - 1];
      bestKeepLeft[rowOffset + end] = previousLeft > wholeRangeValue ? previousLeft : wholeRangeValue;
      const previousRight = bestKeepRight[(start + 1) * stoneCount + end];
      bestKeepRight[rowOffset + end] = previousRight > wholeRangeValue ? previousRight : wholeRangeValue;
    }
  }

  return bestScore;
}
