// Reusable state across calls (fast for repeated queries)
let cachedMaximumScaledUnits = 0;              // Largest grid already built
let cachedGridStride = 0;                      // stride = cachedMaximumScaledUnits + 1
let cachedProbabilityGrid: Float64Array | null = null; // Flattened (row-major) grid

function ensureProbabilityGrid(targetScaledUnits: number): void {
  if (cachedProbabilityGrid && cachedMaximumScaledUnits >= targetScaledUnits) {
    return;
  }

  const scaledUnits = targetScaledUnits;
  const gridStride = scaledUnits + 1;
  const probabilityGrid = new Float64Array(gridStride * gridStride);

  // Base states.
  probabilityGrid[0] = 0.5; // A and B both empty.
  for (let columnIndex = 1; columnIndex <= scaledUnits; columnIndex++) {
    probabilityGrid[columnIndex] = 1.0; // A empty first.
  }
  for (let rowIndex = 1; rowIndex <= scaledUnits; rowIndex++) {
    probabilityGrid[rowIndex * gridStride] = 0.0; // B empty first.
  }

  // Bottom-up dynamic programming.
  // Each cell is the average over the four serving choices with clamped indices.
  for (let rowIndex = 1; rowIndex <= scaledUnits; rowIndex++) {
    // Precompute clamped row indices for soup A.
    const rowMinusOne = rowIndex - 1 >= 0 ? rowIndex - 1 : 0;
    const rowMinusTwo = rowIndex - 2 >= 0 ? rowIndex - 2 : 0;
    const rowMinusThree = rowIndex - 3 >= 0 ? rowIndex - 3 : 0;
    const rowMinusFour = rowIndex - 4 >= 0 ? rowIndex - 4 : 0;

    for (let columnIndex = 1; columnIndex <= scaledUnits; columnIndex++) {
      // Precompute clamped column indices for soup B.
      const columnMinusOne = columnIndex - 1 >= 0 ? columnIndex - 1 : 0;
      const columnMinusTwo = columnIndex - 2 >= 0 ? columnIndex - 2 : 0;
      const columnMinusThree = columnIndex - 3 >= 0 ? columnIndex - 3 : 0;

      // Read the four predecessor states.
      const probabilityAOnly = probabilityGrid[rowMinusFour * gridStride + columnIndex];
      const probabilityA75B25 = probabilityGrid[rowMinusThree * gridStride + columnMinusOne];
      const probabilityA50B50 = probabilityGrid[rowMinusTwo * gridStride + columnMinusTwo];
      const probabilityA25B75 = probabilityGrid[rowMinusOne * gridStride + columnMinusThree];

      probabilityGrid[rowIndex * gridStride + columnIndex] =
        0.25 * (probabilityAOnly + probabilityA75B25 + probabilityA50B50 + probabilityA25B75);
    }
  }

  // Publish the new cache.
  cachedProbabilityGrid = probabilityGrid;
  cachedMaximumScaledUnits = scaledUnits;
  cachedGridStride = gridStride;
}

function soupServings(n: number): number {
  // Large n converges to 1 quickly; this cutoff is standard and safe.
  if (n >= 4800) {
    return 1.0;
  }

  // Scale amounts by 25 mL to reduce the state space.
  const scaledUnits = Math.ceil(n / 25);

  // Build or reuse the probability grid up to (scaledUnits, scaledUnits).
  ensureProbabilityGrid(scaledUnits);

  // Direct lookup for the answer.
  return (cachedProbabilityGrid as Float64Array)[scaledUnits * cachedGridStride + scaledUnits];
}
