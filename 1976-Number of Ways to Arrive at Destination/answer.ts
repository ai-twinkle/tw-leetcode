function countPaths(n: number, roads: number[][]): number {
  if (n === 1) {
    return 1; // Only one node, so one path.
  }
  const MOD = 1000000007;

  // Build the graph where each node stores its neighbors and corresponding travel times.
  const graph: { edges: number[]; weights: number[] }[] = Array.from({ length: n }, () => ({
    edges: [],
    weights: [],
  }));
  for (const [u, v, w] of roads) {
    graph[u].edges.push(v);
    graph[u].weights.push(w);
    graph[v].edges.push(u);
    graph[v].weights.push(w);
  }

  // Initialize arrays for distances and the count of shortest paths.
  const dist = new Array(n).fill(Infinity);
  dist[0] = 0; // Start node has distance 0.
  const ways = new Array(n).fill(0);
  ways[0] = 1; // Only one way to reach the start node.

  // Use wave relaxation: up to n waves are executed.
  for (let wave = 0; wave < n; wave++) {
    let updated = false; // Flag to check if any update happened in this wave.

    // Process all nodes except the destination to propagate their current active path counts.
    for (let node = 0; node < n - 1; node++) {
      // Skip nodes that are not active in this wave (i.e., no new ways to propagate).
      if (ways[node] <= 0) {
        continue;
      }

      // For each neighbor of the current node...
      const { edges, weights } = graph[node];
      for (let k = 0; k < edges.length; k++) {
        const neighbor = edges[k];
        const newDist = dist[node] + weights[k]; // Calculate potential new distance.

        if (newDist < dist[neighbor]) {
          // Found a shorter path: update distance and reset path count.
          dist[neighbor] = newDist;
          ways[neighbor] = ways[node];
          updated = true;
        } else if (newDist === dist[neighbor]) {
          // Found an alternative path with the same distance: accumulate the count.
          ways[neighbor] = (ways[neighbor] + ways[node]) % MOD;
          updated = true;
        }
      }
      // Mark the current node as processed in this wave.
      ways[node] = 0;
    }

    // If no updates occurred in the entire wave, the distances and path counts won't change further.
    if (!updated) {
      break;
    }
  }

  // The count of shortest paths to the destination node is returned.
  return ways[n - 1] % MOD;
}
