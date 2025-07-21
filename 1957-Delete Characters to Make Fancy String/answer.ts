function makeFancyString(s: string): string {
  let lastCharacter = '.';        // Last character added to result
  let secondLastCharacter = '.';  // Second last character added to result
  let resultString = '';

  for (let index = 0; index < s.length; index++) {
    const currentCharacter = s[index];
    // Only add if not three consecutive same characters
    if (currentCharacter === lastCharacter && currentCharacter === secondLastCharacter) {
      continue; // Skip this character
    }
    resultString += currentCharacter;
    secondLastCharacter = lastCharacter;
    lastCharacter = currentCharacter;
  }

  return resultString;
}
