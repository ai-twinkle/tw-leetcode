function maximumSafenessFactor(grid: number[][]): number {
  const size = grid.length;
  const cellCount = size * size;

  // Distance to nearest thief for every cell, computed via multi-source BFS.
  const distanceToThief = new Int32Array(cellCount).fill(-1);

  // Flat queue of cell indices; layer expansion keeps everything O(n^2).
  const bfsQueue = new Int32Array(cellCount);
  let queueHead = 0;
  let queueTail = 0;

  // Seed the BFS with all thief cells at distance 0.
  for (let index = 0; index < cellCount; index++) {
    if (grid[(index / size) | 0][index % size] === 1) {
      distanceToThief[index] = 0;
      bfsQueue[queueTail++] = index;
    }
  }

  // Standard grid BFS using flat indices to avoid tuple allocations.
  while (queueHead < queueTail) {
    const current = bfsQueue[queueHead++];
    const row = (current / size) | 0;
    const column = current % size;
    const nextDistance = distanceToThief[current] + 1;

    if (row > 0 && distanceToThief[current - size] === -1) {
      distanceToThief[current - size] = nextDistance;
      bfsQueue[queueTail++] = current - size;
    }
    if (row < size - 1 && distanceToThief[current + size] === -1) {
      distanceToThief[current + size] = nextDistance;
      bfsQueue[queueTail++] = current + size;
    }
    if (column > 0 && distanceToThief[current - 1] === -1) {
      distanceToThief[current - 1] = nextDistance;
      bfsQueue[queueTail++] = current - 1;
    }
    if (column < size - 1 && distanceToThief[current + 1] === -1) {
      distanceToThief[current + 1] = nextDistance;
      bfsQueue[queueTail++] = current + 1;
    }
  }

  const targetCell = cellCount - 1;

  // Safeness is the path minimum, so it can never exceed either endpoint.
  const maxSafeness = Math.min(distanceToThief[0], distanceToThief[targetCell]);

  // Bucket cells by distance, clamping anything above maxSafeness into the top bucket.
  const bucketCount = new Int32Array(maxSafeness + 1);
  for (let index = 0; index < cellCount; index++) {
    const clamped = distanceToThief[index] > maxSafeness ? maxSafeness : distanceToThief[index];
    bucketCount[clamped]++;
  }

  // Prefix offsets so cells can be sorted into one flat array by distance.
  const bucketStart = new Int32Array(maxSafeness + 2);
  for (let distance = 1; distance <= maxSafeness + 1; distance++) {
    bucketStart[distance] = bucketStart[distance - 1] + bucketCount[distance - 1];
  }

  const orderedCells = new Int32Array(cellCount);
  const writeCursor = bucketStart.slice();
  for (let index = 0; index < cellCount; index++) {
    const clamped = distanceToThief[index] > maxSafeness ? maxSafeness : distanceToThief[index];
    orderedCells[writeCursor[clamped]++] = index;
  }

  // Union-Find over cells; connect from highest distance downward.
  const parent = new Int32Array(cellCount);
  for (let index = 0; index < cellCount; index++) {
    parent[index] = index;
  }
  const activated = new Uint8Array(cellCount);

  /**
   * Finds the representative of a cell with path compression.
   * @param node - The cell index to resolve.
   * @returns The root representative index.
   */
  function findRoot(node: number): number {
    let root = node;
    while (parent[root] !== root) {
      root = parent[root];
    }
    while (parent[node] !== root) {
      const next = parent[node];
      parent[node] = root;
      node = next;
    }
    return root;
  }

  // Activate cells from the largest safeness down until start and target connect.
  for (let threshold = maxSafeness; threshold >= 0; threshold--) {
    const from = bucketStart[threshold];
    const to = bucketStart[threshold + 1];

    for (let position = from; position < to; position++) {
      const cell = orderedCells[position];
      activated[cell] = 1;
      const row = (cell / size) | 0;
      const column = cell % size;

      // Union with already-activated neighbours only.
      if (row > 0 && activated[cell - size] === 1) {
        parent[findRoot(cell)] = findRoot(cell - size);
      }
      if (row < size - 1 && activated[cell + size] === 1) {
        parent[findRoot(cell)] = findRoot(cell + size);
      }
      if (column > 0 && activated[cell - 1] === 1) {
        parent[findRoot(cell)] = findRoot(cell - 1);
      }
      if (column < size - 1 && activated[cell + 1] === 1) {
        parent[findRoot(cell)] = findRoot(cell + 1);
      }
    }

    // Once endpoints share a root, this threshold is the answer.
    if (findRoot(0) === findRoot(targetCell)) {
      return threshold;
    }
  }

  return 0;
}
