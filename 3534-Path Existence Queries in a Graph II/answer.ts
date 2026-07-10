function pathExistenceQueries(
  n: number,
  nums: number[],
  maxDiff: number,
  queries: number[][]
): number[] {
  const queryCount = queries.length;
  const queryResults = new Array<number>(queryCount);

  // Trivial single-node graph: every query is either the same node or invalid.
  if (n === 1) {
    for (let i = 0; i < queryCount; i++) {
      queryResults[i] = 0;
    }
    return queryResults;
  }

  // Sort node indices by their values so connectivity becomes a chain problem.
  const sortedIndexArray = Array.from({ length: n }, (_, index) => index);
  sortedIndexArray.sort((a, b) => nums[a] - nums[b]);

  // positionInSorted[node] gives the rank of a node in value-sorted order.
  const positionInSorted = new Int32Array(n);
  const sortedValues = new Int32Array(n);
  for (let rank = 0; rank < n; rank++) {
    const node = sortedIndexArray[rank];
    positionInSorted[node] = rank;
    sortedValues[rank] = nums[node];
  }

  // Assign a component id to each sorted rank based on consecutive value gaps.
  const componentId = new Int32Array(n);
  let currentComponent = 0;
  componentId[0] = 0;
  for (let rank = 1; rank < n; rank++) {
    // A gap larger than maxDiff breaks the chain into a new component.
    if (sortedValues[rank] - sortedValues[rank - 1] > maxDiff) {
      currentComponent++;
    }
    componentId[rank] = currentComponent;
  }

  // furthestReach[rank] is the largest rank reachable in a single hop from rank.
  const furthestReach = new Int32Array(n);
  let windowEnd = 0;
  for (let rank = 0; rank < n; rank++) {
    if (windowEnd < rank) {
      windowEnd = rank;
    }
    // Extend the window while the value difference stays within maxDiff.
    while (windowEnd + 1 < n && sortedValues[windowEnd + 1] - sortedValues[rank] <= maxDiff) {
      windowEnd++;
    }
    furthestReach[rank] = windowEnd;
  }

  // Build a binary-lifting table over the furthest-reach pointer.
  const levelCount = Math.max(1, Math.ceil(Math.log2(n)) + 1);
  const jumpTable: Int32Array[] = new Array(levelCount);
  jumpTable[0] = furthestReach;
  for (let level = 1; level < levelCount; level++) {
    const previousLevel = jumpTable[level - 1];
    const currentLevel = new Int32Array(n);
    for (let rank = 0; rank < n; rank++) {
      // Two hops of the previous level equal one hop of this level.
      currentLevel[rank] = previousLevel[previousLevel[rank]];
    }
    jumpTable[level] = currentLevel;
  }

  // Resolve each query using component check plus greedy binary-lifted hops.
  for (let i = 0; i < queryCount; i++) {
    const startNode = queries[i][0];
    const endNode = queries[i][1];

    // Same node needs zero moves.
    if (startNode === endNode) {
      queryResults[i] = 0;
      continue;
    }

    let lowerRank = positionInSorted[startNode];
    let upperRank = positionInSorted[endNode];
    if (lowerRank > upperRank) {
      const temporary = lowerRank;
      lowerRank = upperRank;
      upperRank = temporary;
    }

    // Different components mean no path exists.
    if (componentId[lowerRank] !== componentId[upperRank]) {
      queryResults[i] = -1;
      continue;
    }

    // Greedily take the largest jumps that do not overshoot the target rank.
    let hopCount = 0;
    let currentRank = lowerRank;
    for (let level = levelCount - 1; level >= 0; level--) {
      const nextRank = jumpTable[level][currentRank];
      if (nextRank < upperRank) {
        currentRank = nextRank;
        hopCount += 1 << level;
      }
    }

    // One final hop covers the remaining reach to the target.
    queryResults[i] = hopCount + 1;
  }

  return queryResults;
}
