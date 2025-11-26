function numberOfPaths(grid: number[][], k: number): number {
  const modulusBase = 1_000_000_007;

  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // Total DP states for one row = columnCount * k
  const stateSizePerRow = columnCount * k;

  // Precompute all valueModulo into a flat array for fast access
  const totalCellCount = rowCount * columnCount;
  const moduloGrid = new Uint8Array(totalCellCount);

  let writeIndex = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = grid[rowIndex];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      moduloGrid[writeIndex] = row[columnIndex] % k;
      writeIndex += 1;
    }
  }

  // Rolling DP arrays
  let previousRow = new Int32Array(stateSizePerRow);
  let currentRow = new Int32Array(stateSizePerRow);

  let cellIndex = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    // Reset current DP row
    currentRow.fill(0);

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const valueModulo = moduloGrid[cellIndex];
      cellIndex += 1;

      // Base index for this cell's k remainder states
      const baseIndex = columnIndex * k;

      // Handle starting cell
      if (rowIndex === 0 && columnIndex === 0) {
        currentRow[valueModulo] = 1;
        continue;
      }

      // Pre-compute neighbor base indices
      const fromTopIndex = baseIndex;
      let fromLeftIndex = -1;

      if (columnIndex > 0) {
        fromLeftIndex = (columnIndex - 1) * k;
      }

      // Transition for each remainder
      let remainder = 0;
      while (remainder < k) {
        // Combine paths from top and left
        let pathCount = previousRow[fromTopIndex + remainder];

        if (fromLeftIndex >= 0) {
          pathCount += currentRow[fromLeftIndex + remainder];
        }

        if (pathCount !== 0) {
          // Compute new remainder without using modulo operator
          let newRemainder = remainder + valueModulo;
          if (newRemainder >= k) {
            newRemainder -= k;
          }

          const targetIndex = baseIndex + newRemainder;

          // Add contribution and reduce modulo efficiently
          let updatedValue = currentRow[targetIndex] + pathCount;
          if (updatedValue >= modulusBase) {
            updatedValue -= modulusBase;
            if (updatedValue >= modulusBase) {
              updatedValue %= modulusBase;
            }
          }

          currentRow[targetIndex] = updatedValue;
        }

        remainder += 1;
      }
    }

    // Swap DP rows
    const tempRow = previousRow;
    previousRow = currentRow;
    currentRow = tempRow;
  }

  // Return result for bottom-right cell remainder 0
  const resultBaseIndex = (columnCount - 1) * k;
  return previousRow[resultBaseIndex] % modulusBase;
}
