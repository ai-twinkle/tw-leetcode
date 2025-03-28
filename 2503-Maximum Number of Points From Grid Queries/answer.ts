/**
 * Optimized Union-Find (Disjoint Set Union) class.
 */
class UnionFind {
  parent: number[];
  rank: number[];
  componentSize: number[];

  constructor(totalNodes: number) {
    this.parent = new Array(totalNodes);
    this.rank = new Array(totalNodes);
    this.componentSize = new Array(totalNodes);
    for (let i = 0; i < totalNodes; i++) {
      this.parent[i] = i;
      this.rank[i] = 1;
      this.componentSize[i] = 1;
    }
  }

  find(node: number): number {
    if (this.parent[node] !== node) {
      this.parent[node] = this.find(this.parent[node]);
    }
    return this.parent[node];
  }

  union(nodeA: number, nodeB: number): boolean {
    const rootA = this.find(nodeA);
    const rootB = this.find(nodeB);
    if (rootA === rootB) return false;

    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
      this.componentSize[rootB] += this.componentSize[rootA];
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
      this.componentSize[rootA] += this.componentSize[rootB];
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA]++;
      this.componentSize[rootA] += this.componentSize[rootB];
    }
    return true;
  }
}

/**
 * Returns the maximum number of points collected for each query.
 * A point is collected if the starting cell (0,0) can reach a cell with a value
 * strictly less than the query threshold (using 4-directional movement).
 *
 * @param grid - 2D grid of numbers.
 * @param queries - Array of query thresholds.
 * @returns An array of maximum points for each query.
 */
function maxPoints(grid: number[][], queries: number[]): number[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const totalCells = rows * cols;

  // Flatten the grid into a list of [row, col, value]
  const gridCells: [number, number, number][] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      gridCells.push([row, col, grid[row][col]]);
    }
  }
  gridCells.sort((a, b) => a[2] - b[2]);

  // Sort queries along with their original indices
  const queriesWithIndices: [number, number][] = queries.map((value, index) => [value, index]);
  queriesWithIndices.sort((a, b) => a[0] - b[0]);

  const unionFind = new UnionFind(totalCells);
  const result: number[] = new Array(queries.length).fill(0);

  let nextCellToActivate = 0;
  const totalGridCells = gridCells.length;
  const directions = [
    [-1, 0], // Up
    [0, 1],  // Right
    [1, 0],  // Down
    [0, -1]  // Left
  ];

  const getIndex = (row: number, col: number) => row * cols + col;

  for (const [queryValue, originalIndex] of queriesWithIndices) {
    // Activate all cells with value < queryValue
    while (nextCellToActivate < totalGridCells && gridCells[nextCellToActivate][2] < queryValue) {
      const [row, col] = gridCells[nextCellToActivate];

      for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;

        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) continue;

        if (grid[newRow][newCol] < queryValue) {
          unionFind.union(getIndex(row, col), getIndex(newRow, newCol));
        }
      }
      nextCellToActivate++;
    }

    result[originalIndex] =
      grid[0][0] < queryValue ? unionFind.componentSize[unionFind.find(0)] : 0;
  }

  return result;
}
