/** Modulo applied to every answer. */
const ODD_PATH_MODULO = 1_000_000_007;

/**
 * For each query, counts the edge-weight assignments (each edge weighted 1 or 2)
 * that make the path cost between the two queried nodes odd.
 *
 * A path with k edges has exactly 2^(k-1) odd-cost assignments, so each query
 * reduces to a power of two of its path length, obtained from depths and the LCA.
 *
 * @param edges - The n-1 undirected tree edges, nodes labelled 1..n.
 * @param queries - Node pairs whose connecting path is evaluated.
 * @returns The number of valid assignments per query, each modulo 1e9+7.
 */
function assignEdgeWeights(edges: number[][], queries: number[][]): number[] {
  const nodeCount = edges.length + 1;
  const edgeCount = edges.length;
  const queryCount = queries.length;

  // Smallest level count whose power of two reaches every possible depth difference
  let maxLevel = 1;
  while ((1 << maxLevel) < nodeCount) {
    maxLevel++;
  }

  // Count degrees, shifted by one, to prepare CSR offsets
  const neighborStart = new Int32Array(nodeCount + 2);
  for (let i = 0; i < edgeCount; i++) {
    neighborStart[edges[i][0] + 1]++;
    neighborStart[edges[i][1] + 1]++;
  }
  // Prefix sum turns the degree counts into per-node start offsets
  for (let node = 1; node <= nodeCount; node++) {
    neighborStart[node + 1] += neighborStart[node];
  }

  // Fill the flattened neighbor list using a movable cursor per node
  const neighbors = new Int32Array(2 * edgeCount);
  const fillCursor = neighborStart.slice(0, nodeCount + 1);
  for (let i = 0; i < edgeCount; i++) {
    const firstNode = edges[i][0];
    const secondNode = edges[i][1];
    neighbors[fillCursor[firstNode]++] = secondNode;
    neighbors[fillCursor[secondNode]++] = firstNode;
  }

  const stride = nodeCount + 1;
  const depth = new Int32Array(nodeCount + 1);
  // ancestorTable[level * stride + node] is the 2^level-th ancestor; 0 is the sentinel
  const ancestorTable = new Int32Array(maxLevel * stride);

  // Iterative BFS from the root sets depth and the direct parent (level 0)
  const bfsQueue = new Int32Array(nodeCount);
  const visited = new Uint8Array(nodeCount + 1);
  let queueHead = 0;
  let queueTail = 0;
  bfsQueue[queueTail++] = 1;
  visited[1] = 1;
  while (queueHead < queueTail) {
    const current = bfsQueue[queueHead++];
    const rangeEnd = neighborStart[current + 1];
    for (let i = neighborStart[current]; i < rangeEnd; i++) {
      const next = neighbors[i];
      if (visited[next] === 0) {
        visited[next] = 1;
        depth[next] = depth[current] + 1;
        ancestorTable[next] = current;
        bfsQueue[queueTail++] = next;
      }
    }
  }

  // Binary lifting: each ancestor of level L is the level-(L-1) ancestor of that ancestor
  for (let level = 1; level < maxLevel; level++) {
    const currentBase = level * stride;
    const previousBase = (level - 1) * stride;
    for (let node = 1; node <= nodeCount; node++) {
      const midAncestor = ancestorTable[previousBase + node];
      ancestorTable[currentBase + node] = ancestorTable[previousBase + midAncestor];
    }
  }

  // Precompute powers of two so every query is an O(1) table lookup
  const powerOfTwo = new Int32Array(nodeCount);
  powerOfTwo[0] = 1;
  for (let i = 1; i < nodeCount; i++) {
    powerOfTwo[i] = (powerOfTwo[i - 1] * 2) % ODD_PATH_MODULO;
  }

  const result: number[] = new Array(queryCount);
  for (let q = 0; q < queryCount; q++) {
    const nodeU = queries[q][0];
    const nodeV = queries[q][1];
    const depthU = depth[nodeU];
    const depthV = depth[nodeV];

    // Keep the deeper node in 'lower' so it can climb up to the other's depth
    let lower = nodeU;
    let higher = nodeV;
    if (depthU < depthV) {
      lower = nodeV;
      higher = nodeU;
    }

    // Lift the deeper node up by the exact depth gap, one bit at a time
    let difference = depth[lower] - depth[higher];
    for (let level = 0; level < maxLevel; level++) {
      if (((difference >> level) & 1) === 1) {
        lower = ancestorTable[level * stride + lower];
      }
    }

    let lowestCommonAncestor = lower;
    if (lower !== higher) {
      // Climb both nodes together while their ancestors differ
      for (let level = maxLevel - 1; level >= 0; level--) {
        const lowerAncestor = ancestorTable[level * stride + lower];
        const higherAncestor = ancestorTable[level * stride + higher];
        if (lowerAncestor !== higherAncestor) {
          lower = lowerAncestor;
          higher = higherAncestor;
        }
      }
      // Parents now coincide at the LCA
      lowestCommonAncestor = ancestorTable[lower];
    }

    const distance = depthU + depthV - 2 * depth[lowestCommonAncestor];
    if (distance === 0) {
      result[q] = 0;
    } else {
      result[q] = powerOfTwo[distance - 1];
    }
  }

  return result;
}
