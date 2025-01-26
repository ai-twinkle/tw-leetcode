/**
 * Finds the maximum number of people that can be invited to sit together at a round table.
 *
 * The solution considers:
 * 1) The length of the largest cycle in the graph.
 * 2) The combined length of chains attached to all mutual-favorite pairs (2-cycles).
 *
 * @param favorite - An array where each index `i` represents a person, and `favorite[i]` is the person they favor.
 * @returns The maximum number of people that can be invited.
 */
function maximumInvitations(favorite: number[]): number {
  const n = favorite.length;

  // Array to track the number of people favoring each person.
  const inDegree = Array(n).fill(0);

  // Compute the in-degree for each person.
  for (const person of favorite) {
    inDegree[person] += 1;
  }

  // Arrays for tracking visited nodes and chain depths.
  const visited = Array(n).fill(false);   // Whether a node has been visited.
  const longestChain = Array(n).fill(1);  // Longest chain depth ending at each node.

  // Queue to process nodes with no incoming edges (in-degree = 0).
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
      visited[i] = true; // Mark as visited during chain processing.
    }
  }

  // Perform topological sorting to compute chain depths.
  while (queue.length > 0) {
    const currentNode = queue.pop()!;
    const nextNode = favorite[currentNode];

    // Reduce the in-degree of the next node and update its chain depth.
    inDegree[nextNode]--;
    longestChain[nextNode] = Math.max(longestChain[nextNode], longestChain[currentNode] + 1);

    // If the next node has no more incoming edges, add it to the queue.
    if (inDegree[nextNode] === 0) {
      queue.push(nextNode);
      visited[nextNode] = true;
    }
  }

  let maxCycleLength = 0;      // Largest cycle length in the graph.
  let twoCycleChainLength = 0; // Total chain length contributed by all 2-cycles.

  // Iterate through all nodes to find cycles and calculate chain contributions.
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue; // Skip nodes already processed.

    let currentNode = i;
    let cycleLength = 0;

    // Traverse the cycle and mark nodes as visited.
    while (!visited[currentNode]) {
      visited[currentNode] = true;
      currentNode = favorite[currentNode];
      cycleLength++;
    }

    // If the cycle is larger than 2, update maxCycleLength.
    if (cycleLength > 2) {
      maxCycleLength = Math.max(maxCycleLength, cycleLength);
    }
    // If it's a 2-cycle, calculate the chain contributions.
    else if (cycleLength === 2) {
      const node1 = i;
      const node2 = favorite[i];
      twoCycleChainLength += longestChain[node1] + longestChain[node2];
    }
  }

  // Return the maximum between the largest cycle and the combined 2-cycle chain length.
  return Math.max(maxCycleLength, twoCycleChainLength);
}
