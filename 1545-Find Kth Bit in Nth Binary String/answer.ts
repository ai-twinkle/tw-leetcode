function findKthBit(n: number, k: number): string {
  let currentLevel = n;
  let currentPosition = k;
  let shouldInvert = false;

  // Iteratively reflect into the left half when in the right half,
  // toggling inversion each time, until reaching base S_1 or middle.
  while (currentLevel > 1) {
    const middleIndex = 1 << (currentLevel - 1);

    if (currentPosition === middleIndex) {
      return shouldInvert ? "0" : "1";
    }

    if (currentPosition > middleIndex) {
      currentPosition = (middleIndex << 1) - currentPosition;
      shouldInvert = !shouldInvert;
    }

    currentLevel--;
  }

  return shouldInvert ? "1" : "0";
}
