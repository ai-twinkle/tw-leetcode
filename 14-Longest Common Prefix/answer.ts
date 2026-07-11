function longestCommonPrefix(strs: string[]): string {
  const stringCount = strs.length;

  // A single string is its own longest common prefix.
  if (stringCount === 1) {
    return strs[0];
  }

  // The prefix can never be longer than the first string.
  const firstString = strs[0];
  const firstLength = firstString.length;

  if (firstLength === 0) {
    return "";
  }

  // Walk each character column of the first string against every other string.
  for (let charIndex = 0; charIndex < firstLength; charIndex++) {
    const currentCharCode = firstString.charCodeAt(charIndex);

    for (let stringIndex = 1; stringIndex < stringCount; stringIndex++) {
      const otherString = strs[stringIndex];

      // Mismatch or a string too short means the prefix ends here.
      if (charIndex >= otherString.length || otherString.charCodeAt(charIndex) !== currentCharCode) {
        return firstString.slice(0, charIndex);
      }
    }
  }

  // Every character of the first string matched across all strings.
  return firstString;
}
