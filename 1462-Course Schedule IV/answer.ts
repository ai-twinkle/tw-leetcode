function checkIfPrerequisite(
  numCourses: number,
  prerequisites: number[][],
  queries: number[][]
): boolean[] {
  // Initialize the graph
  const graph: number[][] = Array.from({ length: numCourses }, () => []);

  // Construct the graph with the prerequisite dependencies
  for (const [u, v] of prerequisites) {
    graph[u].push(v);
  }

  // Define the reachable set of each node
  const reachable = Array.from({ length: numCourses }, () => new Set<number>());

  // Use DFS to calculate the reachable set of each node
  const dfs = (node: number) => {
    for (const neighbor of graph[node]) {
      // Skip if the neighbor is already reachable
      if (reachable[node].has(neighbor)) {
        continue;
      }

      // Add the neighbor to the reachable set
      reachable[node].add(neighbor);

      // Recursively call the DFS
      dfs(neighbor);

      // Add the reachable set of the neighbor to the reachable set of the node
      for (const n of reachable[neighbor]) {
        reachable[node].add(n);
      }
    }
  };

  // Find the reachable set of each node
  for (let i = 0; i < numCourses; i++) {
    dfs(i);
  }

  // Return the result
  return queries.map(([u, v]) => reachable[u].has(v));
}
