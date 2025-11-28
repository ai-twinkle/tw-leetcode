function maxKDivisibleComponents(n: number, edges: number[][], values: number[], k: number): number {
  // Build adjacency list using compact typed arrays for cache-efficient traversal
  const adjacencyHead = new Int32Array(n);
  adjacencyHead.fill(-1);

  const totalEdges = (n - 1) * 2;
  const adjacencyNextEdgeIndex = new Int32Array(totalEdges);
  const adjacencyToNode = new Int32Array(totalEdges);

  let edgeWriteIndex = 0;
  for (let edgeArrayIndex = 0; edgeArrayIndex < edges.length; edgeArrayIndex++) {
    const nodeA = edges[edgeArrayIndex][0];
    const nodeB = edges[edgeArrayIndex][1];

    // Add edge nodeA -> nodeB
    adjacencyToNode[edgeWriteIndex] = nodeB;
    adjacencyNextEdgeIndex[edgeWriteIndex] = adjacencyHead[nodeA];
    adjacencyHead[nodeA] = edgeWriteIndex;
    edgeWriteIndex++;

    // Add edge nodeB -> nodeA
    adjacencyToNode[edgeWriteIndex] = nodeA;
    adjacencyNextEdgeIndex[edgeWriteIndex] = adjacencyHead[nodeB];
    adjacencyHead[nodeB] = edgeWriteIndex;
    edgeWriteIndex++;
  }

  // Precompute node values modulo k to avoid repeated modulo operations
  const valuesModulo = new Int32Array(n);
  for (let nodeIndex = 0; nodeIndex < n; nodeIndex++) {
    const nodeValue = values[nodeIndex];
    valuesModulo[nodeIndex] = nodeValue % k;
  }

  // Parent array to avoid revisiting the edge back to parent
  const parentNode = new Int32Array(n);
  parentNode.fill(-1);

  // Explicit stacks for iterative post-order DFS
  const nodeStack = new Int32Array(n);          // Node at each stack level
  const edgeIteratorStack = new Int32Array(n);  // Current adjacency edge index for each node
  const remainderStack = new Int32Array(n);     // Accumulated subtree remainder for each node

  // Sentinel value indicating that all children of the node have been processed
  const FINALIZE_SENTINEL = -2;

  let stackSize: number;

  // Initialize DFS from root node 0
  nodeStack[0] = 0;
  edgeIteratorStack[0] = adjacencyHead[0];
  remainderStack[0] = valuesModulo[0];
  parentNode[0] = -1;
  stackSize = 1;

  let componentCount = 0;

  // Single-pass iterative post-order DFS
  while (stackSize > 0) {
    const stackTopIndex = stackSize - 1;
    const currentNode = nodeStack[stackTopIndex];
    let currentEdgeIterator = edgeIteratorStack[stackTopIndex];

    // If marked with sentinel, all children are processed and we finalize this node
    if (currentEdgeIterator === FINALIZE_SENTINEL) {
      const currentRemainder = remainderStack[stackTopIndex];

      // If subtree sum is divisible by k, it forms a valid component
      if (currentRemainder === 0) {
        componentCount++;
      }

      // Pop current node from stack
      stackSize--;

      // Propagate remainder to parent if parent exists
      if (stackSize > 0) {
        const parentStackIndex = stackSize - 1;
        let parentRemainder = remainderStack[parentStackIndex] + currentRemainder;

        // Keep parent remainder within [0, k) range with minimal modulo calls
        if (parentRemainder >= k) {
          parentRemainder %= k;
        }

        remainderStack[parentStackIndex] = parentRemainder;
      }

      continue;
    }

    // Try to find an unvisited child to go deeper in DFS
    let hasUnvisitedChild = false;
    while (currentEdgeIterator !== -1) {
      const neighborNode = adjacencyToNode[currentEdgeIterator];
      currentEdgeIterator = adjacencyNextEdgeIndex[currentEdgeIterator];

      // Skip edge back to parent
      if (neighborNode === parentNode[currentNode]) {
        continue;
      }

      // Store next edge to continue from when we come back to this node
      edgeIteratorStack[stackTopIndex] = currentEdgeIterator;

      // Push child node onto stack for further traversal
      const childStackIndex = stackSize;
      nodeStack[childStackIndex] = neighborNode;
      parentNode[neighborNode] = currentNode;
      edgeIteratorStack[childStackIndex] = adjacencyHead[neighborNode];
      remainderStack[childStackIndex] = valuesModulo[neighborNode];
      stackSize++;

      hasUnvisitedChild = true;
      break;
    }

    // If no more children, mark node for finalization on the next iteration
    if (!hasUnvisitedChild) {
      edgeIteratorStack[stackTopIndex] = FINALIZE_SENTINEL;
    }
  }

  // componentCount now holds the maximum number of k-divisible components
  return componentCount;
}
