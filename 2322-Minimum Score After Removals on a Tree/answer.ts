function minimumScore(nums: number[], edges: number[][]): number {
  const nodeCount = nums.length;

  // 1. Build a flat adjacency list with head/next arrays
  const head = new Int32Array(nodeCount).fill(-1);
  const to = new Int32Array((nodeCount - 1) * 2);
  const nextEdge = new Int32Array((nodeCount - 1) * 2);
  let edgeIndex = 0;
  for (let i = 0; i < edges.length; i++) {
    const [nodeA, nodeB] = edges[i];
    to[edgeIndex] = nodeB;
    nextEdge[edgeIndex] = head[nodeA];
    head[nodeA] = edgeIndex++;
    to[edgeIndex] = nodeA;
    nextEdge[edgeIndex] = head[nodeB];
    head[nodeB] = edgeIndex++;
  }

  // 2. Arrays to hold subtree XOR, DFS times
  const subtreeXor = new Int32Array(nodeCount);
  const entryTime = new Int32Array(nodeCount);
  const exitTime = new Int32Array(nodeCount);

  // 3. Initialize subtreeXor with node values
  for (let i = 0; i < nodeCount; i++) {
    subtreeXor[i] = nums[i] | 0;
  }

  // 4. Iterative DFS to compute entry/exit times + subtree XOR
  let timeStamp = 0;
  const stackNode = new Int32Array(nodeCount * 2);
  const stackParent = new Int32Array(nodeCount * 2);
  let stackPointer = 0;

  // 5. Start at node 0, parent = -1
  stackNode[stackPointer] = 0;
  stackParent[stackPointer] = -1;
  stackPointer++;

  while (stackPointer > 0) {
    // Pop
    stackPointer--;
    const current = stackNode[stackPointer];
    const parent = stackParent[stackPointer];

    if (current >= 0) {
      // Preorder: mark entry time
      entryTime[current] = timeStamp++;

      // Push a post-order marker
      stackNode[stackPointer] = ~current;
      stackParent[stackPointer] = parent;
      stackPointer++;

      // Push all children
      let edge = head[current];
      while (edge !== -1) {
        const neighbor = to[edge];
        if (neighbor !== parent) {
          stackNode[stackPointer] = neighbor;
          stackParent[stackPointer] = current;
          stackPointer++;
        }
        edge = nextEdge[edge];
      }

      continue;
    }

    // postorder: accumulate XOR from children
    const realNode = ~current;
    let accumulated = subtreeXor[realNode];
    let edge = head[realNode];
    while (edge !== -1) {
      const neighbor = to[edge];
      if (neighbor !== parent) {
        accumulated ^= subtreeXor[neighbor];
      }
      edge = nextEdge[edge];
    }
    subtreeXor[realNode] = accumulated;
    exitTime[realNode] = timeStamp;
  }

  // 6. Now try removing every pair of edges in O(n^2) with in/out checks
  const totalXor = subtreeXor[0];
  let bestScore = Number.MAX_SAFE_INTEGER;

  for (let nodeU = 1; nodeU < nodeCount; nodeU++) {
    const xorU = subtreeXor[nodeU];
    const entryU = entryTime[nodeU];
    const exitU = exitTime[nodeU];

    for (let nodeV = nodeU + 1; nodeV < nodeCount; nodeV++) {
      const xorV = subtreeXor[nodeV];
      const entryV = entryTime[nodeV];

      let part1: number, part2: number, part3: number;

      // Case 1: V is in U's subtree
      if (entryV > entryU && entryV < exitU) {
        part1 = totalXor ^ xorU;
        part2 = xorU ^ xorV;
        part3 = xorV;

        // Case 2: U is in V's subtree
      } else if (entryU > entryTime[nodeV] && entryU < exitTime[nodeV]) {
        part1 = totalXor ^ xorV;
        part2 = xorV ^ xorU;
        part3 = xorU;

        // Case 3: they are in separate subtrees
      } else {
        part1 = totalXor ^ xorU ^ xorV;
        part2 = xorU;
        part3 = xorV;
      }

      // Inline min/max
      let currentMax = part1 > part2 ? part1 : part2;
      currentMax = currentMax > part3 ? currentMax : part3;
      let currentMin = part1 < part2 ? part1 : part2;
      currentMin = currentMin < part3 ? currentMin : part3;

      const currentScore = currentMax - currentMin;
      if (currentScore < bestScore) {
        bestScore = currentScore;
      }
    }
  }

  return bestScore;
}
