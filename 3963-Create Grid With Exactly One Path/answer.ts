/** Maximum grid dimension from the constraints (1 <= m, n <= 25). */
const MAXIMUM_DIMENSION = 25;

/** Stride used to pack an (m, n) pair into a single integer cache key. */
const CACHE_STRIDE = MAXIMUM_DIMENSION + 1;

/**
 * Interned row strings, indexed by width.
 * FULL_FREE_ROW[width] is the all-free top row: "....".
 * TAIL_FREE_ROW[width] is a blocked row whose last cell is free: "###.".
 */
const FULL_FREE_ROW: string[] = new Array(CACHE_STRIDE);
const TAIL_FREE_ROW: string[] = new Array(CACHE_STRIDE);

// Build both row shapes incrementally so each width costs one concatenation.
let freePrefix = '';
let blockedPrefix = '';

for (let width = 1; width <= MAXIMUM_DIMENSION; width++) {
  freePrefix += '.';
  FULL_FREE_ROW[width] = freePrefix;
  TAIL_FREE_ROW[width] = blockedPrefix + '.';
  blockedPrefix += '#';
}

/** Memo of finished grids, keyed by m * CACHE_STRIDE + n. */
const GRID_CACHE: Array<string[] | undefined> = new Array(CACHE_STRIDE * CACHE_STRIDE);

/**
 * Builds an m x n grid containing exactly one valid right/down path
 * from the top-left cell to the bottom-right cell.
 *
 * @param m - Number of rows in the grid.
 * @param n - Number of columns in the grid.
 * @returns The grid rows, where '.' is a free cell and '#' is an obstacle.
 */
function createGrid(m: number, n: number): string[] {
  const cacheKey = m * CACHE_STRIDE + n;
  const cachedGrid = GRID_CACHE[cacheKey];

  // Repeated queries for the same dimensions resolve in O(1).
  if (cachedGrid !== undefined) {
    return cachedGrid;
  }

  const grid: string[] = new Array(m);

  // The top row is fully free: the path runs right along it to the last column.
  grid[0] = FULL_FREE_ROW[n];

  // Every lower row exposes only its last cell, forcing the path straight down.
  const descentRow = TAIL_FREE_ROW[n];

  for (let row = 1; row < m; row++) {
    grid[row] = descentRow;
  }

  GRID_CACHE[cacheKey] = grid;

  return grid;
}
