// Pre‑compute the first 30 terms once, at module load time.
const MAX_TERMS = 30;

/**
 * Helper: given a digit string, produce its run‑length encoding.
 * Uses an array buffer and a single join() to avoid repeated string
 * concatenation overhead.
 * @param {string} previousTerm - The term to encode.
 * @returns {string} The run‑length encoded string.
 */
function generateNextTerm(previousTerm: string): string {
  const termParts: string[] = [];
  let runCount = 1;
  const len = previousTerm.length;

  for (let i = 1; i < len; i++) {
    if (previousTerm[i] === previousTerm[i - 1]) {
      runCount++;
    } else {
      // push count then the digit we just finished running
      termParts.push(runCount.toString(), previousTerm[i - 1]);
      runCount = 1;
    }
  }
  // finish final run
  termParts.push(runCount.toString(), previousTerm[len - 1]);

  return termParts.join('');
}

/**
 * Cache array of count‑and‑say strings, indexed 0 → term 1.
 * We build it up to MAX_TERMS once; each call to countAndSay is then O(1).
 */
const countAndSayCache: string[] = (() => {
  const cache: string[] = ['1'];
  for (let termIndex = 2; termIndex <= MAX_TERMS; termIndex++) {
    const previous = cache[cache.length - 1];
    cache.push(generateNextTerm(previous));
  }
  return cache;
})();

/**
 * Main entry point. Returns the nth term in constant time.
 * @param {string} n - The term to return, 1-indexed.
 * @returns {string} The nth term in the count and say sequence.
 */
function countAndSay(n: number): string {
  if (n < 1 || n > MAX_TERMS) {
    throw new RangeError(`n must be between 1 and ${MAX_TERMS}, got ${n}`);
  }
  // array is zero‑indexed: term 1 → cache[0]
  return countAndSayCache[n - 1];
}
