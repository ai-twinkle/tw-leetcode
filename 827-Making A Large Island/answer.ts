/**
 * Finds the size of the largest island that can be formed by changing at most one `0` to `1`.
 * An island is defined as a 4-directionally connected group of `1`s.
 *
 * @param grid - The input n x n binary grid.
 * @returns The size of the largest island after flipping one `0` to `1`.
 */
function largestIsland(grid: number[][]): number {
  const n = grid.length;

  // Island IDs start from 2 to distinguish from 1s and 0s
  let currentIslandId = 2;

  // Maps islandId to its size
  const islandSizes: Record<number, number> = {};

  /**
   * Performs DFS to label the current island and count its size.
   *
   * @param row - The current row index.
   * @param col - The current column index.
   * @param islandId - The ID assigned to the current island.
   */
  function dfs(row: number, col: number, islandId: number): void {
    // Base case: Out of bounds or not part of the current island
    if (row < 0 || col < 0 || row >= n || col >= n || grid[row][col] !== 1) {
      return;
    }

    grid[row][col] = islandId; // Label this cell with the current islandId
    islandSizes[islandId]++;   // Increment the size of the current island

    // Explore all 4 directions
    dfs(row - 1, col, islandId);
    dfs(row + 1, col, islandId);
    dfs(row, col - 1, islandId);
    dfs(row, col + 1, islandId);
  }

  /**
   * 1. Label all islands and calculate their sizes
   */
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      // Skip water cells and already labeled islands
      if (grid[row][col] !== 1) {
        continue;
      }

      // Initialize the size of the current island
      islandSizes[currentIslandId] = 0;

      // Perform DFS to label the current island and count its size
      dfs(row, col, currentIslandId);

      // Move to the next island ID
      currentIslandId++;
    }
  }

  /**
   * Calculates the size contributed by neighboring islands when flipping a `0` to `1`.
   *
   * @param row - The row index of the `0` cell.
   * @param col - The column index of the `0` cell.
   * @param visitedIslands - Set to track visited islands and avoid double counting.
   * @returns The size contribution of neighboring islands.
   */
  function getConnectedIslandSize(row: number, col: number, visitedIslands: Set<number>): number {
    // Out of bounds or water cell or already visited island
    if (row < 0 || col < 0 || row >= n || col >= n || grid[row][col] <= 1) {
      return 0;
    }

    // Get the island ID of the neighboring island
    const islandId = grid[row][col];
    if (visitedIslands.has(islandId)) {
      return 0;
    }

    visitedIslands.add(islandId); // Mark this island as visited
    return islandSizes[islandId]; // Return its size
  }

  let maxIslandSize = 0;

  // Flag to check if any 0 was found in the grid
  let haveZeroCell = false;

  /**
   * 2. Check each `0` cell to find the maximum possible island size.
   */
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (grid[row][col] === 0) {
        // A 0 was found, so flag it
        haveZeroCell = true;

        // Track visited neighboring islands
        const visitedIslands = new Set<number>();

        // Calculate the potential island size by flipping this 0
        let potentialSize = 1; // Start with 1 for the flipped 0 itself

        // Check the size of neighboring islands in 4 directions
        potentialSize += getConnectedIslandSize(row - 1, col, visitedIslands);
        potentialSize += getConnectedIslandSize(row + 1, col, visitedIslands);
        potentialSize += getConnectedIslandSize(row, col - 1, visitedIslands);
        potentialSize += getConnectedIslandSize(row, col + 1, visitedIslands);

        // Update the maximum island size
        maxIslandSize = Math.max(maxIslandSize, potentialSize);
      }
    }
  }

  /**
   * 3. Return the maximum island size after flipping one `0` to `1`.
   *    If no `0` was found, return the size of the entire grid.
   */
  return haveZeroCell ? maxIslandSize : n * n;
}
