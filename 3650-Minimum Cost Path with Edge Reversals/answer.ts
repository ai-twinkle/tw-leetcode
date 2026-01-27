function minCost(n: number, edges: number[][]): number {
  // Graph size and transformed arc capacity.
  const edgeCount = edges.length;
  const arcCapacity = edgeCount * 2;

  // Compressed adjacency list using typed arrays for fast traversal and low overhead.
  const adjacencyHead = new Int32Array(n);
  adjacencyHead.fill(-1);
  const adjacencyTo = new Int32Array(arcCapacity);
  const adjacencyWeight = new Int32Array(arcCapacity);
  const adjacencyNext = new Int32Array(arcCapacity);
  let arcIndex = 0;

  /**
   * Add one directed arc into the adjacency structure.
   *
   * @param fromNode - Source node
   * @param toNode - Destination node
   * @param weight - Arc cost
   */
  function addArc(fromNode: number, toNode: number, weight: number): void {
    adjacencyTo[arcIndex] = toNode;
    adjacencyWeight[arcIndex] = weight;
    adjacencyNext[arcIndex] = adjacencyHead[fromNode];
    adjacencyHead[fromNode] = arcIndex;
    arcIndex++;
  }

  // Iterate over all input edges to build the transformed graph.
  for (let index = 0; index < edgeCount; index++) {
    const edge = edges[index];
    const fromNode = edge[0];
    const toNode = edge[1];
    const weight = edge[2];

    // Add the original directed edge.
    addArc(fromNode, toNode, weight);

    // Add the reversible edge representing a single-use switch with doubled cost.
    addArc(toNode, fromNode, weight + weight);
  }

  // Initialize the Dijkstra distance table with infinity.
  const infinityDistance = 1e30;
  const distance = new Float64Array(n);
  distance.fill(infinityDistance);
  distance[0] = 0;

  // Binary min-heap for Dijkstra; stale entries are allowed and filtered later.
  const heapNodes = new Int32Array(arcCapacity + 8);
  const heapKeys = new Float64Array(arcCapacity + 8);
  let heapSize = 0;

  /**
   * Push a (node, key) pair into the min-heap.
   *
   * @param node - Graph node id
   * @param key - Current tentative distance
   */
  function heapPush(node: number, key: number): void {
    heapSize++;
    let position = heapSize;

    // Bubble up to restore heap order after insertion.
    while (position > 1) {
      const parentPosition = position >> 1;
      if (heapKeys[parentPosition] <= key) {
        break;
      }
      heapNodes[position] = heapNodes[parentPosition];
      heapKeys[position] = heapKeys[parentPosition];
      position = parentPosition;
    }

    heapNodes[position] = node;
    heapKeys[position] = key;
  }

  /**
   * Pop the node with the smallest key from the heap.
   *
   * @return The node id with the minimal key
   */
  function heapPopNode(): number {
    const rootNode = heapNodes[1];
    const lastNode = heapNodes[heapSize];
    const lastKey = heapKeys[heapSize];
    heapSize--;

    // If the heap becomes empty, return the only element directly.
    if (heapSize === 0) {
      return rootNode;
    }

    let position = 1;

    // Bubble down the last element to restore heap order.
    while (true) {
      let childPosition = position << 1;
      if (childPosition > heapSize) {
        break;
      }
      if (childPosition + 1 <= heapSize && heapKeys[childPosition + 1] < heapKeys[childPosition]) {
        childPosition++;
      }
      if (heapKeys[childPosition] >= lastKey) {
        break;
      }
      heapNodes[position] = heapNodes[childPosition];
      heapKeys[position] = heapKeys[childPosition];
      position = childPosition;
    }

    heapNodes[position] = lastNode;
    heapKeys[position] = lastKey;
    return rootNode;
  }

  /**
   * Read the smallest key currently in the heap.
   *
   * @return The minimum key at the heap root
   */
  function heapPeekKey(): number {
    return heapKeys[1];
  }

  // Insert the source node into the heap to start Dijkstra.
  heapPush(0, 0);

  // Cache the target node index for fast comparison.
  const targetNode = n - 1;

  // Continue Dijkstra until all reachable nodes are processed or the target is found.
  while (heapSize > 0) {
    const currentKey = heapPeekKey();
    const currentNode = heapPopNode();

    // Ignore stale heap entries that no longer match the shortest known distance.
    if (currentKey !== distance[currentNode]) {
      continue;
    }

    // Stop immediately once the shortest path to the target is finalized.
    if (currentNode === targetNode) {
      return currentKey;
    }

    // Traverse all outgoing arcs from the current node.
    for (let arc = adjacencyHead[currentNode]; arc !== -1; arc = adjacencyNext[arc]) {
      const neighborNode = adjacencyTo[arc];
      const newDistance = currentKey + adjacencyWeight[arc];

      // Relax the edge if a shorter path to the neighbor is found.
      if (newDistance < distance[neighborNode]) {
        distance[neighborNode] = newDistance;
        heapPush(neighborNode, newDistance);
      }
    }
  }

  // Return -1 when the target node is unreachable.
  return -1;
}
