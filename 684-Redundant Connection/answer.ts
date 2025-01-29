function findRedundantConnection(edges: number[][]): number[] {
  /**
   * Helper function to find the representative (root) of a node in the union-finds structure.
   * Implements path compression to optimize future lookups.
   */
  const findRoot = (parent: number[], node: number): number => {
    if (parent[node] !== node) {
      // Path compression: Assign the parent of the current node to the root of the set
      parent[node] = findRoot(parent, parent[node]);
    }
    return parent[node];
  };

  /**
   * Helper function to merge two sets in the union-find structure.
   * It assigns the root of one node to the root of the other.
   */
  const unionSets = (parent: number[], node1: number, node2: number): void => {
    parent[findRoot(parent, node1)] = findRoot(parent, node2);
  };

  // Initialize the parent array where each node is its own parent initially
  const parent = new Array(edges.length + 1).fill(0).map((_, index) => index);

  // Iterate through each edge to check if it forms a cycle
  for (const [node1, node2] of edges) {
    // If both nodes share the same root, this edge forms a cycle and is redundant
    if (findRoot(parent, node1) === findRoot(parent, node2)) {
      return [node1, node2];
    }
    // Otherwise, merge the two sets
    unionSets(parent, node1, node2);
  }

  // No redundant edge found
  return [];
}
