const DISTINCT_SUBSEQ_MODULO: number = 1000000007;
const DISTINCT_SUBSEQ_CHAR_CODE_A: number = 97;

/**
 * Counts the distinct non-empty subsequences of a string, modulo 1e9 + 7.
 *
 * @param s - The input string, consisting only of lowercase English letters.
 * @returns The number of distinct non-empty subsequences, modulo 1e9 + 7.
 */
function distinctSubseqII(s: string): number {
  const length = s.length;

  // endingCount[c] holds the number of distinct subsequences ending in letter c.
  const endingCount = new Int32Array(26);
  let total = 0;

  for (let index = 0; index < length; index++) {
    const letterIndex = s.charCodeAt(index) - DISTINCT_SUBSEQ_CHAR_CODE_A;

    // Every existing subsequence extended by this letter, plus the letter alone.
    let newEndingCount = total + 1;

    if (newEndingCount >= DISTINCT_SUBSEQ_MODULO) {
      newEndingCount -= DISTINCT_SUBSEQ_MODULO;
    }

    // The new count supersedes the previous one, so the stale value is removed.
    let updatedTotal = total + newEndingCount - endingCount[letterIndex];

    // The intermediate stays within (-MODULO, 2 * MODULO), so one correction suffices.
    if (updatedTotal < 0) {
      updatedTotal += DISTINCT_SUBSEQ_MODULO;
    } else if (updatedTotal >= DISTINCT_SUBSEQ_MODULO) {
      updatedTotal -= DISTINCT_SUBSEQ_MODULO;
    }

    total = updatedTotal;
    endingCount[letterIndex] = newEndingCount;
  }

  return total;
}
