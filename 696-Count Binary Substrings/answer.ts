function countBinarySubstrings(s: string): number {
  const length = s.length;
  if (length <= 1) {
    return 0;
  }

  // Cache the previous character to avoid repeated indexed reads (can be costly in JS engines).
  let previousCharacter = s.charCodeAt(0);

  // Length of the current run and previous run.
  let currentRunLength = 1;
  let previousRunLength = 0;

  let totalSubstrings = 0;

  for (let index = 1; index < length; index++) {
    const currentCharacter = s.charCodeAt(index);

    if (currentCharacter === previousCharacter) {
      currentRunLength++;
    } else {
      // When the run changes, add all pairs formed between the previous and current run.
      totalSubstrings += currentRunLength < previousRunLength ? currentRunLength : previousRunLength;

      previousRunLength = currentRunLength;
      currentRunLength = 1;
      previousCharacter = currentCharacter;
    }
  }

  // Final boundary contribution.
  totalSubstrings += currentRunLength < previousRunLength ? currentRunLength : previousRunLength;

  return totalSubstrings;
}
