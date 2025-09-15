function canBeTypedWords(text: string, brokenLetters: string): number {
  // Case 1: No broken letters -> every word is valid
  if (brokenLetters.length === 0) {
    let spaceCount = 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 32) {
        // Found a space (ASCII 32)
        spaceCount++;
      }
    }
    return spaceCount + 1; // Total words = spaces + 1
  }

  // Build lookup table for broken letters
  const brokenMap = new Uint8Array(26);
  for (let i = 0; i < brokenLetters.length; i++) {
    const index = brokenLetters.charCodeAt(i) - 97; // Map 'a'...'z' to 0...25
    brokenMap[index] = 1;
  }

  let typableWords = 0;
  let currentWordIsValid = true;

  // Single pass: scan characters and mark words as valid/invalid
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    if (code === 32) {
      // End of a word
      if (currentWordIsValid) {
        typableWords++;
      }
      currentWordIsValid = true; // Reset for next word
    } else {
      if (currentWordIsValid) {
        const index = code - 97;
        if (brokenMap[index] === 1) {
          // This word contains a broken letter
          currentWordIsValid = false;
        }
      }
    }
  }

  // Handle last word (string ends without space)
  if (currentWordIsValid) {
    typableWords++;
  }

  return typableWords;
}
