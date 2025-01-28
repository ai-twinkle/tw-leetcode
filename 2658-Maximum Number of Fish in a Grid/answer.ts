function findMaxFish(grid: number[][]): number {
  const m = grid.length;
  const n = grid[0].length;

  const dfs = (x: number, y: number): number => {
    // Check if the cell
    // 1. is out of grid
    // 2. is empty (Land or already visited)
    if (x < 0 || x >= m || y < 0 || y >= n || grid[x][y] == 0) {
      return 0;
    }

    // Take the fish from the cell and mark the cell as visited
    let fish = grid[x][y];
    grid[x][y] = 0;

    // DFS in all four directions
    return fish + dfs(x - 1, y) + dfs(x + 1, y) + dfs(x, y - 1) + dfs(x, y + 1);
  }

  let maxFish = 0;

  // Start to find the maximum number of fish from each cell
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      // Skip if the cell is empty or already visited
      if (grid[i][j] == 0) {
        continue;
      }

      maxFish = Math.max(maxFish, dfs(i, j))
    }
  }
  return maxFish;
}
