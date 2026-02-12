function longestBalanced(s: string): number {
  const length = s.length;
  if (length <= 1) {
    return length;
  }

  // Precompute character codes (0..25) to avoid repeated charCodeAt overhead.
  const codes = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) {
    codes[index] = (s.charCodeAt(index) - 97) as number;
  }

  const counts = new Int16Array(26);
  let bestLength = 1;

  for (let left = 0; left < length; left += 1) {
    if (length - left <= bestLength) {
      break;
    }

    counts.fill(0);
    let distinctCount = 0;

    for (let right = left; right < length; right += 1) {
      const code = codes[right];
      const updatedCount = (counts[code] += 1);

      if (updatedCount === 1) {
        distinctCount += 1;
      }

      const windowLength = right - left + 1;
      if (windowLength <= bestLength) {
        continue;
      }

      // Important prune: balanced substring length must be divisible by the number of distinct characters.
      if (windowLength % distinctCount !== 0) {
        continue;
      }

      const targetFrequency = (windowLength / distinctCount) | 0;

      // Verify all non-zero counts equal targetFrequency.
      let isBalanced = true;
      for (let alphabetIndex = 0; alphabetIndex < 26; alphabetIndex += 1) {
        const value = counts[alphabetIndex];
        if (value !== 0 && value !== targetFrequency) {
          isBalanced = false;
          break;
        }
      }

      if (isBalanced) {
        bestLength = windowLength;
      }
    }
  }

  return bestLength;
}
