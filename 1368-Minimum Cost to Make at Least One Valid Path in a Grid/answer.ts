const DIRECTIONS = [
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 }
];

function minCost(grid: number[][]): number {
  // Store the number of rows and columns
  const m = grid.length;    // Number of rows
  const n = grid[0].length; // Number of columns

  // Create a 2D array to store the cost of reaching each cell
  const cost: number[][] = Array.from({ length: m }, () => Array(n).fill(Infinity));
  // Set the cost of reaching the starting cell to 0 as it the starting point
  cost[0][0] = 0;

  // Initialize the deque with the starting
  const deque: { x: number; y: number; c: number }[] = [];
  // Add the starting cell to the deque
  deque.push({ x: 0, y: 0, c: 0 });

  while (deque.length > 0) {
    const { x, y, c } = deque.shift()!;

    for (let i = 0; i < 4; i++) {
      const { dx, dy } = DIRECTIONS[i];
      // The nearby cell
      const nx = x + dx;
      const ny = y + dy;

      // We skip the cell if it is out of bounds
      if (nx < 0 || nx >= m || ny < 0 || ny >= n) {
        continue;
      }

      // Calculate the cost of reaching the nearby cell
      // The cost to reach this cell is the cost of current cell + 1 if we need to modify the sign otherwise it is 0
      const newCost = c + (grid[x][y] === i + 1 ? 0 : 1);

      // Skip the cell if the cost to reach this cell is greater than the cost we have already calculated
      if (newCost >= cost[nx][ny]) {
        continue;
      }

      // Update the cost of reaching the nearby cell
      cost[nx][ny] = newCost;

      // If the sign of the cell is the same as the direction we are moving,
      // we add the cell to the front of the deque
      // Because we want to explore the cells with lower cost first
      if (grid[x][y] === i + 1) {
        deque.unshift({ x: nx, y: ny, c: newCost });
      } else {
        deque.push({ x: nx, y: ny, c: newCost });
      }
    }
  }

  // Return the cost of reaching the last cell
  return cost[m - 1][n - 1];
}
