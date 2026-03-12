function maxStability(n: number, edges: number[][], k: number): number {
  const mustParent = new Int32Array(n);
  const mustSize = new Int32Array(n);

  // Initialize DSU for required edges
  for (let node = 0; node < n; node++) {
    mustParent[node] = node;
    mustSize[node] = 1;
  }

  // Track the boundary values needed for the final answer search
  let minimumMustStrength = 1 << 30;
  let hasMustEdge = false;
  let mustEdgeCount = 0;
  let maximumUpgradeableStrength = 0;

  // Store optional edges in separated arrays for cheaper access
  const optionalFromList: number[] = [];
  const optionalToList: number[] = [];
  const optionalStrengthList: number[] = [];

  /**
   * Find the root node in the required-edge DSU.
   * @param node The node to query
   * @returns Root node
   */
  function findMustRoot(node: number): number {
    let current = node;

    // Walk upward until reaching the set representative
    while (mustParent[current] !== current) {
      current = mustParent[current];
    }

    // Compress the traversed path to speed up future queries
    while (mustParent[node] !== node) {
      const nextNode = mustParent[node];
      mustParent[node] = current;
      node = nextNode;
    }

    return current;
  }

  /**
   * Union two nodes in the required-edge DSU.
   * @param firstNode First node
   * @param secondNode Second node
   * @returns True if merged
   */
  function unionMust(firstNode: number, secondNode: number): boolean {
    let firstRoot = findMustRoot(firstNode);
    let secondRoot = findMustRoot(secondNode);

    // No merge is needed when both nodes already belong to the same set
    if (firstRoot === secondRoot) {
      return false;
    }

    // Attach the smaller tree under the larger tree
    if (mustSize[firstRoot] < mustSize[secondRoot]) {
      const temp = firstRoot;
      firstRoot = secondRoot;
      secondRoot = temp;
    }

    // Merge the two sets and update the merged size
    mustParent[secondRoot] = firstRoot;
    mustSize[firstRoot] += mustSize[secondRoot];

    return true;
  }

  // Preprocess edges
  for (let index = 0; index < edges.length; index++) {
    const edge = edges[index];
    const fromNode = edge[0];
    const toNode = edge[1];
    const strength = edge[2];
    const isMustEdge = edge[3];

    if (isMustEdge === 1) {
      // Count and record the constraints introduced by required edges
      hasMustEdge = true;
      mustEdgeCount++;

      // Track minimum strength among must edges
      if (strength < minimumMustStrength) {
        minimumMustStrength = strength;
      }

      // Required edges cannot form a cycle
      if (!unionMust(fromNode, toNode)) {
        return -1;
      }

      continue;
    }

    // Collect optional edges for later threshold checking
    optionalFromList.push(fromNode);
    optionalToList.push(toNode);
    optionalStrengthList.push(strength);

    // Track maximum possible upgraded strength
    const upgradedStrength = strength << 1;

    if (upgradedStrength > maximumUpgradeableStrength) {
      maximumUpgradeableStrength = upgradedStrength;
    }
  }

  // Impossible if required edges exceed tree size
  if (mustEdgeCount > n - 1) {
    return -1;
  }

  const rootToComponent = new Int32Array(n);
  rootToComponent.fill(-1);

  let componentCount = 0;

  // Compress DSU roots into component IDs
  for (let node = 0; node < n; node++) {
    const root = findMustRoot(node);

    if (rootToComponent[root] === -1) {
      rootToComponent[root] = componentCount;
      componentCount++;
    }
  }

  // Required edges already connect all nodes
  if (componentCount === 1) {
    return hasMustEdge ? minimumMustStrength : -1;
  }

  const usefulOptionalFrom: number[] = [];
  const usefulOptionalTo: number[] = [];
  const usefulOptionalStrength: number[] = [];

  // Filter edges that connect different components
  for (let index = 0; index < optionalFromList.length; index++) {
    const componentFrom = rootToComponent[findMustRoot(optionalFromList[index])];
    const componentTo = rootToComponent[findMustRoot(optionalToList[index])];

    if (componentFrom !== componentTo) {
      // Keep only edges that can really help connect compressed components
      usefulOptionalFrom.push(componentFrom);
      usefulOptionalTo.push(componentTo);
      usefulOptionalStrength.push(optionalStrengthList[index]);
    }
  }

  if (usefulOptionalFrom.length === 0) {
    return -1;
  }

  // Convert to TypedArray for faster iteration
  const optionalFrom = Int32Array.from(usefulOptionalFrom);
  const optionalTo = Int32Array.from(usefulOptionalTo);
  const optionalStrength = Int32Array.from(usefulOptionalStrength);

  const searchUpperBound = hasMustEdge
    ? Math.max(minimumMustStrength, maximumUpgradeableStrength)
    : maximumUpgradeableStrength;

  if (searchUpperBound === 0) {
    return -1;
  }

  const connectParent = new Int32Array(componentCount);
  const connectSize = new Int32Array(componentCount);

  /**
   * Check whether stability >= targetStrength is possible.
   * @param targetStrength Required minimum edge strength
   * @returns True if achievable
   */
  function canBuild(targetStrength: number): boolean {
    // Must edges limit stability
    if (hasMustEdge && targetStrength > minimumMustStrength) {
      return false;
    }

    // Reset DSU
    for (let component = 0; component < componentCount; component++) {
      connectParent[component] = component;
      connectSize[component] = 1;
    }

    /**
     * Find component root in connectivity DSU.
     * @param component Component index
     * @returns Root component
     */
    function findComponentRoot(component: number): number {
      let current = component;

      // Walk upward until reaching the component representative
      while (connectParent[current] !== current) {
        current = connectParent[current];
      }

      // Compress the traversed path for later connectivity checks
      while (connectParent[component] !== component) {
        const next = connectParent[component];
        connectParent[component] = current;
        component = next;
      }

      return current;
    }

    /**
     * Union two components.
     * @param a First component
     * @param b Second component
     * @returns True if merged
     */
    function unionComponent(a: number, b: number): boolean {
      let rootA = findComponentRoot(a);
      let rootB = findComponentRoot(b);

      // No merge is needed if both endpoints are already connected
      if (rootA === rootB) {
        return false;
      }

      // Attach the smaller component tree under the larger one
      if (connectSize[rootA] < connectSize[rootB]) {
        const temp = rootA;
        rootA = rootB;
        rootB = temp;
      }

      // Merge the two components and accumulate the size
      connectParent[rootB] = rootA;
      connectSize[rootA] += connectSize[rootB];

      return true;
    }

    let remainingComponents = componentCount;
    let usedUpgrades = 0;

    // Use edges already satisfying threshold
    for (let index = 0; index < optionalStrength.length; index++) {
      if (optionalStrength[index] < targetStrength) {
        // Skip edges that are too weak without an upgrade
        continue;
      }

      if (!unionComponent(optionalFrom[index], optionalTo[index])) {
        // Skip edges that do not reduce the number of components
        continue;
      }

      // One successful merge removes one disconnected component
      remainingComponents--;
      if (remainingComponents === 1) {
        return true;
      }
    }

    // Use upgradeable edges
    for (let index = 0; index < optionalStrength.length; index++) {
      const strength = optionalStrength[index];

      if (strength >= targetStrength) {
        continue;
      }

      if ((strength << 1) < targetStrength) {
        // Skip edges that are still too weak even after one upgrade
        continue;
      }

      if (!unionComponent(optionalFrom[index], optionalTo[index])) {
        // Skip edges that do not improve connectivity
        continue;
      }

      // Count the upgrade only when the edge is actually used
      usedUpgrades++;
      if (usedUpgrades > k) {
        return false;
      }

      // One successful merge removes one disconnected component
      remainingComponents--;
      if (remainingComponents === 1) {
        return true;
      }
    }

    return false;
  }

  // Binary search maximum stability
  let left = 1;
  let right = searchUpperBound;
  let answer = -1;

  while (left <= right) {
    const middle = left + ((right - left) >> 1);

    if (canBuild(middle)) {
      answer = middle;
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return answer;
}
