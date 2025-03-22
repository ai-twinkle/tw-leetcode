function countCompleteComponents(n: number, edges: number[][]): number {
  // Initialize each node as its own parent and set initial component size to 1.
  const parents = new Array(n).fill(0).map((_, i) => i);
  const size = new Array(n).fill(1);
  const edgeCount = new Array(n).fill(0);

  const getCompleteEdgeCount = (n: number) => (n * (n - 1)) / 2;

  // Iterative find with path halving.
  const find = (node: number): number => {
    while (node !== parents[node]) {
      parents[node] = parents[parents[node]]; // Path halving for efficiency.
      node = parents[node];
    }
    return node;
  };

  // Union by size: merge smaller component into larger.
  const union = (a: number, b: number): void => {
    const rootA = find(a);
    const rootB = find(b);

    // If both nodes are already in the same component, just increment the edge count.
    if (rootA === rootB) {
      edgeCount[rootA]++;
      return;
    }

    // Merge smaller component into the larger one.
    if (size[rootA] < size[rootB]) {
      parents[rootA] = rootB;
      size[rootB] += size[rootA];
      // Add edges from both components and the new edge connecting them.
      edgeCount[rootB] += edgeCount[rootA] + 1;
    } else {
      parents[rootB] = rootA;
      size[rootA] += size[rootB];
      edgeCount[rootA] += edgeCount[rootB] + 1;
    }
  };

  // Process each edge.
  for (const [u, v] of edges) {
    union(u, v);
  }

  let completeComponents = 0;
  // Check each component (only those nodes that are roots) for completeness.
  for (let i = 0; i < n; i++) {
    if (parents[i] === i) { // i is a root.
      if (edgeCount[i] === getCompleteEdgeCount(size[i])) {
        completeComponents++;
      }
    }
  }

  return completeComponents;
}
