function latestDayToCross(row: number, col: number, cells: number[][]): number {
  const totalCellCount = row * col;
  const virtualTopNodeIndex = totalCellCount;
  const virtualBottomNodeIndex = totalCellCount + 1;

  // DSU arrays: parent links + union-by-size to keep trees shallow (fast finds).
  const parent = new Int32Array(totalCellCount + 2);
  const componentSize = new Int32Array(totalCellCount + 2);
  for (let index = 0; index < totalCellCount + 2; index++) {
    parent[index] = index;
    componentSize[index] = 1;
  }

  // Land activation bitmap for the reversed process (0 = water/inactive, 1 = land/active).
  const isLand = new Uint8Array(totalCellCount);

  // Precompute per-day indices so the main loop avoids repeated array indexing / arithmetic overhead.
  const dayRowIndex = new Int32Array(totalCellCount);
  const dayColIndex = new Int32Array(totalCellCount);
  const dayNodeIndex = new Int32Array(totalCellCount);
  for (let dayIndex = 0; dayIndex < totalCellCount; dayIndex++) {
    const cell = cells[dayIndex];
    const rowIndex = cell[0] - 1;
    const colIndex = cell[1] - 1;

    dayRowIndex[dayIndex] = rowIndex;
    dayColIndex[dayIndex] = colIndex;
    dayNodeIndex[dayIndex] = rowIndex * col + colIndex;
  }

  /**
   * Finds the root representative of a node with path compression.
   * @param nodeIndex The DSU node index.
   * @returns The root representative index.
   */
  function findRoot(nodeIndex: number): number {
    // Path halving: greatly reduces depth over time for near O(1) amortized queries.
    while (parent[nodeIndex] !== nodeIndex) {
      parent[nodeIndex] = parent[parent[nodeIndex]];
      nodeIndex = parent[nodeIndex];
    }
    return nodeIndex;
  }

  /**
   * Unions the component of a known root with another node's component (union by size).
   * @param baseRootIndex A root representative index (must be a root).
   * @param otherNodeIndex The other node index (not necessarily a root).
   * @returns The new root representative after union.
   */
  function unionWithBaseRoot(baseRootIndex: number, otherNodeIndex: number): number {
    // Union only by root representatives to avoid unnecessary work.
    let otherRootIndex = findRoot(otherNodeIndex);
    if (baseRootIndex === otherRootIndex) {
      return baseRootIndex;
    }

    // Attach a smaller tree under a larger tree to keep the DSU structure shallow.
    if (componentSize[baseRootIndex] < componentSize[otherRootIndex]) {
      const temporary = baseRootIndex;
      baseRootIndex = otherRootIndex;
      otherRootIndex = temporary;
    }

    parent[otherRootIndex] = baseRootIndex;
    componentSize[baseRootIndex] += componentSize[otherRootIndex];
    return baseRootIndex;
  }

  // Reverse simulation: start fully flooded and add land back one day at a time.
  // The first time top connects to bottom in reverse is the last valid crossing day in forward time.
  for (let dayIndex = totalCellCount - 1; dayIndex >= 0; dayIndex--) {
    const nodeIndex = dayNodeIndex[dayIndex];
    const rowIndex = dayRowIndex[dayIndex];
    const colIndex = dayColIndex[dayIndex];

    // Activate this cell as land, then merge with any adjacent land components.
    isLand[nodeIndex] = 1;

    // Track the current component root to reduce repeated find() calls during multiple unions.
    let baseRootIndex = nodeIndex;

    // Connect top-row land to a virtual top node to enable a single connectivity check.
    if (rowIndex === 0) {
      baseRootIndex = unionWithBaseRoot(baseRootIndex, virtualTopNodeIndex);
    }

    // Connect bottom-row land to a virtual bottom node.
    if (rowIndex === row - 1) {
      baseRootIndex = unionWithBaseRoot(baseRootIndex, virtualBottomNodeIndex);
    }

    // Merge with up a neighbor if it is already active land.
    if (rowIndex > 0) {
      const upNodeIndex = nodeIndex - col;
      if (isLand[upNodeIndex] === 1) {
        baseRootIndex = unionWithBaseRoot(baseRootIndex, upNodeIndex);
      }
    }

    // Merge with a down neighbor if it is already active land.
    if (rowIndex + 1 < row) {
      const downNodeIndex = nodeIndex + col;
      if (isLand[downNodeIndex] === 1) {
        baseRootIndex = unionWithBaseRoot(baseRootIndex, downNodeIndex);
      }
    }

    // Merge with a left neighbor if it is already active land.
    if (colIndex > 0) {
      const leftNodeIndex = nodeIndex - 1;
      if (isLand[leftNodeIndex] === 1) {
        baseRootIndex = unionWithBaseRoot(baseRootIndex, leftNodeIndex);
      }
    }

    // Merge with a right neighbor if it is already active land.
    if (colIndex + 1 < col) {
      const rightNodeIndex = nodeIndex + 1;
      if (isLand[rightNodeIndex] === 1) {
        baseRootIndex = unionWithBaseRoot(baseRootIndex, rightNodeIndex);
      }
    }

    // When virtual top and bottom are in the same DSU component, a land path exists.
    if (findRoot(virtualTopNodeIndex) === findRoot(virtualBottomNodeIndex)) {
      return dayIndex;
    }
  }

  return 0;
}
