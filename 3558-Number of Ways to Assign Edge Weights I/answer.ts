// Modulo required by the problem statement
const ASSIGN_EDGE_MODULO = 1_000_000_007;

// Upper bound for path length: at most n - 1 with n <= 10^5
const ASSIGN_EDGE_MAX_EXPONENT = 100_000;

// Precompute 2^k mod ASSIGN_EDGE_MODULO once, outside the function, for O(1) lookups
const assignEdgePowersOfTwo = new Int32Array(ASSIGN_EDGE_MAX_EXPONENT + 1);
assignEdgePowersOfTwo[0] = 1;
for (let exponent = 1; exponent <= ASSIGN_EDGE_MAX_EXPONENT; exponent++) {
  assignEdgePowersOfTwo[exponent] = (assignEdgePowersOfTwo[exponent - 1] * 2) % ASSIGN_EDGE_MODULO;
}

/**
 * Counts the edge-weight assignments (each edge is 1 or 2) along the
 * root-to-deepest-node path whose total cost is odd.
 *
 * Only the path length k (the maximum depth in edges) matters. An odd total
 * needs an odd number of weight-1 edges, and the count of such subsets of k
 * edges is exactly 2^(k - 1).
 *
 * @param edges - The n - 1 undirected edges of the tree rooted at node 1.
 * @returns The number of valid assignments modulo 10^9 + 7.
 */
function assignEdgeWeights(edges: number[][]): number {
  const numberOfNodes = edges.length + 1;

  // Count the degree of every node to size the compressed adjacency layout
  const degree = new Int32Array(numberOfNodes + 1);
  for (let index = 0; index < edges.length; index++) {
    const edge = edges[index];
    degree[edge[0]]++;
    degree[edge[1]]++;
  }

  // Build CSR start offsets so each node's neighbors occupy a contiguous slice
  const start = new Int32Array(numberOfNodes + 2);
  for (let node = 1; node <= numberOfNodes; node++) {
    start[node + 1] = start[node] + degree[node];
  }

  // Fill the flat neighbor array using a per-node write cursor
  const adjacency = new Int32Array(2 * edges.length);
  const cursor = start.slice();
  for (let index = 0; index < edges.length; index++) {
    const edge = edges[index];
    const firstNode = edge[0];
    const secondNode = edge[1];
    adjacency[cursor[firstNode]++] = secondNode;
    adjacency[cursor[secondNode]++] = firstNode;
  }

  // Breadth-first search from the root to find the maximum depth in edges
  const depth = new Int32Array(numberOfNodes + 1).fill(-1);
  const queue = new Int32Array(numberOfNodes);
  let head = 0;
  let tail = 0;
  depth[1] = 0;
  queue[tail++] = 1;
  let maximumDepth = 0;

  while (head < tail) {
    const current = queue[head++];
    const currentDepth = depth[current];

    // Track the deepest level reached so far
    if (currentDepth > maximumDepth) {
      maximumDepth = currentDepth;
    }

    const sliceEnd = start[current + 1];
    for (let edgeIndex = start[current]; edgeIndex < sliceEnd; edgeIndex++) {
      const neighbor = adjacency[edgeIndex];

      // Visit each neighbor exactly once (unvisited nodes still hold depth -1)
      if (depth[neighbor] === -1) {
        depth[neighbor] = currentDepth + 1;
        queue[tail++] = neighbor;
      }
    }
  }

  // A path of k edges has 2^(k - 1) assignments with an odd total cost
  return assignEdgePowersOfTwo[maximumDepth - 1];
}
