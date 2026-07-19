function smallestSubsequence(s: string): string {
  const length = s.length;

  // Charcode offset for lowercase 'a' to index into fixed 26-size arrays.
  const charCodeOfA = 97;

  // lastIndex[c] stores the last position where character c appears.
  const lastIndex = new Int16Array(26).fill(-1);

  // inStack[c] marks whether character c is currently in the result stack.
  const inStack = new Uint8Array(26);

  // Pre-compute the last occurrence of every character in a single pass.
  for (let position = 0; position < length; position++) {
    lastIndex[s.charCodeAt(position) - charCodeOfA] = position;
  }

  // Typed stack of char indices (0-25); at most 26 distinct characters.
  const stack = new Uint8Array(26);
  let stackSize = 0;

  for (let position = 0; position < length; position++) {
    const currentChar = s.charCodeAt(position) - charCodeOfA;

    // Skip characters already placed in the result.
    if (inStack[currentChar] === 1) {
      continue;
    }

    // Pop larger characters that still appear later, keeping order smallest.
    while (stackSize > 0) {
      const topChar = stack[stackSize - 1];

      if (topChar <= currentChar || lastIndex[topChar] <= position) {
        break;
      }

      inStack[topChar] = 0;
      stackSize--;
    }

    stack[stackSize] = currentChar;
    stackSize++;
    inStack[currentChar] = 1;
  }

  // Build the final string from the accumulated char indices.
  let result = "";

  for (let index = 0; index < stackSize; index++) {
    result += String.fromCharCode(stack[index] + charCodeOfA);
  }

  return result;
}
