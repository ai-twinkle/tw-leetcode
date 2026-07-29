const ALPHABET_SIZE = 26;
const LOWERCASE_A_CODE = 97;

/** Shared decoder so the ASCII byte buffer becomes a string in one pass. */
const asciiDecoder = new TextDecoder();

/**
 * Returns the k-th lexicographically smallest palindromic permutation of s.
 * @param s - A palindromic string made of lowercase English letters.
 * @param k - The 1-based rank of the wanted palindrome.
 * @returns The k-th smallest palindrome, or an empty string when fewer than k exist.
 */
function smallestPalindrome(s: string, k: number): string {
  const length = s.length;
  const halfLength = length >> 1;

  const letterCounts = new Int32Array(ALPHABET_SIZE);
  for (let index = 0; index < halfLength; index++) {
    letterCounts[s.charCodeAt(index) - LOWERCASE_A_CODE] += 1;
  }

  // Grow a suffix of the sorted half until its permutation count reaches k.
  let suffixLength = 0;
  let suffixWays = 1;
  let cutLetter = ALPHABET_SIZE;
  let cutTaken = 0;
  let hasEnough = k <= 1;

  for (let letter = ALPHABET_SIZE - 1; letter >= 0 && !hasEnough; letter--) {
    const available = letterCounts[letter];
    for (let taken = 1; taken <= available; taken++) {
      suffixLength += 1;
      // Multinomial gains one slot and loses the duplicate factor of the repeated letter.
      suffixWays = (suffixWays * suffixLength) / taken;
      if (suffixWays >= k) {
        cutLetter = letter;
        cutTaken = taken;
        hasEnough = true;
        break;
      }
    }
  }

  if (!hasEnough) {
    return "";
  }

  const output = new Uint8Array(length);
  let writeIndex = 0;

  // Every character before the free suffix is forced to the sorted choice.
  for (let letter = 0; letter < cutLetter; letter++) {
    const repeat = letterCounts[letter];
    for (let copy = 0; copy < repeat; copy++) {
      output[writeIndex] = LOWERCASE_A_CODE + letter;
      writeIndex += 1;
    }
  }

  const freeCounts = new Int32Array(ALPHABET_SIZE);
  if (cutLetter < ALPHABET_SIZE) {
    // The cut letter is split: part of it is forced, the rest joins the free suffix.
    const forcedCopies = letterCounts[cutLetter] - cutTaken;
    for (let copy = 0; copy < forcedCopies; copy++) {
      output[writeIndex] = LOWERCASE_A_CODE + cutLetter;
      writeIndex += 1;
    }

    freeCounts[cutLetter] = cutTaken;
    for (let letter = cutLetter + 1; letter < ALPHABET_SIZE; letter++) {
      freeCounts[letter] = letterCounts[letter];
    }
  }

  let remainingSlots = suffixLength;
  let remainingWays = suffixWays;
  let rank = k;
  let lowestLetter = cutLetter;

  // Rank 1 means the leftover is simply the sorted remainder, so the walk can stop there.
  while (rank > 1 && remainingSlots > 0) {
    for (let letter = lowestLetter; letter < ALPHABET_SIZE; letter++) {
      const available = freeCounts[letter];
      if (available === 0) {
        continue;
      }

      // Permutations of the block that starts with this letter, in exact integer math.
      const waysWithLetter = (remainingWays * available) / remainingSlots;
      if (rank <= waysWithLetter) {
        output[writeIndex] = LOWERCASE_A_CODE + letter;
        writeIndex += 1;
        freeCounts[letter] = available - 1;
        remainingWays = waysWithLetter;
        remainingSlots -= 1;
        break;
      }

      rank -= waysWithLetter;
    }

    while (lowestLetter < ALPHABET_SIZE && freeCounts[lowestLetter] === 0) {
      lowestLetter += 1;
    }
  }

  for (let letter = lowestLetter; letter < ALPHABET_SIZE; letter++) {
    const repeat = freeCounts[letter];
    for (let copy = 0; copy < repeat; copy++) {
      output[writeIndex] = LOWERCASE_A_CODE + letter;
      writeIndex += 1;
    }
  }

  // s is palindromic, so mirroring the half and keeping the original centre is enough.
  for (let index = 0; index < halfLength; index++) {
    output[length - 1 - index] = output[index];
  }

  if ((length & 1) === 1) {
    output[halfLength] = s.charCodeAt(halfLength);
  }

  return asciiDecoder.decode(output);
}
