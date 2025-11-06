function processQueries(c: number, connections: number[][], queries: number[][]): number[] {
  const stationCount: number = c;
  const edgeCount: number = connections.length;

  // 1. Fast path: when no cables exist, each station is isolated
  if (edgeCount === 0) {
    const isOffline = new Uint8Array(stationCount + 1);
    const results: number[] = [];

    for (let i = 0; i < queries.length; i += 1) {
      const queryType = queries[i][0] | 0;
      const stationId = queries[i][1] | 0;

      if (queryType === 2) {
        // Station goes offline
        isOffline[stationId] = 1;
        continue;
      }

      // Maintenance check on the station
      if (isOffline[stationId] === 0) {
        results.push(stationId);
      } else {
        results.push(-1);
      }
    }
    return results;
  }

  // 2. Build Disjoint Set Union (Union-Find) structure
  const parent = new Int32Array(stationCount + 1);
  const setSize = new Int32Array(stationCount + 1);

  // Initialize each station as its own parent (self root)
  for (let stationId = 1; stationId <= stationCount; stationId += 1) {
    parent[stationId] = stationId;
    setSize[stationId] = 1;
  }

  /**
   * Find the representative (root) of a set with path compression.
   * @param {number} stationId - Target station to find root for
   * @returns {number} Root station identifier
   */
  function findRoot(stationId: number): number {
    let current = stationId | 0;
    while (parent[current] !== current) {
      // Path halving for compression (faster on large trees)
      parent[current] = parent[parent[current]];
      current = parent[current];
    }
    return current;
  }

  /**
   * Union two sets by size to maintain a shallow tree structure.
   * @param {number} firstStation - First endpoint of the connection
   * @param {number} secondStation - Second endpoint of the connection
   */
  function mergeSets(firstStation: number, secondStation: number): void {
    let rootA = findRoot(firstStation);
    let rootB = findRoot(secondStation);

    if (rootA === rootB) {
      return; // Already in the same component
    }

    // Always attach smaller tree under larger tree
    if (setSize[rootA] < setSize[rootB]) {
      const temp = rootA;
      rootA = rootB;
      rootB = temp;
    }

    parent[rootB] = rootA;
    setSize[rootA] += setSize[rootB];
  }

  // 3. Connect all cables between stations
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex += 1) {
    const stationU = connections[edgeIndex][0] | 0;
    const stationV = connections[edgeIndex][1] | 0;
    mergeSets(stationU, stationV);
  }

  // 4. Compress roots and assign contiguous component indices
  const rootToComponent = new Int32Array(stationCount + 1);
  let componentCount = 0;

  for (let stationId = 1; stationId <= stationCount; stationId += 1) {
    const root = findRoot(stationId);
    if (rootToComponent[root] === 0) {
      componentCount += 1;
      rootToComponent[root] = componentCount;
    }
  }

  // 5. Compute component sizes
  const componentSize = new Int32Array(componentCount + 1);
  for (let rootId = 1; rootId <= stationCount; rootId += 1) {
    if (parent[rootId] === rootId) {
      const componentIndex = rootToComponent[rootId];
      componentSize[componentIndex] = setSize[rootId];
    }
  }

  // 6. Build component ordering (ascending station IDs automatically)
  const componentStart = new Int32Array(componentCount + 1);
  const componentEnd = new Int32Array(componentCount + 1);

  // Prefix sum to determine component block ranges
  let offset = 0;
  for (let componentIndex = 1; componentIndex <= componentCount; componentIndex += 1) {
    componentStart[componentIndex] = offset;
    offset += componentSize[componentIndex];
    componentEnd[componentIndex] = offset;
  }

  // Cursor for writing into each component block
  const writeCursor = new Int32Array(componentCount + 1);
  for (let componentIndex = 1; componentIndex <= componentCount; componentIndex += 1) {
    writeCursor[componentIndex] = componentStart[componentIndex];
  }

  // Combined array of all stations, grouped by component
  const orderedStations = new Int32Array(stationCount);

  // Direct lookup from station -> component
  const stationToComponent = new Int32Array(stationCount + 1);

  // Fill station blocks (already in ascending order)
  for (let stationId = 1; stationId <= stationCount; stationId += 1) {
    const root = findRoot(stationId);
    const componentIndex = rootToComponent[root];
    const writePosition = writeCursor[componentIndex];
    orderedStations[writePosition] = stationId;
    writeCursor[componentIndex] = writePosition + 1;
    stationToComponent[stationId] = componentIndex;
  }

  // Initialize pointer for smallest online station in each component
  const componentPointer = new Int32Array(componentCount + 1);
  for (let componentIndex = 1; componentIndex <= componentCount; componentIndex += 1) {
    componentPointer[componentIndex] = componentStart[componentIndex];
  }

  // 7. Process all queries with lazy advancement
  const isOffline = new Uint8Array(stationCount + 1);
  const results: number[] = [];

  /**
   * Advance pointer of a component to skip offline stations.
   * @param {number} componentIndex - Component index
   */
  function movePointerForward(componentIndex: number): void {
    let pointer = componentPointer[componentIndex];
    const pointerEnd = componentEnd[componentIndex];

    // Move pointer until reaching an online station
    while (pointer < pointerEnd) {
      const currentStation = orderedStations[pointer];
      if (isOffline[currentStation] === 0) {
        break;
      }
      pointer += 1;
    }

    componentPointer[componentIndex] = pointer;
  }

  // 8. Execute all queries
  for (let queryIndex = 0; queryIndex < queries.length; queryIndex += 1) {
    const queryType = queries[queryIndex][0] | 0;
    const stationId = queries[queryIndex][1] | 0;

    if (queryType === 2) {
      // Station shutdown event
      isOffline[stationId] = 1;

      // If this station is currently the pointer, move pointer forward immediately
      const componentIndex = stationToComponent[stationId];
      const currentPointer = componentPointer[componentIndex];
      if (
        currentPointer < componentEnd[componentIndex] &&
        orderedStations[currentPointer] === stationId
      ) {
        movePointerForward(componentIndex);
      }
      continue;
    }

    // Maintenance check request
    if (isOffline[stationId] === 0) {
      // Online station resolves its own check
      results.push(stationId);
      continue;
    }

    // Station is offline — find next smallest online in the same component
    const componentIndex = stationToComponent[stationId];
    movePointerForward(componentIndex);

    const pointerNow = componentPointer[componentIndex];
    if (pointerNow >= componentEnd[componentIndex]) {
      // Entire grid offline
      results.push(-1);
    } else {
      results.push(orderedStations[pointerNow]);
    }
  }

  return results;
}
