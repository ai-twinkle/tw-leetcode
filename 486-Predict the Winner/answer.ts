function predictTheWinner(nums: number[]): boolean {
  const length = nums.length;

  // Even length is an unconditional win: player 1 can pre-commit to taking every
  // even index or every odd index, and picks whichever group has the larger sum.
  if ((length & 1) === 0) {
    return true;
  }

  // A single element leaves player 2 with nothing to take.
  if (length === 1) {
    return true;
  }

  // bestDifference[right] is the best achievable (current player - opponent) gap
  // for the window that currently ends at index "right"; it is rolled in place.
  const bestDifference = new Int32Array(length);
  bestDifference[length - 1] = nums[length - 1];

  for (let left = length - 2; left >= 0; left--) {
    const valueAtLeft = nums[left];

    // Base case of the window [left, left]: the only number goes to the mover.
    bestDifference[left] = valueAtLeft;

    for (let right = left + 1; right < length; right++) {
      // Stale entry still describes [left + 1, right]; the previous slot was
      // already refreshed this pass and describes [left, right - 1].
      const gapAfterTakingLeft = valueAtLeft - bestDifference[right];
      const gapAfterTakingRight = nums[right] - bestDifference[right - 1];
      bestDifference[right] = gapAfterTakingLeft > gapAfterTakingRight
        ? gapAfterTakingLeft
        : gapAfterTakingRight;
    }
  }

  return bestDifference[length - 1] >= 0;
}
