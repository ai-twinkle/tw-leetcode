function processStr(s: string, k: number): string {
  const operationCount = s.length;

  // Cache char codes in a typed array so the backward pass avoids string access.
  const operationCodes = new Uint8Array(operationCount);

  // prefixLengths[i] is the result length after the first i operations.
  // Float64Array represents integers up to 2^53 exactly, covering the 10^15 bound.
  const prefixLengths = new Float64Array(operationCount + 1);

  let currentLength = 0;

  // Forward pass: track only lengths, never the actual characters.
  for (let index = 0; index < operationCount; index++) {
    const characterCode = s.charCodeAt(index);
    operationCodes[index] = characterCode;

    // Letters dominate the input, so test the cheap range check first.
    if (characterCode >= 97) {
      // A lowercase letter appends one character.
      currentLength = currentLength + 1;
    } else if (characterCode === 35) {
      // '#' duplicates the result, doubling its length.
      currentLength = currentLength * 2;
    } else if (characterCode === 42) {
      // '*' removes the last character only when one exists.
      if (currentLength > 0) {
        currentLength = currentLength - 1;
      }
    }
    // '%' (code 37) reverses the result and leaves the length unchanged.

    prefixLengths[index + 1] = currentLength;
  }

  // Out-of-bounds queries (including an empty result) yield '.'.
  if (k >= currentLength) {
    return ".";
  }

  let targetIndex = k;

  // Backward pass: fold the target index through each operation to its source letter.
  for (let index = operationCount - 1; index >= 0; index--) {
    const characterCode = operationCodes[index];

    if (characterCode >= 97) {
      // A letter is the answer only when it sits at the current last position.
      const lengthAfter = prefixLengths[index + 1];
      if (targetIndex === lengthAfter - 1) {
        return String.fromCharCode(characterCode);
      }
    } else if (characterCode === 35) {
      // '#': the appended copy mirrors the first half, so fold into the original.
      const lengthBefore = prefixLengths[index];
      if (targetIndex >= lengthBefore) {
        targetIndex = targetIndex - lengthBefore;
      }
    } else if (characterCode === 37) {
      // '%': a reversed position maps to its mirror.
      const lengthAfter = prefixLengths[index + 1];
      targetIndex = lengthAfter - 1 - targetIndex;
    }
    // '*' (code 42): a removal never affects positions that still remain.
  }

  // Unreachable for valid in-bounds k, but kept so the function is total.
  return ".";
}
