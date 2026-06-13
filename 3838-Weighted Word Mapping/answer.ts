function mapWordWeights(words: string[], weights: number[]): string {
  const wordCount = words.length;

  // Character code of 'z'; reverse-alphabet mapping starts here (0 -> 'z').
  const zCharCode = 122;

  // Character code of 'a'; used to index into the weights array.
  const aCharCode = 97;

  // Collect mapped character codes in a compact typed array for a single final decode.
  const resultCodes = new Uint8Array(wordCount);

  for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {
    const word = words[wordIndex];
    const wordLength = word.length;
    let weightSum = 0;

    // Accumulate the total weight of every character in the current word.
    for (let charIndex = 0; charIndex < wordLength; charIndex++) {
      weightSum += weights[word.charCodeAt(charIndex) - aCharCode];
    }

    // Reverse-alphabet mapping: 0 -> 'z', 1 -> 'y', ..., 25 -> 'a'.
    resultCodes[wordIndex] = zCharCode - (weightSum % 26);
  }

  // Build the final string in a single pass from the collected character codes.
  return String.fromCharCode.apply(null, resultCodes as unknown as number[]);
}
