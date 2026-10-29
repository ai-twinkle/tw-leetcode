let INT_POOL = new Int32Array(0);
let BYTE_POOL = new Uint8Array(0);

/**
 * Answers, for every "query u v" command, whether the letters on the tree path from u to v
 * can be rearranged into a palindrome, while "update u c" commands change single letters.
 *
 * Each letter is one bit, and a path can form a palindrome when the xor of its bits has at
 * most one bit set. With rootXor[node] as the xor from the root to that node, a path xor equals
 * rootXor[first] ^ rootXor[second] ^ letterMask[lowestCommonAncestor]. An update flips a whole
 * subtree, which is a contiguous range of entry times, so a xor Fenwick tree over a difference
 * array tracks it. Lowest common ancestors are found offline with Tarjan's algorithm during
 * the same depth-first search.
 *
 * @param n - Number of nodes, labelled 0 to n - 1.
 * @param edges - The n - 1 undirected tree edges.
 * @param s - Initial letter of every node.
 * @param queries - Commands of the form "update u c" or "query u v".
 * @returns One boolean per "query" command, in order.
 */
function palindromePath(n: number, edges: number[][], s: string, queries: string[]): boolean[] {
  const commandCount = queries.length;
  const requiredIntegerCount = 14 * n + 8 + 8 * commandCount;
  if (INT_POOL.length < requiredIntegerCount) {
    INT_POOL = new Int32Array(requiredIntegerCount);
  }
  if (BYTE_POOL.length < n + commandCount) {
    BYTE_POOL = new Uint8Array(n + commandCount);
  }
  let poolOffset = 0;

  /**
   * Hands out the next view of the shared integer pool.
   *
   * @param length - Number of integers needed.
   * @returns A view of the pool with the requested length.
   */
  const takePoolView = (length: number) => {
    const poolView = INT_POOL.subarray(poolOffset, poolOffset + length);
    poolOffset += length;
    return poolView;
  };

  // Build compressed adjacency lists with a counting sort
  const adjacencyStart = takePoolView(n + 1);
  const adjacencyList = takePoolView(2 * n);
  adjacencyStart.fill(0);
  for (let edgeIndex = 0; edgeIndex < n - 1; edgeIndex++) {
    adjacencyStart[edges[edgeIndex][0] + 1]++;
    adjacencyStart[edges[edgeIndex][1] + 1]++;
  }
  for (let nodeIndex = 0; nodeIndex < n; nodeIndex++) {
    adjacencyStart[nodeIndex + 1] += adjacencyStart[nodeIndex];
  }
  const adjacencyWritePosition = adjacencyStart.slice(0, n);
  for (let edgeIndex = 0; edgeIndex < n - 1; edgeIndex++) {
    const edgeFirstNode = edges[edgeIndex][0];
    const edgeSecondNode = edges[edgeIndex][1];
    adjacencyList[adjacencyWritePosition[edgeFirstNode]++] = edgeSecondNode;
    adjacencyList[adjacencyWritePosition[edgeSecondNode]++] = edgeFirstNode;
  }

  // Represent each node's letter as a single bit
  const letterMask = takePoolView(n);
  for (let nodeIndex = 0; nodeIndex < n; nodeIndex++) {
    letterMask[nodeIndex] = 1 << (s.charCodeAt(nodeIndex) - 97);
  }

  // Parse every command once into its type, its node, and its letter or second node
  const isUpdateCommand = BYTE_POOL.subarray(0, commandCount);
  const commandNode = takePoolView(commandCount);
  const commandValue = takePoolView(commandCount);
  for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
    const commandText = queries[commandIndex];
    const isUpdate = commandText.charCodeAt(0) === 117;
    let characterPosition = isUpdate ? 7 : 6;
    let parsedNode = 0;
    while (commandText.charCodeAt(characterPosition) !== 32) {
      parsedNode = parsedNode * 10 + commandText.charCodeAt(characterPosition++) - 48;
    }
    characterPosition++;
    isUpdateCommand[commandIndex] = isUpdate ? 1 : 0;
    commandNode[commandIndex] = parsedNode;
    if (isUpdate) {
      commandValue[commandIndex] = commandText.charCodeAt(characterPosition) - 97;
    } else {
      let parsedSecondNode = 0;
      for (; characterPosition < commandText.length; characterPosition++) {
        parsedSecondNode = parsedSecondNode * 10 + commandText.charCodeAt(characterPosition) - 48;
      }
      commandValue[commandIndex] = parsedSecondNode;
    }
  }

  const entryTime = takePoolView(n);
  const exitTime = takePoolView(n);
  const rootXor = takePoolView(n);
  const parentNode = takePoolView(n);

  // Link every path query to both endpoints so the search can resolve its ancestor
  const firstQueryLinkAt = takePoolView(n).fill(-1);
  const nextQueryLink = takePoolView(2 * commandCount);
  const linkedEndpoint = takePoolView(2 * commandCount);
  const lowestCommonAncestor = takePoolView(commandCount);
  for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
    if (isUpdateCommand[commandIndex] === 0) {
      const firstEndpoint = commandNode[commandIndex];
      const secondEndpoint = commandValue[commandIndex];
      const firstLink = 2 * commandIndex;
      const secondLink = firstLink + 1;
      nextQueryLink[firstLink] = firstQueryLinkAt[firstEndpoint];
      firstQueryLinkAt[firstEndpoint] = firstLink;
      linkedEndpoint[firstLink] = secondEndpoint;
      nextQueryLink[secondLink] = firstQueryLinkAt[secondEndpoint];
      firstQueryLinkAt[secondEndpoint] = secondLink;
      linkedEndpoint[secondLink] = firstEndpoint;
    }
  }

  const setParent = takePoolView(n);
  const isVisited = BYTE_POOL.subarray(commandCount, commandCount + n);
  const searchStack = takePoolView(n);
  const nextEdgePosition = takePoolView(n);
  isVisited.fill(0);

  /**
   * Finds the representative of a node's set, compressing the path on the way.
   *
   * @param startNode - Node whose set is looked up.
   * @returns Representative node, which is the current ancestor for that set.
   */
  const findSetRepresentative = (startNode: number) => {
    let representative = startNode;
    while (setParent[representative] !== representative) {
      representative = setParent[representative];
    }
    let currentNode = startNode;
    while (setParent[currentNode] !== representative) {
      const followingNode = setParent[currentNode];
      setParent[currentNode] = representative;
      currentNode = followingNode;
    }
    return representative;
  };

  // Iterative depth-first search from node 0: entry and exit times, root xor, offline ancestors
  let stackTop = 0;
  let timer = 0;
  searchStack[0] = 0;
  nextEdgePosition[0] = adjacencyStart[0];
  parentNode[0] = -1;
  rootXor[0] = letterMask[0];
  entryTime[0] = timer++;
  setParent[0] = 0;
  isVisited[0] = 1;
  for (let queryLink = firstQueryLinkAt[0]; queryLink >= 0; queryLink = nextQueryLink[queryLink]) {
    if (isVisited[linkedEndpoint[queryLink]]) {
      lowestCommonAncestor[queryLink >> 1] = findSetRepresentative(linkedEndpoint[queryLink]);
    }
  }
  while (stackTop >= 0) {
    const currentNode = searchStack[stackTop];
    const edgePosition = nextEdgePosition[stackTop];
    if (edgePosition >= adjacencyStart[currentNode + 1]) {
      // All children done: close the subtree range and merge into the parent's set
      exitTime[currentNode] = timer - 1;
      if (parentNode[currentNode] >= 0) {
        setParent[currentNode] = parentNode[currentNode];
      }
      stackTop--;
      continue;
    }
    nextEdgePosition[stackTop] = edgePosition + 1;
    const childNode = adjacencyList[edgePosition];
    if (childNode === parentNode[currentNode]) {
      continue;
    }
    parentNode[childNode] = currentNode;
    rootXor[childNode] = rootXor[currentNode] ^ letterMask[childNode];
    entryTime[childNode] = timer++;
    setParent[childNode] = childNode;
    isVisited[childNode] = 1;
    // A query whose other endpoint is already visited has its ancestor at that set's representative
    for (let queryLink = firstQueryLinkAt[childNode]; queryLink >= 0; queryLink = nextQueryLink[queryLink]) {
      if (isVisited[linkedEndpoint[queryLink]]) {
        lowestCommonAncestor[queryLink >> 1] = findSetRepresentative(linkedEndpoint[queryLink]);
      }
    }
    searchStack[++stackTop] = childNode;
    nextEdgePosition[stackTop] = adjacencyStart[childNode];
  }

  const fenwickTree = takePoolView(n + 1).fill(0);

  /**
   * Xors a mask into the Fenwick difference array at a 0-based position.
   *
   * @param position - 0-based position to update.
   * @param mask - Mask to xor in.
   */
  const fenwickXorAt = (position: number, mask: number) => {
    for (let treeIndex = position + 1; treeIndex <= n; treeIndex += treeIndex & -treeIndex) {
      fenwickTree[treeIndex] ^= mask;
    }
  };

  /**
   * Returns the prefix xor of the difference array up to a 0-based position.
   *
   * @param position - 0-based position to read.
   * @returns Accumulated xor of all updates covering that position.
   */
  const fenwickPrefixXor = (position: number) => {
    let accumulatedXor = 0;
    for (let treeIndex = position + 1; treeIndex > 0; treeIndex -= treeIndex & -treeIndex) {
      accumulatedXor ^= fenwickTree[treeIndex];
    }
    return accumulatedXor;
  };

  const palindromePossible: boolean[] = [];
  for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
    if (isUpdateCommand[commandIndex] === 1) {
      const updatedNode = commandNode[commandIndex];
      const newLetterMask = 1 << commandValue[commandIndex];
      const maskChange = letterMask[updatedNode] ^ newLetterMask;
      if (maskChange !== 0) {
        // Flip the whole subtree range [entryTime, exitTime]
        letterMask[updatedNode] = newLetterMask;
        fenwickXorAt(entryTime[updatedNode], maskChange);
        if (exitTime[updatedNode] + 1 < n) {
          fenwickXorAt(exitTime[updatedNode] + 1, maskChange);
        }
      }
    } else {
      const firstEndpoint = commandNode[commandIndex];
      const secondEndpoint = commandValue[commandIndex];
      const ancestorNode = lowestCommonAncestor[commandIndex];
      const pathMask = rootXor[firstEndpoint] ^ fenwickPrefixXor(entryTime[firstEndpoint])
        ^ rootXor[secondEndpoint] ^ fenwickPrefixXor(entryTime[secondEndpoint])
        ^ letterMask[ancestorNode];
      // Palindrome is possible when at most one letter has an odd count
      palindromePossible.push((pathMask & (pathMask - 1)) === 0);
    }
  }
  return palindromePossible;
}
