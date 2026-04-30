function maxPathScore(grid: number[][], k: number): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // Maximum possible cost along any path is at most (rowCount + columnCount - 1)
  // because every cell costs at most 1. Cap k to avoid wasted work.
  const maxPathCost = rowCount + columnCount - 1;
  const effectiveK = k < maxPathCost ? k : maxPathCost;
  const costDimension = effectiveK + 1;

  // Flatten grid into a typed array for faster access in the hot loop.
  const flatGrid = new Uint8Array(rowCount * columnCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const sourceRow = grid[rowIndex];
    const baseIndex = rowIndex * columnCount;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      flatGrid[baseIndex + columnIndex] = sourceRow[columnIndex];
    }
  }

  // Two rolling rows of dp; each entry stores the best score for a given cost,
  // or -1 if the state is unreachable. Int16Array suffices since max score
  // is bounded by 2 * (m + n - 1) <= 798.
  const previousRow = new Int16Array(columnCount * costDimension);
  const currentRow = new Int16Array(columnCount * costDimension);
  previousRow.fill(-1);
  currentRow.fill(-1);

  // Initialize starting cell (0,0); grid[0][0] is guaranteed to be 0.
  previousRow[0] = 0;

  // Fill the first row by walking right; each cell only depends on its left neighbor.
  for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
    const cellValue = flatGrid[columnIndex];
    const cellCost = cellValue >= 1 ? 1 : 0;
    const baseCurrent = columnIndex * costDimension;
    const baseLeft = (columnIndex - 1) * costDimension;
    // Each cost level inherits from the left neighbor with shifted cost.
    for (let costIndex = cellCost; costIndex < costDimension; costIndex++) {
      const leftScore = previousRow[baseLeft + costIndex - cellCost];
      if (leftScore >= 0) {
        previousRow[baseCurrent + costIndex] = leftScore + cellValue;
      }
    }
  }

  // Process remaining rows; previousRow holds dp values from the row above.
  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    const rowBase = rowIndex * columnCount;

    // Handle column 0 of this row: only the cell directly above can transition here.
    const firstCellValue = flatGrid[rowBase];
    const firstCellCost = firstCellValue >= 1 ? 1 : 0;
    // Reset the dp slot for column 0 in currentRow before writing.
    for (let costIndex = 0; costIndex < costDimension; costIndex++) {
      currentRow[costIndex] = -1;
    }
    for (let costIndex = firstCellCost; costIndex < costDimension; costIndex++) {
      const aboveScore = previousRow[costIndex - firstCellCost];
      if (aboveScore >= 0) {
        currentRow[costIndex] = aboveScore + firstCellValue;
      }
    }

    // Process the rest of the columns; both up and left neighbors are valid.
    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      const cellValue = flatGrid[rowBase + columnIndex];
      const cellCost = cellValue >= 1 ? 1 : 0;
      const baseCurrent = columnIndex * costDimension;
      const baseAbove = baseCurrent;
      const baseLeft = (columnIndex - 1) * costDimension;

      // Clear low-cost slots that cannot be filled because cellCost shifts the index.
      for (let costIndex = 0; costIndex < cellCost; costIndex++) {
        currentRow[baseCurrent + costIndex] = -1;
      }
      for (let costIndex = cellCost; costIndex < costDimension; costIndex++) {
        const sourceCostIndex = costIndex - cellCost;
        const aboveScore = previousRow[baseAbove + sourceCostIndex];
        const leftScore = currentRow[baseLeft + sourceCostIndex];
        // Take the larger of the two predecessor scores; -1 means unreachable.
        const bestPredecessor = aboveScore > leftScore ? aboveScore : leftScore;
        if (bestPredecessor >= 0) {
          currentRow[baseCurrent + costIndex] = bestPredecessor + cellValue;
        } else {
          currentRow[baseCurrent + costIndex] = -1;
        }
      }
    }

    // Roll currentRow into previousRow for the next iteration.
    previousRow.set(currentRow);
  }

  // Scan all cost levels at the bottom-right cell for the maximum reachable score.
  const finalBase = (columnCount - 1) * costDimension;
  let bestScore = -1;
  for (let costIndex = 0; costIndex < costDimension; costIndex++) {
    const candidate = previousRow[finalBase + costIndex];
    if (candidate > bestScore) {
      bestScore = candidate;
    }
  }

  return bestScore;
}
