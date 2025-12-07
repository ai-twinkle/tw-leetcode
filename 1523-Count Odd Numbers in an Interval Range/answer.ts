function countOdds(low: number, high: number): number {
  // Count odds up to each bound and subtract to get odds in [low, high]
  return ((high + 1) >>> 1) - (low >>> 1);
}
