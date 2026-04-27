function containsCycle(grid: string[][]): boolean {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const totalCells = rowCount * columnCount;

  // Populate flattened character codes; simultaneously detect 2x2 monochromatic blocks for fast early exit
  const codes = new Uint8Array(totalCells);
  for (let row = 0; row < rowCount; row++) {
    const rowReference = grid[row];
    const baseIndex = row * columnCount;
    for (let column = 0; column < columnCount; column++) {
      const code = rowReference[column].charCodeAt(0);
      codes[baseIndex + column] = code;
      // A 2x2 block of identical characters is the smallest possible cycle
      if (row > 0 && column > 0
        && code === codes[baseIndex + column - 1]
        && code === codes[baseIndex - columnCount + column]
        && code === codes[baseIndex - columnCount + column - 1]) {
        return true;
      }
    }
  }

  // Initialize DSU parent array (each cell starts in its own set) and rank array
  const parent = new Int32Array(totalCells);
  const rank = new Uint8Array(totalCells);
  for (let i = 0; i < totalCells; i++) {
    parent[i] = i;
  }

  /**
   * Iterative find with two-pass path compression.
   * @param node Cell index whose component root is to be located
   * @return Root of the component containing node
   */
  const find = (node: number): number => {
    let root = node;
    // First pass: walk up the tree to find the root
    while (parent[root] !== root) {
      root = parent[root];
    }
    // Second pass: redirect every node along the path to point directly at root
    let current = node;
    while (parent[current] !== root) {
      const next = parent[current];
      parent[current] = root;
      current = next;
    }
    return root;
  };

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      const currentIndex = row * columnCount + column;
      const currentCode = codes[currentIndex];

      // Index of up-neighbor and left-neighbor; -1 when out of bounds
      const upIndex = row > 0 ? currentIndex - columnCount : -1;
      const leftIndex = column > 0 ? currentIndex - 1 : -1;

      const upMatches = upIndex !== -1 && codes[upIndex] === currentCode;
      const leftMatches = leftIndex !== -1 && codes[leftIndex] === currentCode;

      if (upMatches && leftMatches) {
        const rootUp = find(upIndex);
        const rootLeft = find(leftIndex);
        // Both same-valued neighbors already in the same component implies a cycle
        if (rootUp === rootLeft) {
          return true;
        }
        // Merge the two components using union by rank, then attach current cell
        if (rank[rootUp] < rank[rootLeft]) {
          parent[rootUp] = rootLeft;
          parent[currentIndex] = rootLeft;
        } else if (rank[rootUp] > rank[rootLeft]) {
          parent[rootLeft] = rootUp;
          parent[currentIndex] = rootUp;
        } else {
          parent[rootLeft] = rootUp;
          rank[rootUp]++;
          parent[currentIndex] = rootUp;
        }
      } else if (upMatches) {
        // Only up-neighbor matches: attach current cell to its component
        parent[currentIndex] = find(upIndex);
      } else if (leftMatches) {
        // Only left-neighbor matches: attach current cell to its component
        parent[currentIndex] = find(leftIndex);
      }
      // No matching neighbors: current cell remains its own root (no action needed)
    }
  }

  return false;
}
