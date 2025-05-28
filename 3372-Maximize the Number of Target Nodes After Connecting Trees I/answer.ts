function maxTargetNodes(edgesTree1: number[][], edgesTree2: number[][], maximumDistance: number): number[] {
  // Compute node count for each tree
  const numberOfNodesInTree1 = edgesTree1.length + 1;
  const numberOfNodesInTree2 = edgesTree2.length + 1;

  /**
   * Builds a compressed sparse row (CSR) adjacency representation.
   * @param {number[][]} edgeList - Edge list for the tree, each entry is [nodeA, nodeB].
   * @param {number} totalNodeCount - Number of nodes in the tree.
   * @returns {{ offsets: Uint16Array, neighbors: Uint16Array }} CSR offsets and neighbors arrays.
   */
  function buildCompressedSparseRow(
    edgeList: number[][],
    totalNodeCount: number
  ): { offsets: Uint16Array; neighbors: Uint16Array } {
    // Count the degree of each node
    const degreeOfNode = new Uint16Array(totalNodeCount);
    for (const [nodeA, nodeB] of edgeList) {
      degreeOfNode[nodeA]++;
      degreeOfNode[nodeB]++;
    }

    // Compute the offsets array for each node's neighbors
    const offsets = new Uint16Array(totalNodeCount + 1);
    for (let nodeIndex = 0; nodeIndex < totalNodeCount; nodeIndex++) {
      offsets[nodeIndex + 1] = offsets[nodeIndex] + degreeOfNode[nodeIndex];
    }

    // Fill the neighbors array using the offsets
    const neighbors = new Uint16Array(offsets[totalNodeCount]);
    const insertionPointers = offsets.subarray(0, totalNodeCount).slice();

    for (const [nodeA, nodeB] of edgeList) {
      neighbors[insertionPointers[nodeA]++] = nodeB;
      neighbors[insertionPointers[nodeB]++] = nodeA;
    }

    return { offsets, neighbors };
  }

  // Build CSR for both trees for efficient BFS
  const {
    offsets: csrOffsetsTree1,
    neighbors: csrNeighborsTree1
  } = buildCompressedSparseRow(edgesTree1, numberOfNodesInTree1);

  const {
    offsets: csrOffsetsTree2,
    neighbors: csrNeighborsTree2
  } = buildCompressedSparseRow(edgesTree2, numberOfNodesInTree2);

  /**
   * Computes reachable node counts for every start node within a distance limit.
   * Uses BFS with a visit-token trick to avoid array resets.
   * @param {Uint16Array} csrOffsets - CSR offsets array.
   * @param {Uint16Array} csrNeighbors - CSR neighbors array.
   * @param {number} totalNodeCount - Number of nodes in the tree.
   * @param {number} distanceLimit - Maximum distance to search from each start node.
   * @returns {Int32Array} Array of counts for each start node.
   */
  function computeReachableNodesArray(
    csrOffsets: Uint16Array,
    csrNeighbors: Uint16Array,
    totalNodeCount: number,
    distanceLimit: number
  ): Int32Array {
    const reachableCount = new Int32Array(totalNodeCount);
    if (distanceLimit < 0) {
      return reachableCount;
    }

    // Trick: Each BFS run uses a unique token to mark visited nodes
    const lastVisitedToken = new Uint32Array(totalNodeCount);
    const nodeDistance = new Int16Array(totalNodeCount);
    const bfsQueue = new Uint16Array(totalNodeCount);

    let globalIterationToken = 1;

    for (let startNode = 0; startNode < totalNodeCount; startNode++, globalIterationToken++) {
      let queueHead = 0;
      let queueTail = 0;

      // Initialize BFS with the start node
      lastVisitedToken[startNode] = globalIterationToken;
      nodeDistance[startNode] = 0;
      bfsQueue[queueTail++] = startNode;

      let nodesReached = 1; // Start node always counted

      // BFS loop
      while (queueHead < queueTail) {
        const currentNode = bfsQueue[queueHead++];
        const currentDistance = nodeDistance[currentNode];
        if (currentDistance === distanceLimit) {
          continue;
        }

        // Visit all unvisited neighbors within distance limit
        for (let ptr = csrOffsets[currentNode], end = csrOffsets[currentNode + 1]; ptr < end; ptr++) {
          const neighborNode = csrNeighbors[ptr];
          if (lastVisitedToken[neighborNode] !== globalIterationToken) {
            lastVisitedToken[neighborNode] = globalIterationToken;
            nodeDistance[neighborNode] = currentDistance + 1;
            bfsQueue[queueTail++] = neighborNode;
            nodesReached++;
          }
        }
      }

      reachableCount[startNode] = nodesReached;
    }

    return reachableCount;
  }

  /**
   * Finds the maximum reachable node count among all start nodes.
   * @param {Uint16Array} csrOffsets - CSR offsets array.
   * @param {Uint16Array} csrNeighbors - CSR neighbors array.
   * @param {number} totalNodeCount - Number of nodes in the tree.
   * @param {number} distanceLimit - Maximum distance to search.
   * @returns {number} Maximum count of reachable nodes from any start node.
   */
  function computeMaximumReachableNodes(
    csrOffsets: Uint16Array,
    csrNeighbors: Uint16Array,
    totalNodeCount: number,
    distanceLimit: number
  ): number {
    if (distanceLimit < 0) {
      return 0;
    }
    // Get all per-node counts
    const reachableArray = computeReachableNodesArray(
      csrOffsets, csrNeighbors, totalNodeCount, distanceLimit
    );
    // Find maximum
    let maximumReached = 0;
    for (let nodeIndex = 0; nodeIndex < totalNodeCount; nodeIndex++) {
      if (reachableArray[nodeIndex] > maximumReached) {
        maximumReached = reachableArray[nodeIndex];
      }
    }
    return maximumReached;
  }

  // Compute reachable counts for each node in tree 1
  const reachableCountPerNodeInTree1 = computeReachableNodesArray(
    csrOffsetsTree1,
    csrNeighborsTree1,
    numberOfNodesInTree1,
    maximumDistance
  );

  // Find the best possible addition from tree 2
  const bestReachableInTree2 = computeMaximumReachableNodes(
    csrOffsetsTree2,
    csrNeighborsTree2,
    numberOfNodesInTree2,
    maximumDistance - 1 // Only allow (k-1) in tree 2 due to bridge
  );

  // Combine both tree results for each node in tree 1
  const result = new Array<number>(numberOfNodesInTree1);
  for (let nodeIndex = 0; nodeIndex < numberOfNodesInTree1; nodeIndex++) {
    result[nodeIndex] = reachableCountPerNodeInTree1[nodeIndex] + bestReachableInTree2;
  }

  // Return the final answer array
  return result;
}
