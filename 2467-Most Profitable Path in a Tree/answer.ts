function mostProfitablePath(edges: number[][], bob: number, amount: number[]): number {
  const n = amount.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  // Use n as the initial “infinite” distance.
  const bobDist: number[] = new Array(n).fill(n);

  // Build the undirected tree.
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  /**
   * Single DFS that computes both Bob's arrival time (stored in bobDist) and
   * the maximum profit Alice can achieve from the current node.
   * @param node {number} - current node
   * @param parent {number} - parent node
   * @param depth {number} - depth of the current node
   */
  function dfs(node: number, parent: number, depth: number): number {
    // If this node is Bob's starting point, set its distance to 0.
    if (node === bob) {
      bobDist[node] = 0;
    }

    let bestChildProfit = -Infinity;
    let profitHere = 0;

    // Visit children.
    for (let child of adj[node]) {
      if (child === parent) continue;
      const childProfit = dfs(child, node, depth + 1);
      bestChildProfit = childProfit > bestChildProfit ? childProfit : bestChildProfit;
      // Update Bob's distance for the current node.
      bobDist[node] = Math.min(bobDist[node], bobDist[child] + 1);
    }

    // Update profit at the current node depending on arrival times:
    // If Alice (depth) is earlier than Bob (bobDist[node]), she takes the full amount.
    // If she arrives exactly when Bob does, she gets half.
    if (depth < bobDist[node]) {
      profitHere += amount[node];
    } else if (depth === bobDist[node]) {
      profitHere += (amount[node] >> 1);  // equivalent to Math.floor(amount[node]/2)
    }

    // If no child contributed profit (i.e. it's a leaf), return profitHere.
    // Otherwise, add the best profit from one of the children.
    return bestChildProfit === -Infinity ? profitHere : profitHere + bestChildProfit;
  }

  return dfs(0, -1, 0);
}
