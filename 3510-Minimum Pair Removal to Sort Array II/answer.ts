function minimumPairRemoval(nums: number[]): number {
  const length = nums.length;
  if (length <= 1) {
    return 0;
  }

  // Store values in a typed array for fast numeric access.
  const values = new Float64Array(length);
  for (let index = 0; index < length; index++) {
    values[index] = nums[index];
  }

  // Doubly linked list over indices to support O(1) removals.
  const previousIndex = new Int32Array(length);
  const nextIndex = new Int32Array(length);
  const alive = new Uint8Array(length);

  // Version counter per node to invalidate stale heap entries.
  const nodeVersion = new Uint32Array(length);

  for (let index = 0; index < length; index++) {
    previousIndex[index] = index - 1;
    nextIndex[index] = index + 1;
    alive[index] = 1;
  }
  nextIndex[length - 1] = -1;

  // Initial inversion count of the array.
  let inversionCount = 0;
  for (let index = 0; index < length - 1; index++) {
    if (values[index] > values[index + 1]) {
      inversionCount++;
    }
  }
  if (inversionCount === 0) {
    return 0;
  }

  // Min-heap storing adjacent pairs.
  const capacity = length * 3 + 8;
  const heapLeft = new Int32Array(capacity);
  const heapRight = new Int32Array(capacity);
  const heapSum = new Float64Array(capacity);
  const heapLeftVersion = new Uint32Array(capacity);
  const heapRightVersion = new Uint32Array(capacity);
  let heapSize = 0;

  /**
   * Heap ordering: smaller sum first, tie-break by smaller left index.
   * @param leftA Left index of the first pair.
   * @param sumA Sum of the first pair.
   * @param leftB Left index of the second pair.
   * @param sumB Sum of the second pair.
   * @returns True if the first pair is less than the second pair.
   */
  function isLess(leftA: number, sumA: number, leftB: number, sumB: number): boolean {
    if (sumA < sumB) {
      return true;
    }
    if (sumA > sumB) {
      return false;
    }
    return leftA < leftB;
  }

  /**
   * Move the element at startIndex upward until heap order is restored.
   * @param startIndex Index to sift up from.
   */
  function siftUp(startIndex: number): void {
    let holeIndex = startIndex;

    const movingLeft = heapLeft[holeIndex];
    const movingRight = heapRight[holeIndex];
    const movingSum = heapSum[holeIndex];
    const movingLeftVersion = heapLeftVersion[holeIndex];
    const movingRightVersion = heapRightVersion[holeIndex];

    // Bubble up until the parent is smaller or the root is reached.
    while (holeIndex > 0) {
      const parentIndex = (holeIndex - 1) >>> 1;

      if (!isLess(movingLeft, movingSum, heapLeft[parentIndex], heapSum[parentIndex])) {
        break;
      }

      // Pull parent down into the hole.
      heapLeft[holeIndex] = heapLeft[parentIndex];
      heapRight[holeIndex] = heapRight[parentIndex];
      heapSum[holeIndex] = heapSum[parentIndex];
      heapLeftVersion[holeIndex] = heapLeftVersion[parentIndex];
      heapRightVersion[holeIndex] = heapRightVersion[parentIndex];

      holeIndex = parentIndex;
    }

    // Place the moving element into its final position.
    heapLeft[holeIndex] = movingLeft;
    heapRight[holeIndex] = movingRight;
    heapSum[holeIndex] = movingSum;
    heapLeftVersion[holeIndex] = movingLeftVersion;
    heapRightVersion[holeIndex] = movingRightVersion;
  }

  /**
   * Move the element at startIndex downward until heap order is restored.
   * @param startIndex Index to sift down from.
   */
  function siftDownFrom(startIndex: number): void {
    let holeIndex = startIndex;

    const movingLeft = heapLeft[holeIndex];
    const movingRight = heapRight[holeIndex];
    const movingSum = heapSum[holeIndex];
    const movingLeftVersion = heapLeftVersion[holeIndex];
    const movingRightVersion = heapRightVersion[holeIndex];

    while (true) {
      // Compute left child index in binary heap.
      const leftChildIndex = holeIndex * 2 + 1;

      // No children mean the heap property is satisfied.
      if (leftChildIndex >= heapSize) {
        break;
      }

      // Choose the smaller child (by heap ordering).
      let bestChildIndex = leftChildIndex;
      const rightChildIndex = leftChildIndex + 1;

      if (rightChildIndex < heapSize) {
        if (
          isLess(
            heapLeft[rightChildIndex],
            heapSum[rightChildIndex],
            heapLeft[leftChildIndex],
            heapSum[leftChildIndex]
          )
        ) {
          bestChildIndex = rightChildIndex;
        }
      }

      // If the moving element is already smaller than both children, stop.
      if (
        !isLess(
          heapLeft[bestChildIndex],
          heapSum[bestChildIndex],
          movingLeft,
          movingSum
        )
      ) {
        break;
      }

      // Move the smaller child up to fill the hole.
      heapLeft[holeIndex] = heapLeft[bestChildIndex];
      heapRight[holeIndex] = heapRight[bestChildIndex];
      heapSum[holeIndex] = heapSum[bestChildIndex];
      heapLeftVersion[holeIndex] = heapLeftVersion[bestChildIndex];
      heapRightVersion[holeIndex] = heapRightVersion[bestChildIndex];

      holeIndex = bestChildIndex;
    }

    // Place the moving element into its final position.
    heapLeft[holeIndex] = movingLeft;
    heapRight[holeIndex] = movingRight;
    heapSum[holeIndex] = movingSum;
    heapLeftVersion[holeIndex] = movingLeftVersion;
    heapRightVersion[holeIndex] = movingRightVersion;
  }

  /**
   * Insert a new adjacent pair into the heap.
   * @param left Left index of the pair.
   * @param right Right index of the pair.
   */
  function pushPair(left: number, right: number): void {
    const insertIndex = heapSize++;
    heapLeft[insertIndex] = left;
    heapRight[insertIndex] = right;
    heapSum[insertIndex] = values[left] + values[right];
    heapLeftVersion[insertIndex] = nodeVersion[left];
    heapRightVersion[insertIndex] = nodeVersion[right];
    siftUp(insertIndex);
  }

  /**
   * Remove the root of the heap.
   */
  function popRootDiscard(): void {
    heapSize--;
    if (heapSize <= 0) {
      return;
    }
    heapLeft[0] = heapLeft[heapSize];
    heapRight[0] = heapRight[heapSize];
    heapSum[0] = heapSum[heapSize];
    heapLeftVersion[0] = heapLeftVersion[heapSize];
    heapRightVersion[0] = heapRightVersion[heapSize];
    siftDownFrom(0);
  }

  // Initial heap population with all adjacent pairs.
  for (let index = 0; index < length - 1; index++) {
    pushPair(index, index + 1);
  }

  let operations = 0;
  let aliveCount = length;

  while (inversionCount > 0 && aliveCount > 1) {
    let left = -1;
    let right = -1;

    // Discard heap entries until one matches current adjacency and versions.
    while (true) {
      const candidateLeft = heapLeft[0];
      const candidateRight = heapRight[0];

      const valid =
        alive[candidateLeft] === 1 &&
        alive[candidateRight] === 1 &&
        nextIndex[candidateLeft] === candidateRight &&
        nodeVersion[candidateLeft] === heapLeftVersion[0] &&
        nodeVersion[candidateRight] === heapRightVersion[0];

      if (valid) {
        left = candidateLeft;
        right = candidateRight;
        popRootDiscard();
        break;
      }

      popRootDiscard();
    }

    const leftPrev = previousIndex[left];
    const rightNext = nextIndex[right];

    // Remove inversion contributions from edges that will disappear.
    if (leftPrev !== -1 && values[leftPrev] > values[left]) {
      inversionCount--;
    }
    if (values[left] > values[right]) {
      inversionCount--;
    }
    if (rightNext !== -1 && values[right] > values[rightNext]) {
      inversionCount--;
    }

    // Merge right into left and unlink right.
    values[left] += values[right];
    nodeVersion[left]++;
    alive[right] = 0;
    aliveCount--;

    nextIndex[left] = rightNext;
    if (rightNext !== -1) {
      previousIndex[rightNext] = left;
    }

    // Add inversion contributions from newly formed edges.
    if (leftPrev !== -1 && values[leftPrev] > values[left]) {
      inversionCount++;
    }
    if (rightNext !== -1 && values[left] > values[rightNext]) {
      inversionCount++;
    }

    // Only neighboring pairs can change after a merge.
    if (leftPrev !== -1) {
      pushPair(leftPrev, left);
    }
    if (rightNext !== -1) {
      pushPair(left, rightNext);
    }

    operations++;
  }

  return operations;
}
