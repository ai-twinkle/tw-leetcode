function countServers(grid: number[][]): number {
  // Get the number of rows and columns
  const m = grid.length;
  const n = grid[0].length;

  // Storage for the number of servers in each row and column
  const serverCountInRow = new Array(m).fill(0);
  const serverCountInCol = new Array(n).fill(0);

  // Count the number of servers in each row and column
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) {
        serverCountInRow[i]++;
        serverCountInCol[j]++;
      }
    }
  }

  // Count the number of servers that can communicate
  let count = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      // When the cell is empty
      // Or the server is the only server in the row and column
      // We skip this cell
      if (grid[i][j] === 0 || serverCountInRow[i] === 1 && serverCountInCol[j] === 1) {
        continue;
      }

      count++;
    }
  }

  return count;
}
