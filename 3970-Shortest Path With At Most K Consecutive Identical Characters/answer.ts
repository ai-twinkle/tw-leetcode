function shortestPath(n: number, edges: number[][], labels: string, k: number): number {
  const edgeCount = edges.length;

  // Encode labels as small integers for fast comparison
  const labelCodes = new Uint8Array(n);
  for (let node = 0; node < n; node++) {
    labelCodes[node] = labels.charCodeAt(node) - 97;
  }

  // Build CSR adjacency: count out-degree first
  const adjacencyStart = new Int32Array(n + 1);
  for (let index = 0; index < edgeCount; index++) {
    adjacencyStart[edges[index][0] + 1]++;
  }
  for (let node = 0; node < n; node++) {
    adjacencyStart[node + 1] += adjacencyStart[node];
  }
  const adjacencyTarget = new Int32Array(edgeCount);
  const adjacencyWeight = new Int32Array(edgeCount);
  const adjacencySameLabel = new Uint8Array(edgeCount);
  const fillCursor = adjacencyStart.slice(0, n);
  for (let index = 0; index < edgeCount; index++) {
    const edge = edges[index];
    const from = edge[0];
    const to = edge[1];
    const position = fillCursor[from]++;
    adjacencyTarget[position] = to;
    adjacencyWeight[position] = edge[2];
    adjacencySameLabel[position] = labelCodes[from] === labelCodes[to] ? 1 : 0;
  }

  // State = node * k + (runLength - 1); distances can exceed int32 range
  const stateCount = n * k;
  const distance = new Float64Array(stateCount).fill(Infinity);

  // Smallest run length already finalized per node; larger runs at a later pop are dominated
  const finalizedRun = new Int32Array(n).fill(k + 1);

  // Binary min-heap on parallel typed arrays (lazy deletion)
  const heapCapacity = edgeCount * k + 2;
  const heapKey = new Float64Array(heapCapacity);
  const heapState = new Int32Array(heapCapacity);
  let heapSize = 0;

  /**
   * Push a state with its tentative distance into the heap.
   * @param key Tentative distance of the state
   * @param state Encoded state index
   */
  const heapPush = (key: number, state: number): void => {
    let position = heapSize++;
    while (position > 0) {
      const parent = (position - 1) >> 1;
      if (heapKey[parent] <= key) {
        break;
      }
      heapKey[position] = heapKey[parent];
      heapState[position] = heapState[parent];
      position = parent;
    }
    heapKey[position] = key;
    heapState[position] = state;
  };

  /**
   * Remove the root of the heap and restore heap order.
   */
  const heapPop = (): void => {
    heapSize--;
    if (heapSize === 0) {
      return;
    }
    const key = heapKey[heapSize];
    const state = heapState[heapSize];
    let position = 0;
    const half = heapSize >> 1;
    while (position < half) {
      let child = 2 * position + 1;
      const right = child + 1;
      if (right < heapSize && heapKey[right] < heapKey[child]) {
        child = right;
      }
      if (heapKey[child] >= key) {
        break;
      }
      heapKey[position] = heapKey[child];
      heapState[position] = heapState[child];
      position = child;
    }
    heapKey[position] = key;
    heapState[position] = state;
  };

  const target = n - 1;
  distance[0] = 0;
  heapPush(0, 0);

  while (heapSize > 0) {
    const currentDistance = heapKey[0];
    const state = heapState[0];
    heapPop();

    if (currentDistance > distance[state]) {
      continue;
    }
    const node = (state / k) | 0;
    const runLength = state - node * k + 1;

    // Dominated: same node already settled with shorter-or-equal distance and smaller run
    if (runLength >= finalizedRun[node]) {
      continue;
    }
    finalizedRun[node] = runLength;

    // First settled state of the target is the optimum
    if (node === target) {
      return currentDistance;
    }

    for (let position = adjacencyStart[node], end = adjacencyStart[node + 1]; position < end; position++) {
      const next = adjacencyTarget[position];
      let nextRun = 1;
      if (adjacencySameLabel[position] === 1) {
        nextRun = runLength + 1;
        if (nextRun > k) {
          continue;
        }
      }

      // Skip states already dominated by a finalized smaller run
      if (nextRun >= finalizedRun[next]) {
        continue;
      }
      const nextState = next * k + nextRun - 1;
      const nextDistance = currentDistance + adjacencyWeight[position];
      if (nextDistance < distance[nextState]) {
        distance[nextState] = nextDistance;
        heapPush(nextDistance, nextState);
      }
    }
  }

  return -1;
}
