function minOperations(s: string): number {
  const length = s.length;

  // A single character is always non-descending.
  if (length < 2) {
    return 0;
  }

  const lastIndex = length - 1;
  const firstCode = s.charCodeAt(0);
  const lastCode = s.charCodeAt(lastIndex);

  let isSorted = true;
  let previousCode = firstCode;
  // Bitmask of the 26 letters occurring strictly between the two end positions.
  let middleMask = 0;

  // Single pass: check order and collect the middle alphabet as bits (branch-free OR).
  for (let index = 1; index < lastIndex; index++) {
    const code = s.charCodeAt(index);

    if (code < previousCode) {
      isSorted = false;
    }

    previousCode = code;
    middleMask |= 1 << (code - 97);
  }

  // The final adjacent pair is checked outside the loop to keep the loop body tight.
  if (lastCode < previousCode) {
    isSorted = false;
  }

  if (isSorted) {
    return 0;
  }

  // Length two: no proper substring contains two characters, so nothing can move.
  if (length === 2) {
    return -1;
  }

  const firstBit = 1 << (firstCode - 97);
  const lastBit = 1 << (lastCode - 97);

  // No middle letter below the first character, and the first is not above the last.
  const firstIsGlobalMinimum = firstCode <= lastCode && (middleMask & (firstBit - 1)) === 0;
  // No middle letter above the last character, and the last is not below the first.
  const lastIsGlobalMaximum = lastCode >= firstCode && middleMask < (lastBit << 1);

  // One of the ends is already final, so the minimal window is a proper substring.
  if (firstIsGlobalMinimum || lastIsGlobalMaximum) {
    return 1;
  }

  // First character is the strict maximum and last character the strict minimum.
  if (middleMask < firstBit && (middleMask & ((lastBit << 1) - 1)) === 0) {
    return 3;
  }

  return 2;
}
