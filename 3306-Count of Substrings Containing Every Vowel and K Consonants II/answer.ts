function countOfSubstrings(word: string, k: number): number {
  const n = word.length;

  // Build a prefix sum array where prefixConsonantCount[i] represents
  // the number of consonants in word[0...i-1].
  const prefixConsonantCount = new Int32Array(n + 1);

  // Create a fast lookup for vowels (using ASCII codes)
  const isVowel = new Uint8Array(128);
  isVowel['a'.charCodeAt(0)] = 1;
  isVowel['e'.charCodeAt(0)] = 1;
  isVowel['i'.charCodeAt(0)] = 1;
  isVowel['o'.charCodeAt(0)] = 1;
  isVowel['u'.charCodeAt(0)] = 1;

  for (let i = 0; i < n; i++) {
    const charCode = word.charCodeAt(i);
    // If vowel, add 0; otherwise, add 1 to count a consonant.
    prefixConsonantCount[i + 1] = prefixConsonantCount[i] + (isVowel[charCode] ? 0 : 1);
  }

  // Frequency array to count occurrences of prefix sums for valid starting indices.
  const prefixFrequency = new Uint32Array(n + 1);
  let validStartPointer = 0; // Pointer for valid starting indices
  let validSubstringCount = 0;

  // Track last occurrence of each vowel. Initialized to -1 (not seen).
  let lastA = -1, lastE = -1, lastI = -1, lastO = -1, lastU = -1;

  // Iterate over each possible ending index of a substring.
  for (let rightIndex = 0; rightIndex < n; rightIndex++) {
    const currentCharCode = word.charCodeAt(rightIndex);
    // Update last seen position for vowels.
    if (currentCharCode === 97) { // 'a'
      lastA = rightIndex;
    } else if (currentCharCode === 101) { // 'e'
      lastE = rightIndex;
    } else if (currentCharCode === 105) { // 'i'
      lastI = rightIndex;
    } else if (currentCharCode === 111) { // 'o'
      lastO = rightIndex;
    } else if (currentCharCode === 117) { // 'u'
      lastU = rightIndex;
    }

    // If not all vowels have been seen yet, skip this ending index.
    if (lastA === -1 || lastE === -1 || lastI === -1 || lastO === -1 || lastU === -1) {
      continue;
    }

    // The valid starting indices for substrings ending at rightIndex must be ≤
    // the smallest (earliest) last occurrence among the vowels.
    const minValidStartIndex = Math.min(lastA, lastE, lastI, lastO, lastU);

    // Activate all starting indices up to minValidStartIndex by updating their prefix sum counts.
    while (validStartPointer <= minValidStartIndex) {
      prefixFrequency[prefixConsonantCount[validStartPointer]]++;
      validStartPointer++;
    }

    // For a substring from L to rightIndex to have exactly k consonants:
    // prefixConsonantCount[rightIndex + 1] - prefixConsonantCount[L] === k,
    // which implies prefixConsonantCount[L] === prefixConsonantCount[rightIndex + 1] - k.
    const targetPrefixSum = prefixConsonantCount[rightIndex + 1] - k;
    if (targetPrefixSum >= 0 && targetPrefixSum <= n) {
      validSubstringCount += prefixFrequency[targetPrefixSum];
    }
  }

  return validSubstringCount;
}
