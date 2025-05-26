function largestPathValue(colors: string, edges: number[][]): number {
  const numberOfNodes = colors.length;
  const numberOfEdges = edges.length;
  const LETTER_COUNT = 26;

  // 1. Map each node’s color character to an integer 0…25
  const nodeColorIndices = new Uint8Array(numberOfNodes);
  for (let i = 0; i < numberOfNodes; i++) {
    nodeColorIndices[i] = colors.charCodeAt(i) - 97;
  }

  // 2. Compute in-degree and out-degree for each node
  const inDegreeCounts = new Uint32Array(numberOfNodes);
  const outDegreeCounts = new Uint32Array(numberOfNodes);
  for (let i = 0; i < numberOfEdges; i++) {
    const [sourceNode, targetNode] = edges[i];
    inDegreeCounts[targetNode]++;
    outDegreeCounts[sourceNode]++;
  }

  // 3. Build CSR “head” array of length numberOfNodes+1
  const headIndices = new Uint32Array(numberOfNodes + 1);
  for (let i = 0; i < numberOfNodes; i++) {
    headIndices[i + 1] = headIndices[i] + outDegreeCounts[i];
  }

  // 4. Copy headIndices[0..n) so we can mutate it while filling adjacency
  const writePointers = headIndices.slice(0, numberOfNodes);
  const adjacencyList = new Uint32Array(numberOfEdges);
  for (let i = 0; i < numberOfEdges; i++) {
    const [sourceNode, targetNode] = edges[i];
    adjacencyList[writePointers[sourceNode]++] = targetNode;
  }

  // 5. Prepare DP table and topological-order queue
  //    dpColorCounts[nodeIndex * LETTER_COUNT + colorIndex] = max occurrences
  const dpColorCounts = new Uint32Array(numberOfNodes * LETTER_COUNT);
  const topologicalQueue = new Uint32Array(numberOfNodes);
  let queueHeadIndex = 0;
  let queueTailIndex = 0;
  let visitedNodeCount = 0;
  let maximumColorValue = 0;

  // 6. Initialize queue with all zero in-degree nodes
  for (let i = 0; i < numberOfNodes; i++) {
    if (inDegreeCounts[i] === 0) {
      topologicalQueue[queueTailIndex++] = i;
      const dpIndex = i * LETTER_COUNT + nodeColorIndices[i];
      dpColorCounts[dpIndex] = 1;
      maximumColorValue = 1;
    }
  }

  // Hoist locals for performance
  const colorDPArray = dpColorCounts;
  const headIndexArray = headIndices;
  const adjacencyArray = adjacencyList;
  const inDegreeArray = inDegreeCounts;
  const nodeColorArray = nodeColorIndices;
  const processQueue = topologicalQueue;

  // 7. Topological-BFS with DP propagation
  while (queueHeadIndex < queueTailIndex) {
    const currentNode = processQueue[queueHeadIndex++];
    visitedNodeCount++;
    const baseIndexU = currentNode * LETTER_COUNT;

    const startEdge = headIndexArray[currentNode];
    const endEdge = headIndexArray[currentNode + 1];
    for (let edgePointer = startEdge; edgePointer < endEdge; edgePointer++) {
      const neighborNode = adjacencyArray[edgePointer];
      const baseIndexV = neighborNode * LETTER_COUNT;
      const neighborColorIdx = nodeColorArray[neighborNode];

      // 7.1 Update DP for the neighbor's own color
      const incrementedCount = colorDPArray[baseIndexU + neighborColorIdx] + 1;
      if (incrementedCount > colorDPArray[baseIndexV + neighborColorIdx]) {
        colorDPArray[baseIndexV + neighborColorIdx] = incrementedCount;
        if (incrementedCount > maximumColorValue) {
          maximumColorValue = incrementedCount;
        }
      }

      // 7.2 Propagate all other colors
      for (let i = 0; i < neighborColorIdx; i++) {
        const propagatedValue = colorDPArray[baseIndexU + i];
        if (propagatedValue > colorDPArray[baseIndexV + i]) {
          colorDPArray[baseIndexV + i] = propagatedValue;
          if (propagatedValue > maximumColorValue) {
            maximumColorValue = propagatedValue;
          }
        }
      }
      for (let i = neighborColorIdx + 1; i < LETTER_COUNT; i++) {
        const propagatedValue = colorDPArray[baseIndexU + i];
        if (propagatedValue > colorDPArray[baseIndexV + i]) {
          colorDPArray[baseIndexV + i] = propagatedValue;
          if (propagatedValue > maximumColorValue) {
            maximumColorValue = propagatedValue;
          }
        }
      }

      // 7.3 Enqueue neighbor if all its incoming edges are processed
      if (--inDegreeArray[neighborNode] === 0) {
        processQueue[queueTailIndex++] = neighborNode;
      }
    }
  }

  // 8. Detect cycle: if not all nodes were visited, return -1
  return visitedNodeCount === numberOfNodes ? maximumColorValue : -1;
}
