function wordSubsets(words1: string[], words2: string[]): string[] {
  // Step 1: Consolidate the maximum frequency requirements from words2
  const charCount = new Array(26).fill(0);

  for (const word of words2) {
    const wordCount = new Array(26).fill(0);
    for (const char of word) {
      wordCount[char.charCodeAt(0) - 97]++;
    }

    // Update global frequency requirement to max of current word
    for (let i = 0; i < 26; i++) {
      charCount[i] = Math.max(charCount[i], wordCount[i]);
    }
  }

  // Step 2: Filter words1 based on the frequency requirement
  const result: string[] = [];

  for (const word of words1) {
    const wordCount = new Array(26).fill(0);
    for (const char of word) {
      wordCount[char.charCodeAt(0) - 97]++;
    }

    // Check if the word satisfies the global frequency requirement
    let isUniversal = true;
    for (let i = 0; i < 26; i++) {
      if (wordCount[i] < charCount[i]) {
        isUniversal = false;
        break;
      }
    }

    if (isUniversal) {
      result.push(word);
    }
  }

  return result;
}
