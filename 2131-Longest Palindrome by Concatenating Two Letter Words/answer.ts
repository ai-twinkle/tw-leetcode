function longestPalindrome(words: string[]): number {
  const characterCodeOffset = 97; // 'a' character Ascii code is 97
  const alphabetSize = 26;

  // Flattened 26×26 frequency table in a single Uint32Array
  const flatFrequencyMatrix = new Uint32Array(alphabetSize * alphabetSize);

  // 1. Build frequency table in O(n)
  const totalWords = words.length;
  for (let wordIndex = 0; wordIndex < totalWords; wordIndex++) {
    const word = words[wordIndex];
    const firstLetterIndex = word.charCodeAt(0) - characterCodeOffset;
    const secondLetterIndex = word.charCodeAt(1) - characterCodeOffset;
    flatFrequencyMatrix[firstLetterIndex * alphabetSize + secondLetterIndex]++;
  }

  let totalPalindromeLength = 0;
  let foundCenterPiece = false;

  // 2. Handle same-letter words ("aa", "bb", ...)
  for (let letterIndex = 0; letterIndex < alphabetSize; letterIndex++) {
    const idx = letterIndex * alphabetSize + letterIndex;
    const count = flatFrequencyMatrix[idx];
    // use all full pairs
    const pairCount = count >>> 1;  // Fast floor(count / 2)
    totalPalindromeLength += pairCount * 4; // Each pair adds 4 chars

    // if there's an odd one out, we can use one as the center
    if ((count & 1) === 1) {
      foundCenterPiece = true;
    }
  }

  // 3. Handle cross-pairs ("ab" with "ba")
  for (let first = 0; first < alphabetSize; first++) {
    const baseOffset = first * alphabetSize;
    for (let second = first + 1; second < alphabetSize; second++) {
      const forwardCount  = flatFrequencyMatrix[baseOffset + second];
      const backwardCount = flatFrequencyMatrix[second * alphabetSize + first];

      // Unconditionally add matched * 4 (zero matches → zero cost; no branch)
      totalPalindromeLength += (forwardCount < backwardCount ? forwardCount : backwardCount) * 4;
    }
  }

  // 4. Place one center piece if available
  return totalPalindromeLength + (foundCenterPiece ? 2 : 0);
}
