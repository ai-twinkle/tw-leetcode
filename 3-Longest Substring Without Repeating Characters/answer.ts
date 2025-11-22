function lengthOfLongestSubstring(s: string): number {
  const stringLength = s.length;

  if (stringLength === 0) {
    return 0;
  }

  // Printable ASCII (letters, digits, symbols, space) is at most around 95 distinct characters.
  const maximumDistinctCharacters = 95;

  // By pigeonhole principle, the answer cannot be larger than the number
  // of distinct possible characters or the string length itself.
  const maximumPossibleAnswer =
    stringLength < maximumDistinctCharacters
      ? stringLength
      : maximumDistinctCharacters;

  // Frequency table for ASCII codes 0..127
  const characterFrequency = new Uint8Array(128);

  let leftIndex = 0;
  let longestWindowLength = 0;

  for (let rightIndex = 0; rightIndex < stringLength; rightIndex++) {
    const currentCharacterCode = s.charCodeAt(rightIndex);

    // Add current character to the window
    characterFrequency[currentCharacterCode] =
      characterFrequency[currentCharacterCode] + 1;

    // Shrink window from the left until this character becomes unique
    while (characterFrequency[currentCharacterCode] > 1) {
      const leftCharacterCode = s.charCodeAt(leftIndex);
      characterFrequency[leftCharacterCode] =
        characterFrequency[leftCharacterCode] - 1;
      leftIndex = leftIndex + 1;
    }

    const currentWindowLength = rightIndex - leftIndex + 1;

    if (currentWindowLength > longestWindowLength) {
      longestWindowLength = currentWindowLength;

      // Pigeonhole early exit: cannot exceed maximumPossibleAnswer
      if (longestWindowLength === maximumPossibleAnswer) {
        return longestWindowLength;
      }
    }
  }

  return longestWindowLength;
}
