// Precompute once (outside the function) for O(1) return without string concatenation.
const PRECOMPUTED_TRIPLES = [
  "000","111","222","333","444","555","666","777","888","999"
] as const;

function largestGoodInteger(num: string): string {
  // Single pass, track current run of identical digits.
  let bestDigit = -1; // -1 means "not found yet"
  let previousCharCode = -1;
  let consecutiveCount = 0;

  for (let index = 0; index < num.length; index++) {
    const currentCharCode = num.charCodeAt(index); // '0'..'9' => 48..57

    if (currentCharCode === previousCharCode) {
      consecutiveCount++;
    } else {
      previousCharCode = currentCharCode;
      consecutiveCount = 1;
    }

    if (consecutiveCount >= 3) {
      const currentDigit = currentCharCode - 48; // '0' => 0, ..., '9' => 9
      if (currentDigit === 9) {
        // Early exit: nothing can beat "999".
        return PRECOMPUTED_TRIPLES[9];
      }
      if (currentDigit > bestDigit) {
        bestDigit = currentDigit;
      }
      // Keep counting; longer runs don't change the digit, so no extra work needed.
    }
  }

  return bestDigit >= 0 ? PRECOMPUTED_TRIPLES[bestDigit] : "";
}
