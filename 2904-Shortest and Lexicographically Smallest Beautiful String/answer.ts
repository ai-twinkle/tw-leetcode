function shortestBeautifulSubstring(s: string, k: number): string {
  const length = s.length;

  // Every valid window is delimited by a '1' on both ends, so only the '1' positions matter.
  // The constraint s.length <= 100 lets a Uint8Array hold every index without overflow.
  const onePositions = new Uint8Array(length);
  let oneCount = 0;
  for (let index = 0; index < length; index++) {
    if (s.charCodeAt(index) === 49) {
      onePositions[oneCount] = index;
      oneCount++;
    }
  }

  if (oneCount < k) {
    return '';
  }

  const lastWindowIndex = oneCount - k;
  const offsetToWindowEnd = k - 1;
  let bestLength = length + 1;
  let bestStart = 0;

  // Single pass: shrink the best length and resolve ties lexicographically at the same time.
  for (let windowIndex = 0; windowIndex <= lastWindowIndex; windowIndex++) {
    const start = onePositions[windowIndex];
    const windowLength = onePositions[windowIndex + offsetToWindowEnd] - start + 1;

    // A window must hold k ones, so length k is the mathematical lower bound and it can
    // only be the string "111...1"; no later window can beat it in length or in order.
    if (windowLength === k) {
      return '1'.repeat(k);
    }

    if (windowLength < bestLength) {
      bestLength = windowLength;
      bestStart = start;
      continue;
    }

    if (windowLength > bestLength) {
      continue;
    }

    // Equal length and both candidates begin with '1', so comparison starts at offset 1
    // and stops at the first differing character.
    for (let offset = 1; offset < bestLength; offset++) {
      const currentCode = s.charCodeAt(start + offset);
      const bestCode = s.charCodeAt(bestStart + offset);
      if (currentCode !== bestCode) {
        if (currentCode < bestCode) {
          bestStart = start;
        }
        break;
      }
    }
  }

  // Only one allocation of the result happens, at the very end.
  return s.slice(bestStart, bestStart + bestLength);
}
