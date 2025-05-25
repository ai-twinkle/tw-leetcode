function gridGame(grid: number[][]): number {
  // Number of columns
  const columns = grid[0].length;

  // Cache the two rows
  const topRow = grid[0];
  const bottomRow = grid[1];

  // Compute total points in the top row
  let remainingTopPoints = 0;
  for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
    remainingTopPoints += topRow[columnIndex];
  }

  let collectedBottomPoints = 0;
  let bestSecondRobotPoints = Infinity;

  // Sweep left→right, simulating the break‐point where Robot 1 goes down
  for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
    // Robot 1 skips this top cell
    remainingTopPoints -= topRow[columnIndex];

    // Robot 2 will collect whichever is larger:
    // - All remaining topRow cells to the right, or
    // - All bottomRow cells to the left
    const secondRobotPoints =
      remainingTopPoints > collectedBottomPoints
        ? remainingTopPoints
        : collectedBottomPoints;

    // Robot 1 wants to minimize Robot 2’s haul
    if (secondRobotPoints < bestSecondRobotPoints) {
      bestSecondRobotPoints = secondRobotPoints;
    }

    // Now Robot 1 “collected” this bottom cell
    collectedBottomPoints += bottomRow[columnIndex];
  }

  return bestSecondRobotPoints;
}
