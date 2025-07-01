function possibleStringCount(word: string): number {
  const characterCount = word.length;
  let transitionCount = 0;

  // Count the number of times adjacent characters are different (i.e., count boundaries between character runs)
  for (let currentIndex = 1; currentIndex < characterCount; currentIndex++) {
    // Compare character codes directly for performance
    if (word.charCodeAt(currentIndex) !== word.charCodeAt(currentIndex - 1)) {
      transitionCount++;
    }
  }

  // The result equals the number of character runs: word length minus the number of transitions
  return characterCount - transitionCount;
}
