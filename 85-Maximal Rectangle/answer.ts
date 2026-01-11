function maximalRectangle(matrix: string[][]): number {
  const rowCount = matrix.length;
  const columnCount = matrix[0].length;

  // Maintain histogram heights for each column across rows.
  const heights = new Int16Array(columnCount);

  // Monotonic stack of column indices (with a sentinel).
  const indexStack = new Int16Array(columnCount + 1);

  let maximumArea = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = matrix[rowIndex];

    // Update histogram heights for the current row.
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (row[columnIndex] === "1") {
        heights[columnIndex] = (heights[columnIndex] + 1) as number;
      } else {
        heights[columnIndex] = 0;
      }
    }

    // Compute the largest rectangle in histogram using a monotonic increasing stack.
    let stackTop = 0;
    indexStack[0] = -1; // Sentinel index to simplify width calculation.

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const currentHeight = heights[columnIndex];

      while (stackTop > 0) {
        const topIndex = indexStack[stackTop];
        const topHeight = heights[topIndex];

        if (topHeight <= currentHeight) {
          break;
        }

        // Pop and compute the area with the popped height as the limiting height.
        stackTop--;
        const leftBoundaryIndex = indexStack[stackTop];
        const width = columnIndex - leftBoundaryIndex - 1;
        const area = topHeight * width;

        if (area > maximumArea) {
          maximumArea = area;
        }
      }

      stackTop++;
      indexStack[stackTop] = columnIndex;
    }

    // Flush remaining bars in the stack with right boundary at columnCount.
    while (stackTop > 0) {
      const topIndex = indexStack[stackTop];
      const topHeight = heights[topIndex];

      stackTop--;
      const leftBoundaryIndex = indexStack[stackTop];
      const width = columnCount - leftBoundaryIndex - 1;
      const area = topHeight * width;

      if (area > maximumArea) {
        maximumArea = area;
      }
    }
  }

  return maximumArea;
}
