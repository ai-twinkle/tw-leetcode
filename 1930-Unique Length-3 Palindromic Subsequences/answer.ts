const ALPHABET_SIZE = 26;

/**
 * Count the number of set bits (1s) in a 32-bit mask.
 *
 * Only the lower 26 bits are used in this problem.
 *
 * @param mask - 32-bit integer mask.
 * @returns Number of bits set to 1 in the mask.
 */
function countSetBitsInMask(mask: number): number {
  let bitCount = 0;

  // Kernighan's algorithm: repeatedly remove the lowest set bit
  while (mask !== 0) {
    mask &= mask - 1;
    bitCount++;
  }

  return bitCount;
}


/**
 * Count the number of unique palindromic subsequences of length three.
 *
 * A valid palindrome has the form x y x, where x and y are lowercase letters.
 *
 * @param s - Input string consisting of lowercase English letters.
 * @returns Number of unique palindromes of length three that are subsequences of s.
 */
function countPalindromicSubsequence(s: string): number {
  const length = s.length;

  // If the string is too short, there cannot be any length-3 palindromes
  if (length < 3) {
    return 0;
  }

  // Precompute each character's alphabet index and its total frequency
  const characterIndices = new Uint8Array(length);
  const rightCharacterCount = new Uint32Array(ALPHABET_SIZE);

  for (let positionIndex = 0; positionIndex < length; positionIndex++) {
    const characterIndex = s.charCodeAt(positionIndex) - 97; // 'a' has char code 97
    characterIndices[positionIndex] = characterIndex;
    rightCharacterCount[characterIndex]++;
  }

  // futureMask: bit c is 1 if character c still appears at or to the right of the current center
  let futureMask = 0;
  for (let alphabetIndex = 0; alphabetIndex < ALPHABET_SIZE; alphabetIndex++) {
    if (rightCharacterCount[alphabetIndex] > 0) {
      futureMask |= 1 << alphabetIndex;
    }
  }

  // visitedOuterMaskForCenter[c]: bit o is 1 if palindrome o c o has already been counted
  const visitedOuterMaskForCenter = new Uint32Array(ALPHABET_SIZE);

  // leftMask: bit c is 1 if character c has appeared strictly to the left of the current center
  let leftMask = 0;
  let uniquePalindromeCount = 0;

  // Treat each position as the middle character of x y x
  for (let positionIndex = 0; positionIndex < length; positionIndex++) {
    const centerCharacterIndex = characterIndices[positionIndex];
    const centerCharacterBitMask = 1 << centerCharacterIndex;

    // Remove this occurrence from the right side
    const updatedRightCount = rightCharacterCount[centerCharacterIndex] - 1;
    rightCharacterCount[centerCharacterIndex] = updatedRightCount;

    // If no more of this character on the right, clear its bit in futureMask
    if (updatedRightCount === 0) {
      futureMask &= ~centerCharacterBitMask;
    }

    // Outer letters must appear both left and right of the center
    const outerCandidateMask = leftMask & futureMask;

    if (outerCandidateMask !== 0) {
      const alreadyVisitedMask = visitedOuterMaskForCenter[centerCharacterIndex];
      const newOuterMask = outerCandidateMask & ~alreadyVisitedMask;

      // Only count outer letters we have not used with this center letter yet
      if (newOuterMask !== 0) {
        uniquePalindromeCount += countSetBitsInMask(newOuterMask);
        visitedOuterMaskForCenter[centerCharacterIndex] =
          alreadyVisitedMask | newOuterMask;
      }
    }

    // After processing this center, mark it as available on the left side
    leftMask |= centerCharacterBitMask;
  }

  return uniquePalindromeCount;
}
