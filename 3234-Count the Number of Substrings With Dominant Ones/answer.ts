function numberOfSubstrings(s: string): number {
  const stringLength = s.length;
  const characterCodeZero = 48; // '0'.charCodeAt(0)
  const prefixPreviousIndex = new Int32Array(stringLength + 1);

  // Sentinel for position before the string
  prefixPreviousIndex[0] = -1;

  // Build the "pre" array as in the base solution, but optimized.
  // prefixPreviousIndex[i + 1] = index of the last "split" position
  // (either 0 or the latest index where s[index - 1] === '0') before or at i.
  let previousIndex = 0;

  for (let index = 0; index < stringLength; index++) {
    if (index > 0) {
      // If previous character is '0', update split position
      if (s.charCodeAt(index - 1) === characterCodeZero) {
        previousIndex = index;
      }
    }

    prefixPreviousIndex[index + 1] = previousIndex;
  }

  // Zero count is limited by sqrt(n), so precompute this bound once
  const maxZeroCount = Math.floor(Math.sqrt(stringLength));
  let result = 0;

  // Iterate over right endpoints (1-based in terms of original logic)
  for (let rightIndex = 1; rightIndex <= stringLength; rightIndex++) {
    // Initial zero count for substrings ending at rightIndex - 1
    const isCurrentZero = s.charCodeAt(rightIndex - 1) === characterCodeZero;
    let zeroCount = isCurrentZero ? 1 : 0;

    // Start from this right boundary and jump backwards using prefixPreviousIndex
    let currentPosition = rightIndex;

    // We only need to consider up to maxZeroCount zeros
    while (currentPosition > 0 && zeroCount <= maxZeroCount) {
      const previousPosition = prefixPreviousIndex[currentPosition];

      // Number of ones in substrings where:
      //   left in (previousPosition, currentPosition]
      //   right = rightIndex - 1
      const oneCount = rightIndex - previousPosition - zeroCount;
      const zeroCountSquare = zeroCount * zeroCount;

      // Check if we can have dominant substrings for this zero count
      if (zeroCountSquare <= oneCount) {
        // Available starting positions in (previousPosition, currentPosition]
        const availableStartCount = currentPosition - previousPosition;

        // Maximum number of dominant substrings we can form for this zero count
        const dominantExtraCount = oneCount - zeroCountSquare + 1;

        // Manual min to avoid Math.min overhead in the tight loop
        if (availableStartCount < dominantExtraCount) {
          result += availableStartCount;
        } else {
          result += dominantExtraCount;
        }
      }

      // Jump to the previous split and increase zero count
      currentPosition = previousPosition;
      zeroCount += 1;
    }
  }

  return result;
}
