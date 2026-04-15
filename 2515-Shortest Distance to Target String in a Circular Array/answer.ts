function closestTarget(words: string[], target: string, startIndex: number): number {
  const length = words.length;
  let result = -1;

  // Expand outward from startIndex, checking both directions simultaneously
  for (let distance = 0; distance <= (length >> 1) && result === -1; distance++) {
    // Forward (clockwise) index with branch-based wrapping
    let forwardIndex = startIndex + distance;
    if (forwardIndex >= length) {
      forwardIndex -= length;
    }

    // Backward (counter-clockwise) index with branch-based wrapping
    let backwardIndex = startIndex - distance;
    if (backwardIndex < 0) {
      backwardIndex += length;
    }

    // Check forward direction first, then backward if distinct
    if (words[forwardIndex] === target) {
      result = distance;
    } else if (distance > 0 && words[backwardIndex] === target) {
      result = distance;
    }
  }

  return result;
}
