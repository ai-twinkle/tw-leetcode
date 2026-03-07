function minFlips(s: string): number {
  const length = s.length;
  let mismatchCount = 0;

  // Count mismatches with pattern "010101..."
  for (let index = 0; index < length; index++) {
    const currentDigit = s.charCodeAt(index) & 1;
    mismatchCount += currentDigit ^ (index & 1);
  }

  // Minimum flips considering both alternating patterns
  let minimumFlipCount = mismatchCount;
  const oppositeMismatchCount = length - mismatchCount;

  if (oppositeMismatchCount < minimumFlipCount) {
    minimumFlipCount = oppositeMismatchCount;
  }

  // For even length, rotation does not change parity alignment
  if ((length & 1) === 0) {
    return minimumFlipCount;
  }

  const lastIndex = length - 1;

  for (let startIndex = 0; startIndex < lastIndex; startIndex++) {
    const movedDigit = s.charCodeAt(startIndex) & 1;

    // Update mismatch count after a left rotation (odd length case)
    mismatchCount = lastIndex - mismatchCount + (movedDigit << 1);

    const currentBestFlipCount =
      mismatchCount < (length - mismatchCount)
        ? mismatchCount
        : (length - mismatchCount);

    if (currentBestFlipCount < minimumFlipCount) {
      minimumFlipCount = currentBestFlipCount;
    }
  }

  return minimumFlipCount;
}
