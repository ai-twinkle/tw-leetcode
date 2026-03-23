function maxProductPath(grid: number[][]): number {
  const MODULO = 1_000_000_007n;
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const totalCells = rowCount * columnCount;

  // Pre-flatten and pre-convert once to avoid per-iteration BigInt boxing
  const flatGrid = new Array<bigint>(totalCells);
  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      flatGrid[row * columnCount + column] = BigInt(grid[row][column]);
    }
  }

  // Parallel DP tables: max and min product reachable at each cell (flat index)
  const dpMax = new Array<bigint>(totalCells);
  const dpMin = new Array<bigint>(totalCells);

  dpMax[0] = dpMin[0] = flatGrid[0];

  // First row: each cell is reachable only from the left
  for (let column = 1; column < columnCount; column++) {
    const product = dpMax[column - 1] * flatGrid[column];
    dpMax[column] = product;
    dpMin[column] = product;
  }

  // First column: each cell is reachable only from above
  for (let row = 1; row < rowCount; row++) {
    const currentIndex = row * columnCount;
    const product = dpMax[currentIndex - columnCount] * flatGrid[currentIndex];
    dpMax[currentIndex] = product;
    dpMin[currentIndex] = product;
  }

  // Fill remaining cells: reachable from above or from the left
  for (let row = 1; row < rowCount; row++) {
    for (let column = 1; column < columnCount; column++) {
      const currentIndex = row * columnCount + column;
      const aboveIndex = currentIndex - columnCount;
      const leftIndex = currentIndex - 1;
      const currentValue = flatGrid[currentIndex];

      // Aggregate the best and worst product across both predecessor cells
      const predecessorMax = dpMax[aboveIndex] > dpMax[leftIndex]
        ? dpMax[aboveIndex]
        : dpMax[leftIndex];
      const predecessorMin = dpMin[aboveIndex] < dpMin[leftIndex]
        ? dpMin[aboveIndex]
        : dpMin[leftIndex];

      // A negative multiplier reverses which predecessor gives max vs min
      if (currentValue >= 0n) {
        dpMax[currentIndex] = predecessorMax * currentValue;
        dpMin[currentIndex] = predecessorMin * currentValue;
      } else {
        dpMax[currentIndex] = predecessorMin * currentValue;
        dpMin[currentIndex] = predecessorMax * currentValue;
      }
    }
  }

  const maximumProduct = dpMax[totalCells - 1];

  // No non-negative path product exists
  if (maximumProduct < 0n) {
    return -1;
  }

  // Modulo is applied only here, after all exact-integer comparisons are done
  return Number(maximumProduct % MODULO);
}
