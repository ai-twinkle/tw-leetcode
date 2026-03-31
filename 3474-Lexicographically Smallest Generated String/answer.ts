function generateString(str1: string, str2: string): string {
  const n = str1.length;
  const m = str2.length;
  const totalLength = n + m - 1;

  const result = new Uint8Array(totalLength);

  // Fill with 'a' as the lexicographically smallest base
  result.fill(97);

  // Track positions locked by a T-constraint
  const lockedByT = new Uint8Array(totalLength);

  // Precompute str2 char codes for fast access
  const str2Codes = new Uint8Array(m);
  for (let j = 0; j < m; j++) {
    str2Codes[j] = str2.charCodeAt(j);
  }

  // Apply all T-constraints first: stamp str2 into each T-window
  for (let i = 0; i < n; i++) {
    if (str1[i] !== 'T') {
      continue;
    }

    for (let j = 0; j < m; j++) {
      const position = i + j;
      const requiredCode = str2Codes[j];

      if (lockedByT[position] && result[position] !== requiredCode) {
        // Two T-windows require different chars at this position
        return "";
      }

      result[position] = requiredCode;
      lockedByT[position] = 1;
    }
  }

  // Validate F-constraints: each F-window must differ from str2 at some position
  for (let i = 0; i < n; i++) {
    if (str1[i] !== 'F') {
      continue;
    }

    // Find the rightmost free (non-T-locked) position as the preferred flip point,
    // and also check whether the window already naturally differs somewhere
    let rightmostFreePosition = -1;
    let alreadyDiffers = false;

    for (let j = 0; j < m; j++) {
      const position = i + j;

      if (!lockedByT[position]) {
        rightmostFreePosition = j;
      }

      if (result[position] !== str2Codes[j]) {
        alreadyDiffers = true;
      }
    }

    if (alreadyDiffers) {
      continue;
    }

    // Window matches str2 entirely — must break it
    if (rightmostFreePosition === -1) {
      // All positions are T-locked and match str2 — unsolvable
      return "";
    }

    // Flip the rightmost free position to the smallest char that differs from str2
    const flipPosition = i + rightmostFreePosition;
    const conflictCode = str2Codes[rightmostFreePosition];

    // Pick 'a' if str2 char is not 'a', otherwise pick 'b'
    result[flipPosition] = conflictCode !== 97 ? 97 : 98;
  }

  return String.fromCharCode(...result);
}
