function minimumCost(source: string, target: string, original: string[], changed: string[], cost: number[]): number {
  const sourceLength = source.length;
  const INF = 1e30;

  // Transformation rule definition
  type Rule = { from: string; to: string; cost: number };

  // Per-length transformation graph
  type Group = {
    length: number;                        // Substring length this group handles
    nodeIdByString: Map<string, number>;   // String -> node id mapping
    nodeCount: number;                     // Total nodes in this graph
    dist: Float64Array;                    // All-pairs shortest path matrix
  };

  // Group transformation rules by substring length
  const rulesByLength = new Map<number, Rule[]>();
  for (let index = 0; index < original.length; index++) {
    const length = original[index].length;
    let list = rulesByLength.get(length);
    if (list === undefined) {
      list = [];
      rulesByLength.set(length, list);
    }
    list.push({ from: original[index], to: changed[index], cost: cost[index] });
  }

  const groups: Group[] = [];

  // Build an independent shortest-path graph for each substring length
  for (const [length, rules] of rulesByLength.entries()) {

    // Assign compact integer ids to all unique strings
    const nodeIdByString = new Map<string, number>();
    for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
      const rule = rules[ruleIndex];

      if (!nodeIdByString.has(rule.from)) {
        nodeIdByString.set(rule.from, nodeIdByString.size);
      }
      if (!nodeIdByString.has(rule.to)) {
        nodeIdByString.set(rule.to, nodeIdByString.size);
      }
    }

    const nodeCount = nodeIdByString.size;
    const dist = new Float64Array(nodeCount * nodeCount);

    // Initialize distance matrix with INF
    for (let i = 0; i < dist.length; i++) {
      dist[i] = INF;
    }

    // Distance from the node to itself is zero
    for (let node = 0; node < nodeCount; node++) {
      dist[node * nodeCount + node] = 0;
    }

    // Insert direct transformation costs, keeping the minimum for duplicates
    for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
      const rule = rules[ruleIndex];
      const fromId = nodeIdByString.get(rule.from) as number;
      const toId = nodeIdByString.get(rule.to) as number;

      const position = fromId * nodeCount + toId;
      if (rule.cost < dist[position]) {
        dist[position] = rule.cost;
      }
    }

    // Compute all-pairs minimum conversion cost (Floyd–Warshall)
    for (let middle = 0; middle < nodeCount; middle++) {
      const middleRow = middle * nodeCount;

      for (let from = 0; from < nodeCount; from++) {
        const fromRow = from * nodeCount;
        const fromToMiddle = dist[fromRow + middle];

        if (fromToMiddle >= INF) {
          continue;
        }

        for (let to = 0; to < nodeCount; to++) {
          const middleToTo = dist[middleRow + to];

          if (middleToTo >= INF) {
            continue;
          }

          const candidate = fromToMiddle + middleToTo;
          const index = fromRow + to;

          if (candidate < dist[index]) {
            dist[index] = candidate;
          }
        }
      }
    }

    // Store the completed graph for this substring length
    groups.push({ length, nodeIdByString, nodeCount, dist });
  }

  // dp[i] = minimum cost to convert source[0..i-1] to target[0..i-1]
  const dp = new Float64Array(sourceLength + 1);
  for (let i = 0; i < dp.length; i++) {
    dp[i] = INF;
  }
  dp[0] = 0;

  // Process each position in the source string
  for (let position = 0; position < sourceLength; position++) {
    const currentCost = dp[position];

    // Skip unreachable states
    if (currentCost >= INF) {
      continue;
    }

    // No-cost move when characters already match
    if (source.charCodeAt(position) === target.charCodeAt(position)) {
      const nextPosition = position + 1;
      if (currentCost < dp[nextPosition]) {
        dp[nextPosition] = currentCost;
      }
    }

    // Try all transformation lengths starting at this position
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];
      const length = group.length;
      const end = position + length;

      // Skip if the substring exceeds bounds
      if (end > sourceLength) {
        continue;
      }

      // Extract source and target substrings for lookup
      const sourceSub = source.substring(position, end);
      const targetSub = target.substring(position, end);

      // Skip if no transformation starts from this source substring
      const fromId = group.nodeIdByString.get(sourceSub);
      if (fromId === undefined) {
        continue;
      }

      // Skip if the target substring is not reachable
      const toId = group.nodeIdByString.get(targetSub);
      if (toId === undefined) {
        continue;
      }

      // Retrieve precomputed minimum transformation cost
      const transformCost = group.dist[fromId * group.nodeCount + toId];
      if (transformCost >= INF) {
        continue;
      }

      // Relax DP state using this transformation
      const candidate = currentCost + transformCost;
      if (candidate < dp[end]) {
        dp[end] = candidate;
      }
    }
  }

  // Return result or -1 if conversion is impossible
  if (dp[sourceLength] >= INF) {
    return -1;
  }
  return dp[sourceLength];
}
