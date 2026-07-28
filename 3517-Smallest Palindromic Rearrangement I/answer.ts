const ALPHABET_SIZE = 26;
const LOWERCASE_A_CODE = 97;

// A single decoder instance avoids re-creating it on every call.
const latin1Decoder = new TextDecoder("latin1");

/**
 * Returns the lexicographically smallest palindromic permutation of a palindromic string.
 * @param s A palindromic string consisting of lowercase English letters.
 * @returns The smallest palindrome that can be built from the characters of `s`.
 */
function smallestPalindrome(s: string): string {
  const length = s.length;

  // A string of length 0 or 1 has exactly one possible arrangement.
  if (length < 2) {
    return s;
  }

  const halfLength = length >> 1;
  const halfCounts = new Int32Array(ALPHABET_SIZE);

  // The input is guaranteed palindromic, so scanning only the first half
  // already yields floor(count / 2) for every character.
  for (let index = 0; index < halfLength; index++) {
    halfCounts[s.charCodeAt(index) - LOWERCASE_A_CODE]++;
  }

  const output = new Uint8Array(length);

  // For odd lengths the centre character is forced: it is the only odd-count letter.
  if ((length & 1) === 1) {
    output[halfLength] = s.charCodeAt(halfLength);
  }

  let writeIndex = 0;

  // Emit letters in ascending order, mirroring each block to the tail in one pass.
  for (let letter = 0; letter < ALPHABET_SIZE; letter++) {
    const count = halfCounts[letter];

    if (count === 0) {
      continue;
    }

    const characterCode = letter + LOWERCASE_A_CODE;
    const nextIndex = writeIndex + count;

    // Native memset-style fills are far cheaper than per-character writes.
    output.fill(characterCode, writeIndex, nextIndex);
    output.fill(characterCode, length - nextIndex, length - writeIndex);

    writeIndex = nextIndex;
  }

  return latin1Decoder.decode(output);
}
