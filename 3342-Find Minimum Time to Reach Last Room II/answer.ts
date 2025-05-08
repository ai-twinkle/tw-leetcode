function minTimeToReach(moveTime: number[][]): number {
  const n = moveTime.length;
  const m = moveTime[0].length;
  const totalCells = n * m;

  // 1. Prepare arrays for open times and movement costs
  const openTimeArray = new Int32Array(totalCells);
  const stepCostArray = new Uint8Array(totalCells);

  // Populate flattened arrays
  for (let rowIndex = 0; rowIndex < n; ++rowIndex) {
    const base = rowIndex * m;
    const rowArr = moveTime[rowIndex];

    for (let columnIndex = 0; columnIndex < m; ++columnIndex) {
      const idx = base + columnIndex;
      // store earliest open time for cell
      openTimeArray[idx] = rowArr[columnIndex] | 0;
      // alternating step cost pattern based on parity
      stepCostArray[idx] = ((rowIndex + columnIndex) & 1) + 1;
    }
  }

  // 2. Initialize distance and visited state
  const INF = 0x7fffffff;
  const distanceArray = new Int32Array(totalCells).fill(INF);
  distanceArray[0] = 0; // starting cell distance = 0
  const visitedFlags = new Uint8Array(totalCells);

  // 3. Build a custom binary min-heap for efficient min extraction
  const heapIndices = new Int32Array(totalCells + 1);
  let heapSize = 0;

  /**
   * Push a node index into the min-heap.
   * @param nodeIndex {number} - index to add
   */
  function pushHeap(nodeIndex: number) {
    let pos = ++heapSize;
    heapIndices[pos] = nodeIndex;
    // Bubble up until heap property is restored
    while (pos > 1) {
      const parentPos = pos >>> 1;
      const parentIndex = heapIndices[parentPos];

      if (distanceArray[nodeIndex] >= distanceArray[parentIndex]) {
        break;
      }
      // Swap with parent
      heapIndices[pos] = parentIndex;
      heapIndices[parentPos] = nodeIndex;
      pos = parentPos;
    }
  }

  /**
   * Pop the top node (smallest distance) from the heap.
   * @returns {number} - popped node index
   */
  function popHeap(): number {
    const top = heapIndices[1];
    const last = heapIndices[heapSize--];
    let pos = 1;
    // Sift down to restore heap
    while ((pos << 1) <= heapSize) {
      let childPos = pos << 1;
      const leftIndex = heapIndices[childPos];

      // Pick the smaller child
      if (
        childPos + 1 <= heapSize &&
        distanceArray[heapIndices[childPos + 1]] < distanceArray[leftIndex]
      ) {
        childPos++;
      }

      const childIndex = heapIndices[childPos];
      if (distanceArray[last] <= distanceArray[childIndex]) {
        break;
      }

      // Move child up
      heapIndices[pos] = childIndex;
      pos = childPos;
    }
    heapIndices[pos] = last;
    return top;
  }

  // Insert the starting cell into the heap
  pushHeap(0);

  // 4. Main Dijkstra loop: extract-min and relax neighbors
  while (heapSize > 0) {
    const currentIndex = popHeap();

    // skip if already visited
    if (visitedFlags[currentIndex]) {
      continue;
    }

    // stop early if destination reached
    if (currentIndex === totalCells - 1) {
      break;
    }

    // mark as visited
    visitedFlags[currentIndex] = 1;

    // compute row/column and cost for current cell
    const currentDistance = distanceArray[currentIndex];
    const rowIndex = (currentIndex / m) | 0;
    const columnIndex = currentIndex - rowIndex * m;
    const costForThisStep = stepCostArray[currentIndex];

    /**
     * Relax the edge to a neighbor cell.
     * @param neighbor {number} - index of the neighbor cell
     */
    const relax = (neighbor: number) => {
      if (visitedFlags[neighbor]) {
        return;
      }

      // determine departure time (may need to wait for openTime)
      let departTime = currentDistance;
      const openTime = openTimeArray[neighbor];
      if (departTime < openTime) {
        departTime = openTime;
      }

      const arriveTime = departTime + costForThisStep;
      if (arriveTime < distanceArray[neighbor]) {
        // update shorter path
        distanceArray[neighbor] = arriveTime;
        pushHeap(neighbor);
      }
    };

    // relax four possible directions
    if (columnIndex + 1 < m) {
      relax(currentIndex + 1);
    }
    if (columnIndex > 0) {
      relax(currentIndex - 1);
    }
    if (rowIndex + 1 < n) {
      relax(currentIndex + m);
    }
    if (rowIndex > 0) {
      relax(currentIndex - m);
    }
  }

  // return result or -1 if unreachable
  const result = distanceArray[totalCells - 1];
  return result === INF ? -1 : result;
}
