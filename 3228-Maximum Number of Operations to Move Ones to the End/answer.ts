function maxOperations(s: string): number {
  const length = s.length;

  let onesToLeft = 0;
  let maxOperationCount = 0;
  let index = 0;

  while (index < length) {
    const characterCode = s.charCodeAt(index);

    if (characterCode === 49) {
      // Current character is '1'
      onesToLeft += 1;
      index += 1;
    } else {
      // Current character is '0' → start of a zero-block
      if (onesToLeft === 0) {
        // Zero-block before any '1' cannot be crossed by any '1'
        // Skip the entire zero-block
        while (index < length && s.charCodeAt(index) === 48) {
          index += 1;
        }
      } else {
        // This zero-block has at least one '1' to its left
        // Every such '1' will cross this block exactly once
        maxOperationCount += onesToLeft;

        // Skip the entire zero-block
        while (index < length && s.charCodeAt(index) === 48) {
          index += 1;
        }
      }
    }
  }

  return maxOperationCount;
}
