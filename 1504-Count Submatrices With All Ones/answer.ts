// Reusable typed buffers to avoid re-allocation cost across calls
// (heights and stack data <= 150 => Uint8 is safe and faster)
let reusableHeights = new Uint8Array(0);         // Column-wise consecutive-1 heights
let reusableStackHeights = new Uint8Array(0);    // Monotonic stack: heights
let reusableStackRunLengths = new Uint8Array(0); // Monotonic stack: run-lengths

/**
 * Return the smallest power of two ≥ x.
 * Bit-smear version tuned for small sizes (here n ≤ 150).
 */
function nextPow2(x: number): number {
  let v = x - 1;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  return v + 1;
}

/**
 * Ensure reusable buffers can hold `required` columns.
 * Grows to the next power of two to amortize reallocations.
 */
function ensureCapacity(required: number): void {
  if (reusableHeights.length >= required) {
    return;
  }

  const capacity = nextPow2(required);
  reusableHeights = new Uint8Array(capacity);
  reusableStackHeights = new Uint8Array(capacity);
  reusableStackRunLengths = new Uint8Array(capacity);
}

/**
 * Count submatrices with all ones.
 */
function numSubmat(mat: number[][]): number {
  const numberOfRows = mat.length;
  if (numberOfRows === 0) {
    return 0;
  }

  const numberOfColumns = mat[0].length;
  if (numberOfColumns === 0) {
    return 0;
  }

  ensureCapacity(numberOfColumns);

  // Local refs (avoid repeated global property lookups in tight loops)
  const heights = reusableHeights;
  const stackHeights = reusableStackHeights;
  const stackRuns = reusableStackRunLengths;

  // Reset heights for this invocation (only the used prefix)
  heights.fill(0, 0, numberOfColumns);

  let totalSubmatrices = 0;

  // Process each row as the histogram "base"
  for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
    const currentRow = mat[rowIndex];

    // Update column-wise consecutive-1 heights
    for (let columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
      // CurrentRow[columnIndex] is 0/1; height <= numberOfRows <= 150 (fits Uint8)
      heights[columnIndex] = currentRow[columnIndex] === 1 ? (heights[columnIndex] + 1) : 0;
    }

    // Monotonic increasing stack on heights
    let stackTop = -1;
    let accumulatedMinSum = 0; // Sum of minima for all subarrays ending at current column

    for (let columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
      const currentHeight = heights[columnIndex];

      if (currentHeight === 0) {
        // Fast reset when no rectangles can end here
        stackTop = -1;
        accumulatedMinSum = 0;
        continue;
      }

      // Track how many previous columns merge into this "run"
      let runLengthForCurrent = 1;

      // Maintain increasing stack; merge runs and adjust accumulated minima sum
      while (stackTop >= 0 && stackHeights[stackTop] >= currentHeight) {
        accumulatedMinSum -= stackHeights[stackTop] * stackRuns[stackTop];
        runLengthForCurrent += stackRuns[stackTop];
        stackTop--;
      }

      // Push current bar
      stackTop++;
      stackHeights[stackTop] = currentHeight;
      stackRuns[stackTop] = runLengthForCurrent;

      // New minima introduced by the current bar
      accumulatedMinSum += currentHeight * runLengthForCurrent;

      // All subarrays ending at this column contribute
      totalSubmatrices += accumulatedMinSum;
    }
  }

  return totalSubmatrices;
}
