function stoneGameIII(stoneValue: number[]): string {
  const stoneCount = stoneValue.length;

  // Rolling registers holding the optimal score difference of the suffixes
  // starting one, two and three stones ahead of the current position.
  // The last stone leaves no choice, so the player on turn simply takes it.
  let differenceAhead1 = stoneValue[stoneCount - 1];
  let differenceAhead2 = 0;
  let differenceAhead3 = 0;

  // Resolve the second-to-last position separately so the hot loop below never needs bounds checks.
  if (stoneCount >= 2) {
    const firstValue = stoneValue[stoneCount - 2];
    const takeOne = firstValue - differenceAhead1;
    const takeTwo = firstValue + stoneValue[stoneCount - 1];

    differenceAhead3 = differenceAhead2;
    differenceAhead2 = differenceAhead1;

    if (takeOne > takeTwo) {
      differenceAhead1 = takeOne;
    } else {
      differenceAhead1 = takeTwo;
    }
  }

  // Main sweep: every index here is guaranteed to have three stones available.
  for (let index = stoneCount - 3; index >= 0; index--) {
    // Incremental sums reuse the previous addition instead of recomputing a window sum.
    const oneStoneSum = stoneValue[index];
    const twoStoneSum = oneStoneSum + stoneValue[index + 1];
    const threeStoneSum = twoStoneSum + stoneValue[index + 2];

    let bestDifference = oneStoneSum - differenceAhead1;

    const takeTwoDifference = twoStoneSum - differenceAhead2;

    if (takeTwoDifference > bestDifference) {
      bestDifference = takeTwoDifference;
    }

    const takeThreeDifference = threeStoneSum - differenceAhead3;

    if (takeThreeDifference > bestDifference) {
      bestDifference = takeThreeDifference;
    }

    // Shift the window one position to the left for the next iteration.
    differenceAhead3 = differenceAhead2;
    differenceAhead2 = differenceAhead1;
    differenceAhead1 = bestDifference;
  }

  // A positive difference means Alice is ahead, a negative one means Bob is ahead.
  if (differenceAhead1 > 0) {
    return "Alice";
  }

  if (differenceAhead1 < 0) {
    return "Bob";
  }

  return "Tie";
}
