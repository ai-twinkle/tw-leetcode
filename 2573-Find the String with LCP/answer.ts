function findTheString(lcp: number[][]): string {
  const length = lcp.length;

  // Greedy assignment: give each position the smallest possible character
  const charCodes = new Int32Array(length).fill(-1);
  let nextCharCode = 0;

  for (let position = 0; position < length; position++) {
    if (charCodes[position] !== -1) {
      continue;
    }

    // No more letters available in the alphabet
    if (nextCharCode >= 26) {
      return "";
    }

    charCodes[position] = nextCharCode;

    // All positions that share a prefix with this position must have the same character
    for (let other = position + 1; other < length; other++) {
      if (lcp[position][other] > 0) {
        if (charCodes[other] === -1) {
          charCodes[other] = nextCharCode;
        } else if (charCodes[other] !== nextCharCode) {
          // Conflict: two positions must share a char but are already different
          return "";
        }
      }
    }

    nextCharCode++;
  }

  // Bottom-up DP to compute the expected LCP matrix from the assigned characters
  // dp[i * length + j] = longest common prefix starting at i and j
  // Computed right-to-left so dp[i][j] can use dp[i+1][j+1]
  const computedLcp = new Int32Array(length * length);

  for (let row = length - 1; row >= 0; row--) {
    for (let col = length - 1; col >= 0; col--) {
      if (charCodes[row] === charCodes[col]) {
        // Characters match: extend the LCP from the next positions
        const nextLcp = (row + 1 < length && col + 1 < length)
          ? computedLcp[(row + 1) * length + (col + 1)]
          : 0;
        computedLcp[row * length + col] = nextLcp + 1;
      }
      // If characters differ, computedLcp stays 0 (default from fill)
    }
  }

  // Validate: every cell in the given LCP must match our computed LCP
  for (let row = 0; row < length; row++) {
    const lcpRow = lcp[row];
    const baseIndex = row * length;
    for (let col = 0; col < length; col++) {
      if (lcpRow[col] !== computedLcp[baseIndex + col]) {
        return "";
      }
    }
  }

  // Build result string from assigned character codes
  const resultChars = new Uint8Array(length);
  const aCharCode = 97; // ASCII code for 'a'
  for (let index = 0; index < length; index++) {
    resultChars[index] = aCharCode + charCodes[index];
  }

  return String.fromCharCode(...resultChars);
}
