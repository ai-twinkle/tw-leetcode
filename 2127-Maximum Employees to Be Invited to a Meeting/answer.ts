/**
 * Finds the maximum number of people that can be invited based on:
 * 1) The length of the largest cycle in the graph.
 * 2) The total length of chains attached to all 2-cycles (pairs who favor each other).
 *
 * @param favorite - An array where each index i represents a person, and favorite[i] is the person i "favors".
 * @returns The maximum between the largest cycle length and the total contributions from 2-cycles and their chains.
 */
function maximumInvitations(favorite: number[]): number {
  // 1) Find the longest cycle in the graph.
  const largestCycle = findLargestCycle(favorite);

  // 2) Calculate the sum of chain lengths for all mutual-favorite pairs (2-cycles).
  const totalChains = calculateChainsForMutualFavorites(favorite);

  // The final answer is the larger of these two values.
  return Math.max(largestCycle, totalChains);
}

/**
 * Finds the length of the largest cycle in the "favorite" graph.
 * A cycle means starting from some node, if you follow each person's 'favorite',
 * eventually you come back to the starting node.
 *
 * @param favorite - The array representing the directed graph: person -> favorite[person].
 * @returns The length of the largest cycle found in this graph.
 */
function findLargestCycle(favorite: number[]): number {
  const n = favorite.length;

  // This array will track which nodes have been visited.
  // Once visited, we don't need to start a cycle check from those nodes again.
  const visited: boolean[] = Array(n).fill(false);
  let maxCycleLength = 0; // Keep track of the longest cycle length found.

  // Iterate over each node to ensure we explore all potential cycles.
  for (let i = 0; i < n; ++i) {
    // If a node has already been visited, skip it because we have already explored its cycle.
    if (visited[i]) {
      continue;
    }

    // This list will store the path of the current exploration to detect where a cycle starts.
    const currentPath: number[] = [];
    let currentNode = i;

    // Move to the next node until you revisit a node (detect a cycle) or hit an already visited node.
    while (!visited[currentNode]) {
      // Mark the current node as visited and store it in the path.
      visited[currentNode] = true;
      currentPath.push(currentNode);

      // Jump to the node that 'currentNode' favors.
      currentNode = favorite[currentNode];
    }

    // currentNode is now a node we've seen before (end of the cycle detection).
    // We need to find where that node appeared in currentPath to determine the cycle length.
    for (let j = 0; j < currentPath.length; ++j) {
      if (currentPath[j] === currentNode) {
        // The cycle length is the distance from j to the end of currentPath.
        // Because from j back to the end is where the cycle loops.
        const cycleLength = currentPath.length - j;
        maxCycleLength = Math.max(maxCycleLength, cycleLength);
        break;
      }
    }
  }

  return maxCycleLength;
}

/**
 * This function focuses on pairs of people who are mutual favorites (2-cycles),
 * and calculates how many extra people can be attached in "chains" leading into these pairs.
 *
 * Explanation:
 * - A "2-cycle" means person A favors person B, and person B favors person A.
 * - A "chain" is a path of people leading into one node of the 2-cycle.
 *   For example, if X favors A, and Y favors X, and so on, eventually leading into A,
 *   that's a chain that ends at A.
 * - We'll use topological sorting here to find the longest chain length for each node.
 *   That helps us figure out how many people can be attached before we reach a 2-cycle.
 *
 * @param favorite - The array representing the graph: person -> favorite[person].
 * @returns The total "chain" contributions added by all 2-cycles combined.
 */
function calculateChainsForMutualFavorites(favorite: number[]): number {
  const n = favorite.length;

  // inDegree[i] will store how many people favor person i.
  // We'll use this to find "starting points" of chains (where inDegree is 0).
  const inDegree: number[] = Array(n).fill(0);

  // longestChain[i] represents the longest chain length ending at node i.
  // We start at 1 because each node itself counts as a chain of length 1 (just itself).
  const longestChain: number[] = Array(n).fill(1);

  // First, compute the in-degree for every node.
  for (const person of favorite) {
    inDegree[person] += 1;
  }

  // We will use a queue to perform a topological sort-like process.
  // Initially, any node that has no one favoring it (inDegree = 0) can be a "start" of a chain.
  const queue: number[] = [];
  for (let i = 0; i < n; ++i) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  // Process nodes in the queue:
  // Remove a node from the queue, then update its target's longest chain and reduce that target’s inDegree.
  // If the target’s inDegree becomes 0, it means we've resolved all paths leading into it, so we push it into the queue.
  while (queue.length > 0) {
    // Take a node with no unresolved incoming edges.
    const currentNode = queue.pop()!;
    // The node that currentNode directly favors.
    const nextNode = favorite[currentNode];

    // Update the longest chain for nextNode:
    // The best chain that can end in currentNode is longestChain[currentNode].
    // So if we extend currentNode's chain by 1, we might get a longer chain for nextNode.
    longestChain[nextNode] = Math.max(longestChain[nextNode], longestChain[currentNode] + 1);

    // Now we've accounted for this edge, so reduce the inDegree of nextNode by 1.
    inDegree[nextNode] -= 1;

    // If nextNode now has no more unresolved incoming edges, push it into the queue for processing.
    if (inDegree[nextNode] === 0) {
      queue.push(nextNode);
    }
  }

  let totalContribution = 0;
  // Now we look for 2-cycles: pairs (i, favorite[i]) where each favors the other.
  // In code, that means i === favorite[favorite[i]] (i points to someone who points back to i).
  // We add the chain lengths that lead into each side of the pair.
  for (let i = 0; i < n; ++i) {
    const j = favorite[i];

    // Check if (i, j) forms a mutual-favorites pair (2-cycle).
    // We add the condition i < j so that each pair is only counted once.
    if (j !== i && i === favorite[j] && i < j) {
      // We sum up the chain from i and the chain from j.
      // This represents the total number of unique people that can be included from both sides of the 2-cycle.
      totalContribution += longestChain[i] + longestChain[j];
    }
  }

  return totalContribution;
}
