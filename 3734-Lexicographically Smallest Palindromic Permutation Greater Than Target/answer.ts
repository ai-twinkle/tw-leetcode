const ALPHABET_SIZE = 26;
const CHAR_CODE_A = 97;
const DECODE_CHUNK_SIZE = 4096;

/**
 * Converts a buffer of character codes into a string.
 * @param characterCodes - Buffer holding one character code per position.
 * @returns The decoded string.
 */
function decodeCharacterCodes(characterCodes: Uint8Array): string {
  let decoded = "";

  // Chunked to stay clear of the argument-count limit of Function.prototype.apply.
  for (let start = 0; start < characterCodes.length; start += DECODE_CHUNK_SIZE) {
    const chunk = characterCodes.subarray(start, start + DECODE_CHUNK_SIZE);
    decoded += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  return decoded;
}

/**
 * Returns the lexicographically smallest palindromic permutation of `s`
 * that is strictly greater than `target`.
 * @param s - Source string whose letters must be rearranged.
 * @param target - String that the produced palindrome must strictly exceed.
 * @returns The smallest qualifying palindrome, or an empty string when none exists.
 */
function lexPalindromicPermutation(s: string, target: string): string {
  const length = s.length;
  const totalCounts = new Int32Array(ALPHABET_SIZE);

  for (let index = 0; index < length; index++) {
    totalCounts[s.charCodeAt(index) - CHAR_CODE_A]++;
  }

  // A palindrome tolerates at most one letter with an odd occurrence count.
  const remainingCounts = new Int32Array(ALPHABET_SIZE);
  let middleCharCode = -1;

  for (let letter = 0; letter < ALPHABET_SIZE; letter++) {
    const count = totalCounts[letter];

    if ((count & 1) === 1) {
      if (middleCharCode !== -1) {
        return "";
      }
      middleCharCode = letter + CHAR_CODE_A;
    }

    remainingCounts[letter] = count >> 1;
  }

  const halfLength = length >> 1;
  const targetCodes = new Uint8Array(length);

  for (let index = 0; index < length; index++) {
    targetCodes[index] = target.charCodeAt(index);
  }

  const resultCodes = new Uint8Array(length);

  // Longest prefix of `target` inside the first half that the multiset can actually supply.
  let prefixLength = 0;

  while (prefixLength < halfLength) {
    const letter = targetCodes[prefixLength] - CHAR_CODE_A;

    if (remainingCounts[letter] === 0) {
      break;
    }

    remainingCounts[letter]--;
    prefixLength++;
  }

  // Best possible case: the whole first half matches `target`, so only the mirrored tail decides.
  if (prefixLength === halfLength) {
    for (let index = 0; index < halfLength; index++) {
      const code = targetCodes[index];
      resultCodes[index] = code;
      resultCodes[length - 1 - index] = code;
    }

    if (middleCharCode !== -1) {
      resultCodes[halfLength] = middleCharCode;
    }

    // The first half is identical, so comparison starts at the middle position.
    let isGreater = false;

    for (let index = halfLength; index < length; index++) {
      if (resultCodes[index] !== targetCodes[index]) {
        isGreater = resultCodes[index] > targetCodes[index];
        break;
      }
    }

    if (isGreater) {
      return decodeCharacterCodes(resultCodes);
    }
  }

  // Break position candidates, scanned from the longest shared prefix downwards.
  let position = prefixLength < halfLength ? prefixLength : halfLength - 1;

  if (prefixLength === halfLength && halfLength > 0) {
    // Give back the letter consumed at the last half position before reusing it as a break point.
    remainingCounts[targetCodes[halfLength - 1] - CHAR_CODE_A]++;
  }

  while (position >= 0) {
    const targetLetter = targetCodes[position] - CHAR_CODE_A;
    let chosenLetter = -1;

    // Smallest still-available letter strictly greater than the target letter.
    for (let letter = targetLetter + 1; letter < ALPHABET_SIZE; letter++) {
      if (remainingCounts[letter] > 0) {
        chosenLetter = letter;
        break;
      }
    }

    if (chosenLetter !== -1) {
      remainingCounts[chosenLetter]--;

      for (let index = 0; index < position; index++) {
        const code = targetCodes[index];
        resultCodes[index] = code;
        resultCodes[length - 1 - index] = code;
      }

      const chosenCode = chosenLetter + CHAR_CODE_A;
      resultCodes[position] = chosenCode;
      resultCodes[length - 1 - position] = chosenCode;

      if (middleCharCode !== -1) {
        resultCodes[halfLength] = middleCharCode;
      }

      // Anything left may be arranged freely, so ascending order minimises the result.
      let writeIndex = position + 1;

      for (let letter = 0; letter < ALPHABET_SIZE; letter++) {
        const code = letter + CHAR_CODE_A;
        let count = remainingCounts[letter];

        while (count > 0) {
          resultCodes[writeIndex] = code;
          resultCodes[length - 1 - writeIndex] = code;
          writeIndex++;
          count--;
        }
      }

      return decodeCharacterCodes(resultCodes);
    }

    // Shift the break point left and restore the letter that position used to consume.
    if (position > 0) {
      remainingCounts[targetCodes[position - 1] - CHAR_CODE_A]++;
    }

    position--;
  }

  return "";
}
