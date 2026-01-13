/**
 * Sorts (yEventArray, slopeDeltaArray) pairs in-place by yEventArray ascending using an iterative quicksort.
 * @param yEventArray Y-coordinates of events
 * @param slopeDeltaArray Slope deltas aligned to yEventArray
 */
function sortEventsByYCoordinate(yEventArray: Float64Array, slopeDeltaArray: Float64Array): void {
  const length = yEventArray.length;
  if (length <= 1) {
    return;
  }

  // Stack depth is bounded by O(log n) because we always push the larger partition.
  const leftIndexStack = new Int32Array(64);
  const rightIndexStack = new Int32Array(64);

  let stackSize = 0;
  leftIndexStack[stackSize] = 0;
  rightIndexStack[stackSize] = length - 1;
  stackSize++;

  while (stackSize !== 0) {
    stackSize--;
    let leftIndex = leftIndexStack[stackSize];
    let rightIndex = rightIndexStack[stackSize];

    while (leftIndex < rightIndex) {
      const pivotValue = yEventArray[(leftIndex + rightIndex) >>> 1];

      let leftPointer = leftIndex;
      let rightPointer = rightIndex;

      while (leftPointer <= rightPointer) {
        while (yEventArray[leftPointer] < pivotValue) {
          leftPointer++;
        }
        while (yEventArray[rightPointer] > pivotValue) {
          rightPointer--;
        }

        if (leftPointer <= rightPointer) {
          const yTemporary = yEventArray[leftPointer];
          yEventArray[leftPointer] = yEventArray[rightPointer];
          yEventArray[rightPointer] = yTemporary;

          const slopeDeltaTemporary = slopeDeltaArray[leftPointer];
          slopeDeltaArray[leftPointer] = slopeDeltaArray[rightPointer];
          slopeDeltaArray[rightPointer] = slopeDeltaTemporary;

          leftPointer++;
          rightPointer--;
        }
      }

      // Process the smaller partition immediately and push the larger partition to the stack.
      const leftPartitionSize = rightPointer - leftIndex;
      const rightPartitionSize = rightIndex - leftPointer;

      if (leftPartitionSize < rightPartitionSize) {
        if (leftPointer < rightIndex) {
          leftIndexStack[stackSize] = leftPointer;
          rightIndexStack[stackSize] = rightIndex;
          stackSize++;
        }
        rightIndex = rightPointer;
      } else {
        if (leftIndex < rightPointer) {
          leftIndexStack[stackSize] = leftIndex;
          rightIndexStack[stackSize] = rightPointer;
          stackSize++;
        }
        leftIndex = leftPointer;
      }
    }
  }
}

/**
 * Finds the minimum y-coordinate of a horizontal line such that
 * the total counted area of all squares above the line equals the total counted area below it.
 * @param squares Each element is [x, y, sideLength] (x is unused because the cut is horizontal)
 * @returns The y-coordinate of the balancing line
 */
function separateSquares(squares: number[][]): number {
  const squareCount = squares.length;
  const totalEventCount = squareCount + squareCount;

  // Two events per square: start (+sideLength) at y, end (-sideLength) at y + sideLength.
  const yEventArray = new Float64Array(totalEventCount);
  const slopeDeltaArray = new Float64Array(totalEventCount);

  let eventWriteIndex = 0;
  let totalArea = 0;

  for (let squareIndex = 0; squareIndex < squareCount; squareIndex++) {
    const square = squares[squareIndex];
    const yStart = square[1];
    const sideLength = square[2];
    const yEnd = yStart + sideLength;

    yEventArray[eventWriteIndex] = yStart;
    slopeDeltaArray[eventWriteIndex] = sideLength;
    eventWriteIndex++;

    yEventArray[eventWriteIndex] = yEnd;
    slopeDeltaArray[eventWriteIndex] = -sideLength;
    eventWriteIndex++;

    totalArea += sideLength * sideLength;
  }

  sortEventsByYCoordinate(yEventArray, slopeDeltaArray);

  const targetAreaBelow = totalArea * 0.5;

  let accumulatedAreaBelow = 0;
  let currentSlope = 0;
  let currentY = yEventArray[0];

  let eventReadIndex = 0;
  while (eventReadIndex < totalEventCount) {
    const yAtEvent = yEventArray[eventReadIndex];
    const deltaY = yAtEvent - currentY;

    if (deltaY !== 0) {
      // Area gained in this interval is linear: slope * deltaY.
      const intervalArea = currentSlope * deltaY;

      if (currentSlope !== 0 && accumulatedAreaBelow + intervalArea >= targetAreaBelow) {
        const remainingAreaNeeded = targetAreaBelow - accumulatedAreaBelow;
        return currentY + remainingAreaNeeded / currentSlope;
      }

      accumulatedAreaBelow += intervalArea;
      currentY = yAtEvent;

      if (accumulatedAreaBelow >= targetAreaBelow) {
        return currentY;
      }
    }

    // Merge all slope deltas at the same y to reduce loop overhead.
    let mergedSlopeDelta = 0;
    while (eventReadIndex < totalEventCount && yEventArray[eventReadIndex] === yAtEvent) {
      mergedSlopeDelta += slopeDeltaArray[eventReadIndex];
      eventReadIndex++;
    }

    currentSlope += mergedSlopeDelta;
  }

  // Fallback for numerical edge cases (should not be needed for valid inputs).
  return currentY;
}
