function gridGame(grid: number[][]): number {
  // Get the number of columns (Grid is 2xN)
  const n = grid[0].length;

  // Init the top and bottom score
  let topSum = grid[0].reduce((a, b) => a + b, 0);
  let bottomSum = 0;

  // Init the second robot score
  let minSecondRobotScore = Infinity;

  // Simulation for the first robot
  for (let i = 0; i < n; i++) {
    // Update top score
    topSum -= grid[0][i];

    // Calculate the second robot score
    const secondRobotScore = Math.max(topSum, bottomSum);

    // Update the minimum second robot score
    minSecondRobotScore = Math.min(minSecondRobotScore, secondRobotScore);

    // Update bottom score
    bottomSum += grid[1][i];
  }

  return minSecondRobotScore;
}