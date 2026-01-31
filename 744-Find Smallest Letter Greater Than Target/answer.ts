function nextGreatestLetter(letters: string[], target: string): string {
  const lettersCount = letters.length;

  // Fast wrap-around: if target is >= last, or smaller than first, answer is first.
  if (target >= letters[lettersCount - 1] || target < letters[0]) {
    return letters[0];
  }

  let leftIndex = 0;
  let rightIndex = lettersCount; // exclusive upper bound

  // Binary search for the first element > target.
  while (leftIndex < rightIndex) {
    const middleIndex = (leftIndex + rightIndex) >>> 1;

    if (letters[middleIndex] <= target) {
      leftIndex = middleIndex + 1;
    } else {
      rightIndex = middleIndex;
    }
  }

  // leftIndex is the first index with letters[leftIndex] > target.
  if (leftIndex === lettersCount) {
    return letters[0];
  }

  return letters[leftIndex];
}
