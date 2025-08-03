function maxTotalFruits(fruits: number[][], startPos: number, k: number): number {
  const totalFruitsCount = fruits.length;
  // Move positions and amounts into typed arrays for faster indexing
  const positions = new Int32Array(totalFruitsCount);
  const counts = new Int32Array(totalFruitsCount);
  for (let index = 0; index < totalFruitsCount; index++) {
    positions[index] = fruits[index][0];
    counts[index] = fruits[index][1];
  }

  const startPosition = startPos;
  const maximumSteps = k;

  let maxFruitsCollected = 0;
  let leftPointer = 0;
  let currentWindowSum = 0;

  // Expand the window by moving rightPointer forward
  for (let rightPointer = 0; rightPointer < totalFruitsCount; rightPointer++) {
    currentWindowSum += counts[rightPointer];

    // Shrink from the left until the needed steps ≤ k
    while (leftPointer <= rightPointer) {
      const leftPosition = positions[leftPointer];
      const rightPosition = positions[rightPointer];
      let stepsNeeded: number;

      if (rightPosition <= startPosition) {
        // All to the left of start
        stepsNeeded = startPosition - leftPosition;
      } else if (leftPosition >= startPosition) {
        // All to the right of start
        stepsNeeded = rightPosition - startPosition;
      } else {
        // Mixed: decide whether to go left first or right first
        const distanceLeft = startPosition - leftPosition;
        const distanceRight = rightPosition - startPosition;
        const stepsLeftThenRight = distanceLeft * 2 + distanceRight;
        const stepsRightThenLeft = distanceRight * 2 + distanceLeft;
        stepsNeeded =
          stepsLeftThenRight < stepsRightThenLeft
            ? stepsLeftThenRight
            : stepsRightThenLeft;
      }

      if (stepsNeeded <= maximumSteps) {
        break;
      }
      // Drop the leftmost fruit and advance leftPointer
      currentWindowSum -= counts[leftPointer];
      leftPointer++;
    }

    // Update global max
    if (currentWindowSum > maxFruitsCollected) {
      maxFruitsCollected = currentWindowSum;
    }
  }

  return maxFruitsCollected;
}
