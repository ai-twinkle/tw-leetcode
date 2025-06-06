function robotWithString(s: string): string {
  // 1. Length of the input string
  const stringLength = s.length;

  // 2. Count frequencies of each letter (0..25) in a Uint32Array.
  //    This loop does one pass: charCodeAt → minus 97 → increment freq.
  const letterFrequencies = new Uint32Array(26);
  for (let index = 0; index < stringLength; index++) {
    const code = s.charCodeAt(index) - 97;
    letterFrequencies[code]++;
  }

  // 3. Find the smallest letter‐code that still appears in s.
  let minRemainingCharCode = 0;
  while (
    minRemainingCharCode < 26 &&
    letterFrequencies[minRemainingCharCode] === 0
    ) {
    minRemainingCharCode++;
  }

  // 4. Use a Uint8Array as a stack of codes (max size = stringLength).
  const stackBuffer = new Uint8Array(stringLength);
  let stackPointer = -1; // –1 means “empty stack.”

  // 5. Preallocate output array of bytes (will store ASCII codes of 'a'..'z').
  const outputCharCodes = new Uint8Array(stringLength);
  let outputPointer = 0; // next free position in outputCharCodes

  // 6. Create a single TextDecoder for final conversion
  const textDecoder = new TextDecoder();

  // 7. Process each character of s in order (no extra inputCharCodes array)
  for (let index = 0; index < stringLength; index++) {
    // Compute code directly from 's'
    const currentCharCode = s.charCodeAt(index) - 97;

    // Decrement its remaining frequency
    const remainingCount = --letterFrequencies[currentCharCode];

    // If this was the last occurrence of the current smallest code,
    // advance minRemainingCharCode until we hit a code with count > 0 (or 26).
    if (
      currentCharCode === minRemainingCharCode &&
      remainingCount === 0
    ) {
      minRemainingCharCode++;
      while (
        minRemainingCharCode < 26 &&
        letterFrequencies[minRemainingCharCode] === 0
        ) {
        minRemainingCharCode++;
      }
    }

    // “Push” currentCharCode onto our stackBuffer
    stackBuffer[++stackPointer] = currentCharCode;

    // While the top of the stack can be written to paper in lexicographically
    // optimal order, pop it immediately and append to outputCharCodes.
    // (If minRemainingCharCode is 26, that means s is exhausted)
    while (
      stackPointer >= 0 &&
      (
        minRemainingCharCode === 26 ||
        stackBuffer[stackPointer] <= minRemainingCharCode
      )
      ) {
      const poppedCode = stackBuffer[stackPointer--];
      // store ASCII code (poppedCode + 97) into outputCharCodes
      outputCharCodes[outputPointer++] = poppedCode + 97;
    }
  }

  // 8. Finally, if anything remains in the stack, pop all and append.
  while (stackPointer >= 0) {
    const poppedCode = stackBuffer[stackPointer--];
    outputCharCodes[outputPointer++] = poppedCode + 97;
  }

  // 9. Convert the entire byte‐array (ASCII 'a'..'z') into a string at once.
  return textDecoder.decode(outputCharCodes);
}
