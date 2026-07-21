function maxActiveSectionsAfterTrade(s: string): number {
  const length = s.length;
  const CHAR_ONE = 49; // ASCII code for '1'

  let totalNumberOfOnes = 0;
  let previousZeroRunLength = 0;
  let maxMergeableZeros = 0;

  let index = 0;
  while (index < length) {
    // Count a contiguous run of '1's, tracking whether it is non-empty.
    let onesRunLength = 0;
    while (index < length && s.charCodeAt(index) === CHAR_ONE) {
      ++index;
      ++onesRunLength;
    }
    totalNumberOfOnes += onesRunLength;

    // Count the following contiguous run of '0's.
    let currentZeroRunLength = 0;
    while (index < length && s.charCodeAt(index) !== CHAR_ONE) {
      ++index;
      ++currentZeroRunLength;
    }

    // A valid trade needs zeros on both sides of a non-empty ones block.
    if (previousZeroRunLength > 0 && onesRunLength > 0 && currentZeroRunLength > 0) {
      const combinedZeros = previousZeroRunLength + currentZeroRunLength;
      if (combinedZeros > maxMergeableZeros) {
        maxMergeableZeros = combinedZeros;
      }
    }

    previousZeroRunLength = currentZeroRunLength;
  }

  return totalNumberOfOnes + maxMergeableZeros;
}
