function separateSquares(squares: number[][]): number {
  const squareCount = squares.length;
  const eventCount = squareCount << 1;

  // Collect x endpoints for coordinate compression.
  const xEndpoints: number[] = new Array(eventCount);
  for (let squareIndex = 0, writeIndex = 0; squareIndex < squareCount; squareIndex++) {
    const square = squares[squareIndex];
    const xStart = square[0];
    const sideLength = square[2];

    xEndpoints[writeIndex] = xStart;
    writeIndex++;

    xEndpoints[writeIndex] = xStart + sideLength;
    writeIndex++;
  }
  xEndpoints.sort((leftValue, rightValue) => leftValue - rightValue);

  // Build unique x coordinates after sorting.
  const uniqueX: number[] = [];
  let lastValue = NaN;
  for (let endpointIndex = 0; endpointIndex < xEndpoints.length; endpointIndex++) {
    const value = xEndpoints[endpointIndex];
    if (value !== lastValue) {
      uniqueX.push(value);
      lastValue = value;
    }
  }

  const xPointCount = uniqueX.length;
  const segmentCount = xPointCount - 1;
  if (segmentCount <= 0) {
    return 0;
  }

  // Map x coordinate to its index in the compressed array.
  const xIndexMap = new Map<number, number>();
  for (let xIndex = 0; xIndex < xPointCount; xIndex++) {
    xIndexMap.set(uniqueX[xIndex], xIndex);
  }

  // Store sweep-line events in typed arrays to reduce per-event object overhead.
  const yValues = new Float64Array(eventCount);
  const leftIndices = new Int32Array(eventCount);
  const rightIndices = new Int32Array(eventCount);
  const deltas = new Int8Array(eventCount);

  for (let squareIndex = 0, eventIndex = 0; squareIndex < squareCount; squareIndex++) {
    const square = squares[squareIndex];
    const xStart = square[0];
    const yStart = square[1];
    const sideLength = square[2];

    const leftIndex = xIndexMap.get(xStart)!;
    const rightIndex = xIndexMap.get(xStart + sideLength)!;

    // Enter event adds coverage on its x-interval at yStart.
    yValues[eventIndex] = yStart;
    leftIndices[eventIndex] = leftIndex;
    rightIndices[eventIndex] = rightIndex;
    deltas[eventIndex] = 1;
    eventIndex++;

    // Exit event removes coverage on the same x-interval at yStart + sideLength.
    yValues[eventIndex] = yStart + sideLength;
    leftIndices[eventIndex] = leftIndex;
    rightIndices[eventIndex] = rightIndex;
    deltas[eventIndex] = -1;
    eventIndex++;
  }

  // Sort events by y coordinate using an index order array.
  const order: number[] = new Array(eventCount);
  for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
    order[eventIndex] = eventIndex;
  }
  order.sort((leftEventId, rightEventId) => yValues[leftEventId] - yValues[rightEventId]);

  // Segment tree maintains the union-covered x-length after applying active intervals.
  const treeSize = (segmentCount << 2) + 8;
  const coverCount = new Int32Array(treeSize);
  const coveredLength = new Float64Array(treeSize);

  // Iterative stacks implement range updates without recursion.
  const nodeStack = new Int32Array(96);
  const leftStack = new Int32Array(96);
  const rightStack = new Int32Array(96);
  const stateStack = new Int8Array(96);

  /**
   * Apply a coverage delta over [queryLeft, queryRight) in compressed x indices.
   *
   * @param queryLeft - Left boundary index in compressed coordinates.
   * @param queryRight - Right boundary index in compressed coordinates.
   * @param delta - +1 to add coverage, -1 to remove coverage.
   * @returns void
   */
  function updateRange(queryLeft: number, queryRight: number, delta: number): void {
    if (queryLeft >= queryRight) {
      return;
    }

    // Initialize traversal at the root node covering [0, segmentCount).
    let stackPointer = 0;
    nodeStack[stackPointer] = 1;
    leftStack[stackPointer] = 0;
    rightStack[stackPointer] = segmentCount;
    stateStack[stackPointer] = 0;
    stackPointer++;

    while (stackPointer > 0) {
      stackPointer--;

      const node = nodeStack[stackPointer];
      const nodeLeft = leftStack[stackPointer];
      const nodeRight = rightStack[stackPointer];
      const state = stateStack[stackPointer];

      if (state !== 0) {
        // Recompute coveredLength[node] based on coverCount or children.
        if (coverCount[node] > 0) {
          coveredLength[node] = uniqueX[nodeRight] - uniqueX[nodeLeft];
        } else if (nodeRight - nodeLeft === 1) {
          coveredLength[node] = 0;
        } else {
          const leftChild = node << 1;
          coveredLength[node] = coveredLength[leftChild] + coveredLength[leftChild | 1];
        }
        continue;
      }

      // Skip nodes that do not intersect the query range.
      if (queryRight <= nodeLeft || nodeRight <= queryLeft) {
        continue;
      }

      // Fully covered node: update cover count and refresh its covered length.
      if (queryLeft <= nodeLeft && nodeRight <= queryRight) {
        coverCount[node] += delta;

        if (coverCount[node] > 0) {
          coveredLength[node] = uniqueX[nodeRight] - uniqueX[nodeLeft];
        } else if (nodeRight - nodeLeft === 1) {
          coveredLength[node] = 0;
        } else {
          const leftChild = node << 1;
          coveredLength[node] = coveredLength[leftChild] + coveredLength[leftChild | 1];
        }
        continue;
      }

      // Leaf node: only its cover count matters.
      if (nodeRight - nodeLeft === 1) {
        coverCount[node] += delta;
        coveredLength[node] = coverCount[node] > 0 ? uniqueX[nodeRight] - uniqueX[nodeLeft] : 0;
        continue;
      }

      // Schedule this node for post-order recomputation after children updates.
      nodeStack[stackPointer] = node;
      leftStack[stackPointer] = nodeLeft;
      rightStack[stackPointer] = nodeRight;
      stateStack[stackPointer] = 1;
      stackPointer++;

      const splitIndex = (nodeLeft + nodeRight) >> 1;
      const leftChild = node << 1;

      // Visit right child first so left child is processed next (stack LIFO).
      nodeStack[stackPointer] = leftChild | 1;
      leftStack[stackPointer] = splitIndex;
      rightStack[stackPointer] = nodeRight;
      stateStack[stackPointer] = 0;
      stackPointer++;

      nodeStack[stackPointer] = leftChild;
      leftStack[stackPointer] = nodeLeft;
      rightStack[stackPointer] = splitIndex;
      stateStack[stackPointer] = 0;
      stackPointer++;
    }
  }

  // Record y-strips so we can locate the half-area split in one forward scan.
  const stripStartY = new Float64Array(eventCount);
  const stripDeltaY = new Float64Array(eventCount);
  const stripCoveredX = new Float64Array(eventCount);

  let stripCount = 0;
  let orderIndex = 0;

  // Apply all events at the lowest y before starting the sweep.
  let currentY = yValues[order[0]];
  while (orderIndex < eventCount && yValues[order[orderIndex]] === currentY) {
    const eventId = order[orderIndex];
    updateRange(leftIndices[eventId], rightIndices[eventId], deltas[eventId]);
    orderIndex++;
  }

  let totalArea = 0;

  while (orderIndex < eventCount) {
    const nextY = yValues[order[orderIndex]];
    const deltaY = nextY - currentY;
    const coveredX = coveredLength[1];

    // Persist the current strip for the later half-area search.
    stripStartY[stripCount] = currentY;
    stripDeltaY[stripCount] = deltaY;
    stripCoveredX[stripCount] = coveredX;
    stripCount++;

    // Accumulate total union area using the covered x-length for this strip.
    if (coveredX !== 0 && deltaY !== 0) {
      totalArea += coveredX * deltaY;
    }

    currentY = nextY;

    // Apply all events that occur at the new sweep y.
    while (orderIndex < eventCount && yValues[order[orderIndex]] === currentY) {
      const eventId = order[orderIndex];
      updateRange(leftIndices[eventId], rightIndices[eventId], deltas[eventId]);
      orderIndex++;
    }
  }

  const lowestY = yValues[order[0]];
  if (totalArea === 0) {
    return lowestY;
  }

  const halfArea = totalArea * 0.5;

  // Scan strips to find the earliest y where accumulated area reaches halfArea.
  let areaBelow = 0;
  for (let stripIndex = 0; stripIndex < stripCount; stripIndex++) {
    const startY = stripStartY[stripIndex];
    const deltaY = stripDeltaY[stripIndex];
    const coveredX = stripCoveredX[stripIndex];

    if (coveredX !== 0 && deltaY !== 0) {
      const stripArea = coveredX * deltaY;
      if (areaBelow + stripArea >= halfArea) {
        return startY + (halfArea - areaBelow) / coveredX;
      }
      areaBelow += stripArea;
      continue;
    }

    // Handle degenerate strips so the minimum y is still returned.
    if (areaBelow >= halfArea) {
      return startY;
    }
  }

  return currentY;
}
