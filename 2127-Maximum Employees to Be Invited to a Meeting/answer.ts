function maximumInvitations(favorite: number[]): number {
  const favoriteList = favorite;
  const numberOfEmployees = favoriteList.length;

  // 1. Compute inDegree[i]: number of employees who list i as their favorite
  const inDegree = new Uint32Array(numberOfEmployees);
  for (let e = 0; e < numberOfEmployees; e++) {
    inDegree[favoriteList[e]]++;
  }

  // 2. Initialize BFS queue with all employees not listed as a favorite (leaves)
  const bfsQueue = new Uint32Array(numberOfEmployees);
  let queueHead = 0, queueTail = 0;
  for (let e = 0; e < numberOfEmployees; e++) {
    if (inDegree[e] === 0) {
      bfsQueue[queueTail++] = e;
    }
  }

  // 3. Compute the longest chain ending at each employee (for future 2-cycles)
  const longestChainTo = new Uint32Array(numberOfEmployees);

  // Remove non-cycle nodes layer by layer (topological order)
  while (queueHead < queueTail) {
    const curr = bfsQueue[queueHead++];
    const fav = favoriteList[curr];
    const candLength = longestChainTo[curr] + 1;
    if (candLength > longestChainTo[fav]) {
      longestChainTo[fav] = candLength;
    }
    if (--inDegree[fav] === 0) {
      bfsQueue[queueTail++] = fav;
    }
  }

  // 4. Scan for cycles; sum up the best configuration
  let largestCycleSize = 0;
  let totalMutualChainSize = 0;

  // Only nodes with inDegree 1 are part of cycles at this point
  for (let e = 0; e < numberOfEmployees; e++) {
    if (inDegree[e] !== 1) {
      continue;
    }

    // Trace this cycle and mark visited as inDegree 0
    let cycleSize = 0;
    let walker = e;
    do {
      inDegree[walker] = 0; // mark visited
      cycleSize++;
      walker = favoriteList[walker];
    } while (inDegree[walker] === 1);

    if (cycleSize === 2) {
      // For a 2-cycle, attach the longest incoming chains to both members
      const a = e;
      const b = favoriteList[e];
      totalMutualChainSize += 2 + longestChainTo[a] + longestChainTo[b];
    } else if (cycleSize > largestCycleSize) {
      // For cycles >2, take the largest as possible invitation group
      largestCycleSize = cycleSize;
    }
  }

  // 5. Return the better between all combined 2-cycles or the largest cycle
  return totalMutualChainSize > largestCycleSize
    ? totalMutualChainSize
    : largestCycleSize;
}
