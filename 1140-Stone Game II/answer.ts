function stoneGameII(piles: number[]): number {
  const pileCount = piles.length;

  // With a single pile Alice sweeps everything on her first move.
  if (pileCount === 1) {
    return piles[0];
  }

  // Suffix sums turn every "stones remaining from index i" lookup into O(1).
  const suffixSum = new Int32Array(pileCount + 1);
  for (let index = pileCount - 1; index >= 0; index--) {
    suffixSum[index] = suffixSum[index + 1] + piles[index];
  }

  // Once 2 * M covers the whole remainder the state stops changing, so M is capped here.
  const maxMultiplier = (pileCount >> 1) + 1;
  const rowStride = maxMultiplier + 1;

  // bestGain[index * rowStride + multiplier] = best score of the player about to move.
  const bestGain = new Int32Array((pileCount + 1) * rowStride);

  for (let index = pileCount - 1; index >= 0; index--) {
    const remainingTotal = suffixSum[index];
    const rowOffset = index * rowStride;

    for (let multiplier = maxMultiplier; multiplier >= 1; multiplier--) {
      const reach = multiplier << 1;

      // The entire remainder fits into one legal move: take all of it.
      if (index + reach >= pileCount) {
        bestGain[rowOffset + multiplier] = remainingTotal;
        continue;
      }

      // The mover keeps the total minus whatever the opponent scores next, so minimize that.
      let opponentBest = 0x7fffffff;

      // Taking at most M piles leaves M unchanged, so the column index is fixed.
      for (let taken = 1; taken <= multiplier; taken++) {
        const opponentGain = bestGain[(index + taken) * rowStride + multiplier];
        if (opponentGain < opponentBest) {
          opponentBest = opponentGain;
        }
      }

      // Taking more than M raises M to X, clamped to the cap where all states coincide.
      for (let taken = multiplier + 1; taken <= reach; taken++) {
        const nextMultiplier = taken > maxMultiplier ? maxMultiplier : taken;
        const opponentGain = bestGain[(index + taken) * rowStride + nextMultiplier];
        if (opponentGain < opponentBest) {
          opponentBest = opponentGain;
        }
      }

      bestGain[rowOffset + multiplier] = remainingTotal - opponentBest;
    }
  }

  // Alice starts at index 0 with M = 1.
  return bestGain[1];
}
