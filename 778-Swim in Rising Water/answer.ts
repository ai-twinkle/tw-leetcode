/**
 * Disjoint Set Union with typed arrays — efficient structure for merging and finding connected groups.
 */
class UnionFind {
  private readonly parent: Int32Array;
  private readonly componentSize: Int16Array;

  /**
   * Initialize each element as its own parent; each set starts with size 1.
   * @param totalElements Total number of elements in the DSU.
   */
  constructor(totalElements: number) {
    this.parent = new Int32Array(totalElements);
    this.componentSize = new Int16Array(totalElements);

    for (let elementIndex = 0; elementIndex < totalElements; elementIndex += 1) {
      this.parent[elementIndex] = elementIndex; // Each node points to itself
      this.componentSize[elementIndex] = 1; // Initial size for each component
    }
  }

  /**
   * Find the root of a node using iterative path compression to flatten the tree.
   * @param element Target element index.
   * @returns Root index representing the connected component.
   */
  find(element: number): number {
    // Traverse upward until reaching the root node.
    let root = element;
    while (this.parent[root] !== root) {
      root = this.parent[root];
    }

    // Compress the path to directly connect all nodes to the root.
    while (this.parent[element] !== element) {
      const next = this.parent[element];
      this.parent[element] = root;
      element = next;
    }

    return root;
  }

  /**
   * Merge two sets by size to keep the tree shallow and balanced.
   * @param a First element index.
   * @param b Second element index.
   */
  union(a: number, b: number): void {
    let rootA = this.find(a);
    let rootB = this.find(b);

    if (rootA === rootB) {
      return; // Already connected
    }

    // Attach smaller tree under the larger tree to reduce depth.
    if (this.componentSize[rootA] < this.componentSize[rootB]) {
      const temp = rootA;
      rootA = rootB;
      rootB = temp;
    }

    this.parent[rootB] = rootA;
    this.componentSize[rootA] += this.componentSize[rootB];
  }

  /**
   * Determine whether two nodes belong to the same connected component.
   * @param a First element index.
   * @param b Second element index.
   * @returns True if both elements share the same root.
   */
  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
}

/**
 * Compute the minimum time when water level allows reaching bottom-right from top-left.
 * Incrementally activates cells by elevation and merges reachable neighbors using DSU.
 *
 * @param grid Elevation grid with unique values in [0, n^2 - 1].
 * @returns Minimum time when path becomes available.
 */
function swimInWater(grid: number[][]): number {
  const dimension = grid.length;

  if (dimension === 1) {
    // Single-cell grid; start and end are the same.
    return grid[0][0];
  }

  const totalCells = dimension * dimension;
  const lastIndex = totalCells - 1;

  // Build a direct lookup: elevation → flattened grid index (avoids sorting).
  const indexByElevation = new Int32Array(totalCells);
  for (let row = 0; row < dimension; row += 1) {
    const rowData = grid[row];
    for (let column = 0; column < dimension; column += 1) {
      const elevation = rowData[column] | 0;
      indexByElevation[elevation] = row * dimension + column;
    }
  }

  // Initialize Union-Find to connect cells as they become submerged.
  const unionFind = new UnionFind(totalCells);

  // Track whether a cell is already activated (reachable at current time).
  const isActivated = new Uint8Array(totalCells);

  // Define relative movement directions (up, down, left, right).
  const deltaRow = new Int8Array([-1, 1, 0, 0]);
  const deltaColumn = new Int8Array([0, 0, -1, 1]);

  // Simulate rising water level: activate cells by elevation order.
  for (let currentTime = 0; currentTime < totalCells; currentTime += 1) {
    const cellIndex = indexByElevation[currentTime];
    isActivated[cellIndex] = 1; // Mark current cell as reachable

    // Convert 1D index back to 2D coordinates.
    const row = (cellIndex / dimension) | 0;
    const column = cellIndex - row * dimension;

    // Check all four directions for already-activated neighbors and union them.
    for (let direction = 0; direction < 4; direction += 1) {
      const nextRow = row + deltaRow[direction];
      const nextColumn = column + deltaColumn[direction];

      if (nextRow >= 0 && nextRow < dimension && nextColumn >= 0 && nextColumn < dimension) {
        const neighborIndex = nextRow * dimension + nextColumn;

        if (isActivated[neighborIndex] === 1) {
          // Merge with reachable neighbor to form a connected region.
          unionFind.union(cellIndex, neighborIndex);
        }
      }
    }

    // As soon as start and end belong to the same component, return current time.
    if (unionFind.connected(0, lastIndex)) {
      return currentTime;
    }
  }

  // Guaranteed to connect by the highest elevation.
  return lastIndex;
}
