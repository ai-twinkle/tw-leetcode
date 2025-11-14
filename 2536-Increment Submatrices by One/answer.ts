function rangeAddQueries(n: number, queries: number[][]): number[][] {
  // Use (n + 1) x (n + 1) difference grid to eliminate boundary checks
  const diffDimension = n + 1;
  const diffSize = diffDimension * diffDimension;
  const diff = new Int32Array(diffSize);

  const queriesLength = queries.length;

  // Apply 2D difference updates for each query
  for (let queryIndex = 0; queryIndex < queriesLength; queryIndex++) {
    const query = queries[queryIndex];
    const row1 = query[0];
    const column1 = query[1];
    const row2 = query[2];
    const column2 = query[3];

    const baseTop = row1 * diffDimension;
    const baseBottom = (row2 + 1) * diffDimension;

    // Mark +1 in the top-left corner (start of increment area)
    diff[baseTop + column1] += 1;

    // Mark -1 below the bottom boundary
    diff[baseBottom + column1] -= 1;

    // Mark -1 right of the right boundary
    diff[baseTop + (column2 + 1)] -= 1;

    // Mark +1 in the bottom-right corner for balancing
    diff[baseBottom + (column2 + 1)] += 1;
  }

  // Prefix accumulation horizontally to propagate row-wise effects
  for (let rowIndex = 0; rowIndex < diffDimension; rowIndex++) {
    const rowBaseIndex = rowIndex * diffDimension;
    let runningSum = 0;

    for (let columnIndex = 0; columnIndex < diffDimension; columnIndex++) {
      const currentIndex = rowBaseIndex + columnIndex;
      runningSum += diff[currentIndex];     // Accumulate left-to-right
      diff[currentIndex] = runningSum;      // Store horizontal prefix
    }
  }

  // Prefix accumulation vertically to propagate column-wise effects
  for (let columnIndex = 0; columnIndex < diffDimension; columnIndex++) {
    let runningSum = 0;

    for (let rowIndex = 0; rowIndex < diffDimension; rowIndex++) {
      const currentIndex = rowIndex * diffDimension + columnIndex;
      runningSum += diff[currentIndex];     // Accumulate top-to-bottom
      diff[currentIndex] = runningSum;      // Store vertical prefix
    }
  }

  // Extract the valid n x n region into result matrix
  const result: number[][] = new Array(n);

  for (let rowIndex = 0; rowIndex < n; rowIndex++) {
    const rowBaseIndex = rowIndex * diffDimension;
    const resultRow: number[] = new Array(n);

    for (let columnIndex = 0; columnIndex < n; columnIndex++) {
      resultRow[columnIndex] = diff[rowBaseIndex + columnIndex]; // Copy value
    }

    result[rowIndex] = resultRow;
  }

  return result;
}
