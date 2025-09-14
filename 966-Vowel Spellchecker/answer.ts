// Bitmask over 'a'..'z' (0-based indices) for vowels: a,e,i,o,u => bits 0,4,8,14,20
const VOWEL_BITMASK_A_TO_Z =
  (1 << 0) | (1 << 4) | (1 << 8) | (1 << 14) | (1 << 20);

/**
 * Convert a word into its "devoweled" form:
 * - Lowercase all characters
 * - Replace vowels with '*'
 *
 * Runs in a single tight pass for efficiency.
 *
 * @param {string} word - The input word to normalize.
 * @returns {string} The devoweled form of the word.
 */
function devowelWord(word: string): string {
  const length = word.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    let code = word.charCodeAt(i);

    // Fast lowercase conversion for ASCII letters A–Z
    if (code >= 65 && code <= 90) {
      code |= 32;
    }

    const alphaIndex = code - 97; // 'a' => 0
    if (alphaIndex >= 0 && alphaIndex < 26) {
      if (((VOWEL_BITMASK_A_TO_Z >>> alphaIndex) & 1) === 1) {
        result += "*";
      } else {
        result += String.fromCharCode(code);
      }
    } else {
      result += String.fromCharCode(code);
    }
  }

  return result;
}

/**
 * Spellchecker with precedence rules:
 * 1. Exact match (case-sensitive)
 * 2. Case-insensitive match (first occurrence in wordlist)
 * 3. Devoweled match (first occurrence in wordlist)
 * 4. Otherwise ""
 *
 * Uses precomputed hash maps for O(1) query resolution.
 *
 * @param {string[]} wordlist - List of valid words.
 * @param {string[]} queries - Words to spellcheck.
 * @returns {string[]} Corrected words for each query.
 */
function spellchecker(wordlist: string[], queries: string[]): string[] {
  // Exact-match (case-sensitive) set
  const caseSensitiveDictionary: Set<string> = new Set(wordlist);

  // Hash maps for first-seen case-insensitive and devoweled matches
  const caseInsensitiveDictionary: Record<string, string> = Object.create(null);
  const devoweledDictionary: Record<string, string> = Object.create(null);

  // Precompute dictionaries
  for (let i = 0; i < wordlist.length; i++) {
    const word = wordlist[i];
    const lowerCaseWord = word.toLowerCase();

    if (caseInsensitiveDictionary[lowerCaseWord] === undefined) {
      caseInsensitiveDictionary[lowerCaseWord] = word;
    }

    const devoweledWord = devowelWord(lowerCaseWord);
    if (devoweledDictionary[devoweledWord] === undefined) {
      devoweledDictionary[devoweledWord] = word;
    }
  }

  // Preallocate result array
  const output = new Array<string>(queries.length);

  // Process each query
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];

    // 1. Exact case-sensitive match
    if (caseSensitiveDictionary.has(query)) {
      output[i] = query;
    } else {
      // 2. Case-insensitive match
      const lowerCaseQuery = query.toLowerCase();
      const caseInsensitiveHit = caseInsensitiveDictionary[lowerCaseQuery];

      if (caseInsensitiveHit !== undefined) {
        output[i] = caseInsensitiveHit;
      } else {
        // 3. Devoweled match
        const devoweledQuery = devowelWord(lowerCaseQuery);
        const devoweledHit = devoweledDictionary[devoweledQuery];

        if (devoweledHit !== undefined) {
          output[i] = devoweledHit;
        } else {
          // 4. No match
          output[i] = "";
        }
      }
    }
  }

  return output;
}
