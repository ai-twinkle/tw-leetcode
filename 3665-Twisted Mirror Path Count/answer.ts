const MODULO = 1_000_000_007;

/**
 * Count the robot's valid paths from the top-left to the bottom-right cell, including mirror reflections.
 * @param grid Binary grid where 0 is an empty cell and 1 is a mirror
 * @returns Number of valid paths modulo 10^9 + 7
 */
function uniquePaths(grid: number[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // downFlow[column] = ways the robot is pushed down into this column of the current row
  const downFlow = new Int32Array(columnCount);

  // Seed the start cell as if one path arrived from above
  downFlow[0] = 1;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = grid[rowIndex];

    // Ways entering the current cell while moving right (nothing enters column 0 from the left)
    let rightFlow = 0;

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const fromAbove = downFlow[columnIndex];

      if (row[columnIndex] === 0) {
        // Empty cell: every arriving path may continue either right or down
        let total = rightFlow + fromAbove;
        if (total >= MODULO) {
          total -= MODULO;
        }
        downFlow[columnIndex] = total;
        rightFlow = total;
      } else {
        // Mirror: a right-moving entry turns down, a down-moving entry turns right
        downFlow[columnIndex] = rightFlow;
        rightFlow = fromAbove;
      }
    }
  }

  // The target cell is empty, so its stored total is the full count of arrivals
  return downFlow[columnCount - 1];
}
