function numEquivDominoPairs(dominoes: number[][]): number {
  // Since each side is 1–9, the combined key (min*10 + max) ranges from 11 to 99.
  const countByKey = new Uint16Array(100);
  let totalEquivalentPairs = 0;

  const length = dominoes.length;
  for (let i = 0; i < length; i++) {
    const firstValue = dominoes[i][0];
    const secondValue = dominoes[i][1];

    // Determine ordered pair (minValue, maxValue)
    const minValue = firstValue < secondValue ? firstValue : secondValue;
    const maxValue = firstValue < secondValue ? secondValue : firstValue;

    // Integer key in [11..99]
    const key = minValue * 10 + maxValue;

    // Every time we see this key, all previous occurrences form new equivalent pairs
    totalEquivalentPairs += countByKey[key];

    // Record this occurrence for future pairs
    countByKey[key]++;
  }

  return totalEquivalentPairs;
}
