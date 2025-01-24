function eventualSafeNodes(graph: number[][]): number[] {
  const n = graph.length;

  // 0: unvisited, 1: visiting, 2: safe
  const visited = new Array(n).fill(0);

  function dfs(node: number): boolean {
    // If the node is visited, return the safety of the node
    if (visited[node] > 0) {
      return visited[node] === 2;
    }

    // Mark the node as visiting
    visited[node] = 1;

    // Check the safety of the next nodes
    // Note: While the array is empty, the for loop will not run
    for (const next of graph[node]) {
      // If the next node is not safe, then the current node is not safe
      if (!dfs(next)) {
        return false;
      }
    }

    // Mark the node as safe
    visited[node] = 2;
    return true;
  }


  // Now traverse all the nodes and check if they are safe
  const result: number[] = [];

  for (let i = 0; i < n; i++) {
    // If the node is safe, then add it to the result
    if (dfs(i)) {
      result.push(i);
    }
  }

  return result;
}
