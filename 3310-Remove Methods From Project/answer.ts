function remainingMethods(n: number, k: number, invocations: number[][]): number[] {
  const edgeCount = invocations.length;

  // Flatten the nested edge list once; every later pass reads only typed arrays
  const edgeCaller = new Int32Array(edgeCount);
  const edgeCallee = new Int32Array(edgeCount);
  const adjacencyStart = new Int32Array(n + 1);

  for (let index = 0; index < edgeCount; index++) {
    const edge = invocations[index];
    const caller = edge[0];
    edgeCaller[index] = caller;
    edgeCallee[index] = edge[1];
    // Shifted counting slot lets the prefix sum below double as the bucket start
    adjacencyStart[caller + 1]++;
  }

  // Prefix sum converts out-degrees into CSR bucket boundaries
  for (let node = 0; node < n; node++) {
    adjacencyStart[node + 1] += adjacencyStart[node];
  }

  const adjacencyTarget = new Int32Array(edgeCount);
  const fillCursor = adjacencyStart.slice(0, n);

  for (let index = 0; index < edgeCount; index++) {
    adjacencyTarget[fillCursor[edgeCaller[index]]++] = edgeCallee[index];
  }

  // Iterative DFS avoids recursion overhead and stack overflow at n = 10^5
  const isSuspicious = new Uint8Array(n);
  const traversalStack = new Int32Array(n);
  let stackSize = 0;
  let suspiciousCount = 1;

  isSuspicious[k] = 1;
  traversalStack[stackSize++] = k;

  while (stackSize > 0) {
    const node = traversalStack[--stackSize];
    const bucketEnd = adjacencyStart[node + 1];

    for (let index = adjacencyStart[node]; index < bucketEnd; index++) {
      const callee = adjacencyTarget[index];

      if (isSuspicious[callee] === 0) {
        isSuspicious[callee] = 1;
        suspiciousCount++;
        traversalStack[stackSize++] = callee;
      }
    }
  }

  // A single linear edge sweep detects any clean method pointing into the group
  let isRemovable = true;

  for (let index = 0; index < edgeCount; index++) {
    if (isSuspicious[edgeCallee[index]] === 1 && isSuspicious[edgeCaller[index]] === 0) {
      isRemovable = false;
      break;
    }
  }

  if (isRemovable === false) {
    const everyMethod = new Array<number>(n);

    for (let node = 0; node < n; node++) {
      everyMethod[node] = node;
    }

    return everyMethod;
  }

  // Exact output size is already known, so the result array never has to grow
  const remaining = new Array<number>(n - suspiciousCount);
  let writeIndex = 0;

  for (let node = 0; node < n; node++) {
    if (isSuspicious[node] === 0) {
      remaining[writeIndex++] = node;
    }
  }

  return remaining;
}
