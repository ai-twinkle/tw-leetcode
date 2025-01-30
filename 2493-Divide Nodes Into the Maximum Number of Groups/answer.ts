function magnificentSets(n: number, edges: number[][]): number {
  /**
   * 1. Build an adjacency list for the undirected graph.
   *    We'll use 0-based indexing internally.
   */
  // Adjacency list for the undirected graph
  const adjacencyList: number[][] = Array.from({ length: n }, () => []);

  // Construct the adjacency list from the edges and convert to 0-based
  for (const [u, v] of edges) {
    // Convert 1-based input to 0-based
    const uIndex = u - 1;
    const vIndex = v - 1;
    adjacencyList[uIndex].push(vIndex);
    adjacencyList[vIndex].push(uIndex);
  }

  /**
   * 2. We'll keep track of which nodes have been visited
   *    in a global sense, to identify connected components.
   */
  const globalVisited: boolean[] = Array(n).fill(false);

  /**
   * 3. A BFS-based helper function that, given a node,
   *    determines the maximum valid layering (or levels)
   *    starting from that node, if valid.
   *
   *    - We use 'distance[node]' to store the BFS depth.
   *    - If we ever find an edge that connects nodes whose
   *      depths differ by something other than 1, we return -1.
   *    - Otherwise, the largest distance + 1 is the layer count.
   *
   * @param startNode The node to start the BFS from
   * @returns The maximum number of groups for this node, or -1 if invalid
   */
  function getMaxLayerCount(startNode: number): number {
    const distance: number[] = Array(n).fill(-1);
    distance[startNode] = 0;

    const queue: number[] = [startNode];

    // At least one layer (the start node itself)
    let maxLayer = 1;

    // Iterate over the queue to explore the nodes
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distance[current];

      // Explore all neighbors of the current node
      for (const neighbor of adjacencyList[current]) {
        // If this neighbor hasn't been visited in this BFS
        if (distance[neighbor] === -1) {
          distance[neighbor] = currentDist + 1;
          maxLayer = Math.max(maxLayer, distance[neighbor] + 1);
          queue.push(neighbor);
          continue;
        }

        // If the neighbor is visited, check the distance difference
        // For the grouping condition, |dist[u] - dist[v]| must be exactly 1
        if (Math.abs(distance[neighbor] - currentDist) !== 1) {
          return -1; // Invalid layering for this root
        }
      }
    }

    return maxLayer;
  }

  /**
   * 4. A function to explore (via BFS) all nodes in a single
   *    connected component starting from 'startNode'.
   *
   *    While exploring, it also checks for bipartite conflicts:
   *    - We use 'dist[node]' as a color or BFS-layer marker.
   *    - If two adjacent nodes have the same dist[], there's a conflict.
   *    - If a conflict is found, return -1 immediately.
   *
   *    Once the component is gathered, we try BFS from each
   *    node in the component to find the best (max) layering.
   *
   * @param startNode The node to start the component exploration from
   * @returns The maximum number of groups for this component, or -1 if invalid
   */
  function exploreComponent(startNode: number): number {
    // BFS to gather all nodes in the component and check bipartite constraints
    const queue: number[] = [startNode];
    const distance: number[] = Array(n).fill(-1);
    distance[startNode] = 0;
    globalVisited[startNode] = true;

    const componentNodes: number[] = [startNode];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distance[current];

      for (const neighbor of adjacencyList[current]) {
        if (distance[neighbor] === -1) {
          // Not yet visited in this component BFS
          distance[neighbor] = currentDist + 1;
          queue.push(neighbor);
          componentNodes.push(neighbor);
          globalVisited[neighbor] = true;
          continue;
        }

        // If the neighbor has the same BFS distance => bipartite conflict
        // (same level => they'd be the same color)
        if (distance[neighbor] === currentDist) {
          return -1; // Not bipartite => fail
        }

      }
    }

    // Now, for the nodes in this component, find the maximum valid layering.
    let maxGroups = 1;
    for (const node of componentNodes) {
      const layerCount = getMaxLayerCount(node);
      if (layerCount === -1) {
        return -1; // The layering from 'node' wasn't valid
      }
      maxGroups = Math.max(maxGroups, layerCount);
    }

    return maxGroups;
  }

  /**
   * 5. Main loop over all nodes to process each connected component exactly once
   */
  let totalMaxGroups = 0;

  for (let i = 0; i < n; i++) {
    // Skip nodes that have been visited in previous components
    if (globalVisited[i]) {
      continue;
    }

    const resultForComponent = exploreComponent(i);

    // If the component was invalid, the entire graph is invalid
    if (resultForComponent === -1) {
      return -1;
    }

    // Otherwise, add the result to the total
    totalMaxGroups += resultForComponent;
  }

  return totalMaxGroups;
}
