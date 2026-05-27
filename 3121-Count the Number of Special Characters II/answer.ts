function numberOfSpecialChars(word: string): number {
  // Bitmask of letters seen in lowercase form (bit i = letter 'a'+i)
  let lowerSeenMask = 0;
  // Bitmask of letters seen in uppercase form
  let upperSeenMask = 0;
  // Bitmask of letters disqualified because a lowercase appeared after the uppercase
  let invalidMask = 0;
  const wordLength = word.length;

  // Single linear pass building the three bitmasks
  for (let index = 0; index < wordLength; index++) {
    const charCode = word.charCodeAt(index);
    if (charCode >= 97) {
      // Lowercase branch: 'a' = 97
      const letterBit = 1 << (charCode - 97);
      // Branchless: if upper already seen for this letter, that bit flows into invalid
      invalidMask |= upperSeenMask & letterBit;
      lowerSeenMask |= letterBit;
    } else {
      // Uppercase branch: 'A' = 65
      upperSeenMask |= 1 << (charCode - 65);
    }
  }

  // Special letters are those seen in both cases and never disqualified
  let specialMask = lowerSeenMask & upperSeenMask & ~invalidMask;

  // Brian Kernighan's algorithm: each iteration clears the lowest set bit
  let specialCount = 0;
  while (specialMask !== 0) {
    specialMask &= specialMask - 1;
    specialCount++;
  }
  return specialCount;
}
