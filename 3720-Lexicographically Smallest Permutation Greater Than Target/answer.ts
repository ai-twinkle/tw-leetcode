function lexGreaterPermutation(s: string, target: string): string {
  const length = s.length;

  // Multiset of letters still available to place, indexed by letter - 'a'.
  const characterCounts = new Uint16Array(26);
  for (let index = 0; index < length; index++) {
    characterCounts[s.charCodeAt(index) - 97]++;
  }

  // One bit per still-available letter, enabling O(1) "any larger letter left?" tests.
  let availableMask = 0;
  for (let letter = 0; letter < 26; letter++) {
    if (characterCounts[letter] > 0) {
      availableMask |= 1 << letter;
    }
  }

  // Cache target letters as codes so the backward pass never touches the string again.
  const targetCodes = new Uint8Array(length);
  for (let index = 0; index < length; index++) {
    targetCodes[index] = target.charCodeAt(index) - 97;
  }

  // Greedily copy target as a prefix for as long as the multiset can supply it.
  let matchedLength = 0;
  while (matchedLength < length) {
    const letter = targetCodes[matchedLength];
    if (characterCounts[letter] === 0) {
      break;
    }
    characterCounts[letter]--;
    if (characterCounts[letter] === 0) {
      availableMask &= ~(1 << letter);
    }
    matchedLength++;
  }

  // A full match reproduces target exactly, which is not strictly greater,
  // so the pivot must move back one position and release that letter.
  let pivotIndex = matchedLength;
  if (pivotIndex === length) {
    pivotIndex = length - 1;
    const releasedLetter = targetCodes[pivotIndex];
    characterCounts[releasedLetter]++;
    availableMask |= 1 << releasedLetter;
  }

  // Walk the pivot leftwards; the first workable position is the rightmost one,
  // which yields the smallest possible result.
  for (; pivotIndex >= 0; pivotIndex--) {
    const targetLetter = targetCodes[pivotIndex];
    const greaterLettersMask = availableMask >>> (targetLetter + 1);

    if (greaterLettersMask !== 0) {
      // Isolate the lowest set bit to get the smallest letter above targetLetter.
      const lowestSetBit = greaterLettersMask & -greaterLettersMask;
      const chosenLetter = targetLetter + 1 + (31 - Math.clz32(lowestSetBit));
      characterCounts[chosenLetter]--;

      // Everything after the pivot is the leftover multiset in ascending order.
      let suffix = "";
      for (let letter = 0; letter < 26; letter++) {
        const remainingCount = characterCounts[letter];
        if (remainingCount > 0) {
          suffix += String.fromCharCode(letter + 97).repeat(remainingCount);
        }
      }

      return target.slice(0, pivotIndex) + String.fromCharCode(chosenLetter + 97) + suffix;
    }

    // No larger letter fits here, so give the previous target letter back and retry.
    if (pivotIndex > 0) {
      const releasedLetter = targetCodes[pivotIndex - 1];
      characterCounts[releasedLetter]++;
      availableMask |= 1 << releasedLetter;
    }
  }

  return "";
}
