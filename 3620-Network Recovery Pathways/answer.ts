function findMaxPathScore(edges: number[][], online: boolean[], k: number): number {
  const nodeCount = online.length;
  const edgeCount = edges.length;

  if (edgeCount === 0) {
    return -1;
  }

  // Flatten edges into typed arrays for cache-friendly, low-overhead access.
  const edgeFrom = new Int32Array(edgeCount);
  const edgeTo = new Int32Array(edgeCount);
  const edgeCost = new Float64Array(edgeCount);

  // Collect all costs as binary-search candidates for the answer.
  const distinctCosts = new Float64Array(edgeCount);

  for (let i = 0; i < edgeCount; i++) {
    const edge = edges[i];
    edgeFrom[i] = edge[0];
    edgeTo[i] = edge[1];
    edgeCost[i] = edge[2];
    distinctCosts[i] = edge[2];
  }

  // Sort candidate thresholds ascending, then deduplicate in place.
  distinctCosts.sort();
  let uniqueCount = 0;
  for (let i = 0; i < edgeCount; i++) {
    if (uniqueCount === 0 || distinctCosts[i] !== distinctCosts[uniqueCount - 1]) {
      distinctCosts[uniqueCount] = distinctCosts[i];
      uniqueCount++;
    }
  }

  // Prefix-count out-edges per node so adjacency can be stored in flat buckets.
  const outEdgeStart = new Int32Array(nodeCount + 1);
  for (let i = 0; i < edgeCount; i++) {
    outEdgeStart[edgeFrom[i] + 1]++;
  }
  for (let i = 0; i < nodeCount; i++) {
    outEdgeStart[i + 1] += outEdgeStart[i];
  }

  // Bucketed adjacency: adjacencyEdge[outEdgeStart[u] .. outEdgeStart[u+1]) lists edges from u.
  const adjacencyEdge = new Int32Array(edgeCount);
  const fillCursor = outEdgeStart.slice(0, nodeCount);
  const inDegree = new Int32Array(nodeCount);
  for (let i = 0; i < edgeCount; i++) {
    const from = edgeFrom[i];
    adjacencyEdge[fillCursor[from]++] = i;
    inDegree[edgeTo[i]]++;
  }

  // Kahn's algorithm to produce a topological ordering, reused by every feasibility check.
  const topoOrder = new Int32Array(nodeCount);
  const inDegreeWork = inDegree.slice();
  const queue = new Int32Array(nodeCount);
  let queueHead = 0;
  let queueTail = 0;
  for (let i = 0; i < nodeCount; i++) {
    if (inDegreeWork[i] === 0) {
      queue[queueTail++] = i;
    }
  }
  while (queueHead < queueTail) {
    const node = queue[queueHead++];
    topoOrder[queueHead - 1] = node;
    const edgeStart = outEdgeStart[node];
    const edgeEnd = outEdgeStart[node + 1];
    for (let e = edgeStart; e < edgeEnd; e++) {
      const to = edgeTo[adjacencyEdge[e]];
      if (--inDegreeWork[to] === 0) {
        queue[queueTail++] = to;
      }
    }
  }

  const targetNode = nodeCount - 1;
  const INFINITY_COST = Infinity;

  // Minimum total cost to reach each node using only edges with cost >= threshold.
  const minCostToReach = new Float64Array(nodeCount);

  /**
   * Checks whether a path from 0 to n-1 exists using only edges whose cost is at
   * least the threshold, with total cost not exceeding k and online intermediates.
   * @param threshold - Minimum allowed individual edge cost.
   * @returns True if such a valid path exists.
   */
  const isFeasible = (threshold: number): boolean => {
    for (let i = 0; i < nodeCount; i++) {
      minCostToReach[i] = INFINITY_COST;
    }
    minCostToReach[0] = 0;

    // Relax edges in topological order so predecessors settle before successors.
    for (let t = 0; t < nodeCount; t++) {
      const node = topoOrder[t];
      const currentCost = minCostToReach[node];
      if (currentCost === INFINITY_COST) {
        continue;
      }
      if (node === targetNode) {
        continue;
      }
      // Intermediate nodes (not source or target) must be online to be traversed onward.
      if (node !== 0 && !online[node]) {
        continue;
      }
      const edgeStart = outEdgeStart[node];
      const edgeEnd = outEdgeStart[node + 1];
      for (let e = edgeStart; e < edgeEnd; e++) {
        const edgeIndex = adjacencyEdge[e];
        if (edgeCost[edgeIndex] < threshold) {
          continue;
        }
        const to = edgeTo[edgeIndex];
        const candidate = currentCost + edgeCost[edgeIndex];
        if (candidate < minCostToReach[to]) {
          minCostToReach[to] = candidate;
        }
      }
    }
    return minCostToReach[targetNode] <= k;
  };

  // If even the loosest threshold has no valid path, none exists.
  if (!isFeasible(distinctCosts[0])) {
    return -1;
  }

  // Binary search for the largest threshold that still yields a feasible path.
  let low = 0;
  let high = uniqueCount - 1;
  let bestScore = distinctCosts[0];
  while (low <= high) {
    const midCandidateIndex = (low + high) >>> 1;
    if (isFeasible(distinctCosts[midCandidateIndex])) {
      bestScore = distinctCosts[midCandidateIndex];
      low = midCandidateIndex + 1;
    } else {
      high = midCandidateIndex - 1;
    }
  }

  return bestScore;
}
