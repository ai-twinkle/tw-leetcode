function longestPalindrome(s: string): string {
  const sourceLength = s.length;
  if (sourceLength < 2) {
    return s;
  }

  // Build transformed buffer: ^ # s0 # s1 # ... # s(n-1) # $
  const transformedLength = (sourceLength << 1) + 3;
  const transformedCodes = new Uint16Array(transformedLength);

  transformedCodes[0] = 94; // '^'
  transformedCodes[transformedLength - 1] = 36; // '$'

  let writeIndex = 1;
  transformedCodes[writeIndex++] = 35; // '#'
  for (let sourceIndex = 0; sourceIndex < sourceLength; sourceIndex++) {
    transformedCodes[writeIndex++] = s.charCodeAt(sourceIndex);
    transformedCodes[writeIndex++] = 35; // '#'
  }

  const radius = new Int32Array(transformedLength);

  let currentCenterIndex = 0;
  let currentRightBoundary = 0;

  let bestCenterIndex = 0;
  let bestRadius = 0;

  for (let index = 1; index < transformedLength - 1; index++) {
    // Use mirror radius to skip redundant expansions when inside the right boundary
    if (index < currentRightBoundary) {
      const mirrorIndex = (currentCenterIndex << 1) - index;
      const maxAllowedRadius = currentRightBoundary - index;
      const mirroredRadius = radius[mirrorIndex];
      radius[index] = mirroredRadius < maxAllowedRadius ? mirroredRadius : maxAllowedRadius;
    }

    // Expand around the index while the mirrored characters match
    while (transformedCodes[index + radius[index] + 1] === transformedCodes[index - radius[index] - 1]) {
      radius[index]++;
    }

    // Update the active center/right boundary if this palindrome extends further
    const expandedRightBoundary = index + radius[index];
    if (expandedRightBoundary > currentRightBoundary) {
      currentCenterIndex = index;
      currentRightBoundary = expandedRightBoundary;
    }

    // Track the best palindrome seen so far
    if (radius[index] > bestRadius) {
      bestRadius = radius[index];
      bestCenterIndex = index;
    }
  }

  const bestStartIndex = (bestCenterIndex - bestRadius) >> 1;
  return s.substring(bestStartIndex, bestStartIndex + bestRadius);
}
