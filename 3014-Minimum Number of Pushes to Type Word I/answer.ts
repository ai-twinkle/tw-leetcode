/**
 * Lookup table indexed by word length, built once at module load.
 * Index i holds the minimum pushes needed for a word of i distinct letters.
 * Letters are filled round by round across the 8 usable keys, so the letter at
 * zero-based position i always costs (i / 8 | 0) + 1 pushes.
 */
const MINIMUM_PUSHES_BY_LENGTH = ((): Uint8Array => {
  const table = new Uint8Array(27);
  let runningTotal = 0;

  for (let letterIndex = 0; letterIndex < 26; letterIndex++) {
    // Shift by 3 is an exact divide-by-8, giving the current round of keys.
    runningTotal += (letterIndex >> 3) + 1;
    table[letterIndex + 1] = runningTotal;
  }

  return table;
})();

/**
 * Computes the minimum number of key pushes required to type the word after
 * remapping keys 2 to 9.
 * @param word A string of distinct lowercase English letters.
 * @returns The minimum number of pushes needed.
 */
function minimumPushes(word: string): number {
  // Distinct letters guarantee the length equals the count of unique letters.
  return MINIMUM_PUSHES_BY_LENGTH[word.length];
}
