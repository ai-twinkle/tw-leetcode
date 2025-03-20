/**
 * Computes the minimum cost for each query using a recursive DSU merge function.
 *
 * @param n - Number of nodes.
 * @param edges - List of edges, each as [u, v, w].
 * @param query - List of queries, each as [s, t].
 * @returns Array containing the result for each query.
 */
function minimumCost(n: number, edges: number[][], query: number[][]): number[] {
  // Local DSU parent and cost arrays.
  const parent: number[] = [];
  const costs: number[] = [];

  // Recursive merge function for DSU "find" with path compression.
  const merge = (v: number): number => {
    if (parent[v] !== v) {
      parent[v] = merge(parent[v]);
    }
    return parent[v];
  };

  // Initialize DSU: each node is its own parent and has the initial cost.
  for (let i = 0; i < n; i++) {
    parent[i] = i;
    costs[i] = 131071; // 131071 = (1 << 17) - 1, i.e., lower 17 bits are set.
  }

  // Process each edge: merge DSU sets and update costs using bitwise AND.
  for (const [u, v, w] of edges) {
    const p1 = merge(u);
    const p2 = merge(v);
    // Merge the two sets by linking p1 to p2.
    parent[p1] = p2;
    // Update the cumulative cost for the merged component.
    costs[p1] = costs[p2] = costs[p1] & costs[p2] & w;
  }

  // Flatten the DSU structure to ensure every node points directly to its set representative.
  for (let i = 0; i < n; i++) {
    parent[i] = merge(i);
  }

  // Process the queries.
  const result: number[] = [];
  for (const [s, t] of query) {
    if (s === t) {
      result.push(0);
    } else if (parent[s] === parent[t]) {
      result.push(costs[parent[s]]);
    } else {
      result.push(-1);
    }
  }
  return result;
}
