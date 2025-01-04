function countPalindromicSubsequence(s: string): number {
  const n = s.length;
  let result = 0;

  // Mark the appearance of the first and last index of each character
  const firstIndex = new Array(26).fill(-1);
  const lastIndex = new Array(26).fill(-1);

  for (let i = 0; i < n; i++) {
    // Convert the character to an index (ASCII)
    const charIndex = s.charCodeAt(i) - 'a'.charCodeAt(0);

    // Update the first only if first appearance
    if (firstIndex[charIndex] === -1) {
      firstIndex[charIndex] = i;
    }

    // Always update the last appearance
    lastIndex[charIndex] = i;
  }

  // Iterate through all characters
  for (let i = 0; i < 26; i++) {
    const start = firstIndex[i];
    const end = lastIndex[i];

    // If the character appears and there is at least one character between the first and last appearance
    if (start !== -1 && end !== -1 && end > start + 1) {
      const uniqueChars = new Set();

      // Count the unique characters between the first and last appearance
      for (let j = start + 1; j < end; j++) {
        uniqueChars.add(s[j]);
      }
      result += uniqueChars.size;
    }
  }

  return result;
}
