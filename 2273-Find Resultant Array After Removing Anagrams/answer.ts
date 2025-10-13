const BASE_CHAR_CODE = 'a'.charCodeAt(0);
const FREQ_BUFFER = new Uint8Array(26);

/**
 * Compute a compact integer hash for a word based on character frequencies.
 * The hash ensures that anagrams produce identical hashes.
 *
 * @param {string} word - The input word consisting of lowercase English letters.
 * @returns {number} The computed hash value for the word.
 */
function computeWordHash(word: string): number {
  FREQ_BUFFER.fill(0);
  const length = word.length;

  for (let i = 0; i < length; i++) {
    FREQ_BUFFER[word.charCodeAt(i) - BASE_CHAR_CODE]++;
  }

  // Simple and fast polynomial rolling hash
  let hashValue = 0;
  for (let i = 0; i < 26; i++) {
    hashValue = (hashValue * 131 + FREQ_BUFFER[i]) >>> 0;
  }

  return hashValue;
}

/**
 * Removes consecutive anagram words from the given list.
 *
 * The function ensures that for any consecutive words that are anagrams,
 * only the first occurrence remains.
 *
 * @param {string[]} words - The array of input words.
 * @returns {string[]} The resulting array after removing consecutive anagrams.
 */
function removeAnagrams(words: string[]): string[] {
  const resultWords: string[] = [];
  const precomputedHashes = new Uint32Array(words.length);

  // Precompute all word hashes to avoid recomputation
  for (let i = 0; i < words.length; i++) {
    precomputedHashes[i] = computeWordHash(words[i]);
  }

  let lastHash = -1;
  for (let i = 0; i < words.length; i++) {
    const currentHash = precomputedHashes[i];

    // Skip if the current word is an anagram of the previous one
    if (currentHash === lastHash) {
      continue;
    }

    lastHash = currentHash;
    resultWords.push(words[i]);
  }

  return resultWords;
}
