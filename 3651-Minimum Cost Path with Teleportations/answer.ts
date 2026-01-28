function minCost(grid: number[][], k: number): number {
  // Cache grid dimensions to avoid repeated property access
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const cellCount = rowCount * columnCount;

  // Use a large sentinel value to represent unreachable states
  const INF = 1_000_000_000;

  // Flatten the 2D grid into a 1D typed array to improve cache locality
  let maxValue = 0;
  const flattenedValue = new Uint16Array(cellCount);
  let index = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = grid[rowIndex];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const value = row[columnIndex];
      flattenedValue[index] = value;
      // Track the maximum cell value to size suffix-min array efficiently
      if (value > maxValue) {
        maxValue = value;
      }
      index++;
    }
  }

  // dpPrevious[cellIndex] stores the minimum cost to reach this cell so far
  let dpPrevious = new Int32Array(cellCount);

  // Initialize the starting cell with zero cost
  dpPrevious[0] = 0;

  // Fill the first row using only right moves
  for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
    const index = columnIndex;
    dpPrevious[index] = dpPrevious[index - 1] + flattenedValue[index];
  }

  // Fill the remaining rows using only right and down moves
  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    const rowBase = rowIndex * columnCount;

    // The first column can only be reached from above
    const index = rowBase;
    dpPrevious[index] = dpPrevious[index - columnCount] + flattenedValue[index];

    // Inner cells take the cheaper of top or left path
    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      const index = rowBase + columnIndex;
      const fromTop = dpPrevious[index - columnCount];
      const fromLeft = dpPrevious[index - 1];
      const bestBefore = fromTop < fromLeft ? fromTop : fromLeft;
      dpPrevious[index] = bestBefore + flattenedValue[index];
    }
  }

  // Early exit when teleportation is not allowed
  if (k === 0) {
    return dpPrevious[cellCount - 1];
  }

  // bestCostAtOrAboveValue[v] stores min cost among cells with value >= v
  const bestCostAtOrAboveValue = new Int32Array(maxValue + 2);

  // Process DP layers for each allowed teleport usage
  for (let teleportCount = 1; teleportCount <= k; teleportCount++) {
    // Reset suffix-min helper array
    for (let value = 0; value <= maxValue + 1; value++) {
      bestCostAtOrAboveValue[value] = INF;
    }

    // Record minimum cost for each exact cell value
    for (let index = 0; index < cellCount; index++) {
      const value = flattenedValue[index];
      const cost = dpPrevious[index];
      if (cost < bestCostAtOrAboveValue[value]) {
        bestCostAtOrAboveValue[value] = cost;
      }
    }

    // Build suffix minimum so teleport lookup becomes O(1)
    for (let value = maxValue - 1; value >= 0; value--) {
      const next = bestCostAtOrAboveValue[value + 1];
      if (next < bestCostAtOrAboveValue[value]) {
        bestCostAtOrAboveValue[value] = next;
      }
    }

    // Allocate the DP array for the current teleport layer
    const dpCurrent = new Int32Array(cellCount);

    // Starting cell remains free regardless of teleport usage
    dpCurrent[0] = 0;

    // Compute first row allowing either normal move or teleport
    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      const index = columnIndex;
      const value = flattenedValue[index];

      const teleportArriveCost = bestCostAtOrAboveValue[value];
      const normalArriveCost = dpCurrent[index - 1] + value;

      dpCurrent[index] = teleportArriveCost < normalArriveCost
        ? teleportArriveCost
        : normalArriveCost;
    }

    // Compute remaining rows with teleport and normal transitions
    for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
      const rowBase = rowIndex * columnCount;

      // The first column can only come from above or teleport
      const index = rowBase;
      const value = flattenedValue[index];

      const teleportArriveCost = bestCostAtOrAboveValue[value];
      const normalArriveCost = dpCurrent[index - columnCount] + value;

      dpCurrent[index] = teleportArriveCost < normalArriveCost
        ? teleportArriveCost
        : normalArriveCost;

      // Inner cells consider teleport, top, and left paths
      for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
        const index = rowBase + columnIndex;
        const value = flattenedValue[index];

        const teleportArriveCost = bestCostAtOrAboveValue[value];

        const fromTop = dpCurrent[index - columnCount] + value;
        const fromLeft = dpCurrent[index - 1] + value;
        const normalArriveCost = fromTop < fromLeft ? fromTop : fromLeft;

        dpCurrent[index] = teleportArriveCost < normalArriveCost
          ? teleportArriveCost
          : normalArriveCost;
      }
    }

    // Move to the next teleport layer
    dpPrevious = dpCurrent;
  }

  // Return minimum cost to reach the bottom-right cell
  return dpPrevious[cellCount - 1];
}
