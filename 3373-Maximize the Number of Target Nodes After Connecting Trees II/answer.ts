function maxTargetNodes(edges1: number[][], edges2: number[][]): number[] {
  // 1. Calculate the number of nodes in both trees.
  const numberOfNodesTreeOne = edges1.length + 1;
  const numberOfNodesTreeTwo = edges2.length + 1;

  // 2. Prepare a queue for BFS traversal, large enough for both trees.
  const maxNodes = numberOfNodesTreeOne > numberOfNodesTreeTwo
    ? numberOfNodesTreeOne
    : numberOfNodesTreeTwo;
  const bfsQueue = new Int32Array(maxNodes);

  /**
   * 3. Helper function to build a Compressed Sparse Row (CSR) and compute parity counts
   * @param {number[][]} edgeList - List of edges in the form [u, v]
   * @param {number} numberOfNodes - Total number of nodes in the tree
   * @return {{ parity: Int8Array, evenCount: number, oddCount: number }} The parity array and counts of even and odd depth nodes
   */
  function computeParityCounts(
    edgeList: number[][],
    numberOfNodes: number
  ): { parity: Int8Array; evenCount: number; oddCount: number } {
    // Build adjacency list (CSR structure)
    const adjacencyHead = new Int32Array(numberOfNodes).fill(-1);
    const adjacencyTo = new Int32Array(edgeList.length * 2);
    const adjacencyNext = new Int32Array(edgeList.length * 2);

    let edgePointer = 0;
    for (let i = 0; i < edgeList.length; i++) {
      const u = edgeList[i][0];
      const v = edgeList[i][1];

      // Add v to u's adjacency list
      adjacencyTo[edgePointer] = v;
      adjacencyNext[edgePointer] = adjacencyHead[u];
      adjacencyHead[u] = edgePointer++;

      // Add u to v's adjacency list (undirected)
      adjacencyTo[edgePointer] = u;
      adjacencyNext[edgePointer] = adjacencyHead[v];
      adjacencyHead[v] = edgePointer++;
    }

    // BFS to compute each node's depth parity (even/odd)
    const depthParity = new Int8Array(numberOfNodes).fill(-1); // -1: unvisited, 0: even, 1: odd
    let queueStart = 0;
    let queueEnd = 0;
    depthParity[0] = 0; // Root node parity is even (0)
    bfsQueue[queueEnd++] = 0;

    let evenDepthCount = 1; // Root is at even depth
    let oddDepthCount = 0;

    while (queueStart < queueEnd) {
      const current = bfsQueue[queueStart++]; // Dequeue
      // Visit all neighbors
      for (let adjIndex = adjacencyHead[current]; adjIndex !== -1; adjIndex = adjacencyNext[adjIndex]) {
        const neighbor = adjacencyTo[adjIndex];

        if (depthParity[neighbor] !== -1) {
          continue; // Already visited
        }

        // Set neighbor parity (flip from parent)
        const newParity = depthParity[current] ^ 1;
        depthParity[neighbor] = newParity;

        // Count parity type
        if (newParity === 0) {
          evenDepthCount++;
        } else {
          oddDepthCount++;
        }

        // Enqueue neighbor
        bfsQueue[queueEnd++] = neighbor;
      }
    }

    // Return parities and counts for this tree
    return {
      parity: depthParity,
      evenCount: evenDepthCount,
      oddCount: oddDepthCount,
    };
  }

  // 4. Compute parity and even/odd counts for Tree 1 (main tree) and Tree 2 (secondary tree).
  const {
    parity: parityTreeOne,
    evenCount: evenTreeOne,
    oddCount: oddTreeOne,
  } = computeParityCounts(edges1, numberOfNodesTreeOne);

  const {
    evenCount: evenTreeTwo,
    oddCount: oddTreeTwo,
  } = computeParityCounts(edges2, numberOfNodesTreeTwo);

  // 5. Crossing from Tree 1 to Tree 2 always flips parity.
  //    Pick the larger group in Tree 2 as the "odd distance" side for maximizing.
  const bestOddDistanceCountInTreeTwo = evenTreeTwo > oddTreeTwo
    ? evenTreeTwo
    : oddTreeTwo;

  // 6. For each node in Tree 1, calculate answer using its parity:
  //    - If even parity, take all even nodes from Tree 1 (including self)
  //    - If odd parity, take all odd nodes from Tree 1
  //    - Add the best count from Tree 2 as explained above
  const result = new Array<number>(numberOfNodesTreeOne);
  const differenceEvenOddTreeOne = evenTreeOne - oddTreeOne;
  for (let node = 0; node < numberOfNodesTreeOne; node++) {
    // Branch-free: subtract if odd, do nothing if even
    result[node] = evenTreeOne - parityTreeOne[node] * differenceEvenOddTreeOne + bestOddDistanceCountInTreeTwo;
  }

  // 7. Return the final answer array
  return result;
}
