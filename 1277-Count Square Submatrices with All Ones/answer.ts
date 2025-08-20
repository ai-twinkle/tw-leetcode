function countSquares(matrix: number[][]): number {
  // Guard for empty input (though constraints imply non-empty)
  const rowCount = matrix.length;
  if (rowCount === 0) {
    return 0;
  }
  const columnCount = matrix[0].length;
  if (columnCount === 0) {
    return 0;
  }

  // DP rows: dp[j] = size of largest all-1 square ending at current cell (i, j)
  // Use 16-bit typed arrays: maximum possible value is 300
  let previousRow = new Uint16Array(columnCount);
  let currentRow = new Uint16Array(columnCount);

  let totalSquares = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row: number[] = matrix[rowIndex];
    // Tracks previousRow[j-1] for the diagonal value without extra array lookups
    let upLeftOfPrevious = 0;

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      // Normalize to 0/1 and ensure integer fast path
      const cellValue = row[columnIndex] | 0;

      // Default dp value is 0 for cell==0
      let largestSquareSize = 0;

      if (cellValue !== 0) {
        // Neighbors:
        // up    -> previousRow[columnIndex]
        // left  -> currentRow[columnIndex - 1] (0 when columnIndex == 0)
        // diag  -> upLeftOfPrevious (previousRow[columnIndex - 1])
        const up = previousRow[columnIndex];
        let left = 0;
        if (columnIndex > 0) {
          left = currentRow[columnIndex - 1];
        }
        const diagonal = upLeftOfPrevious;

        // Inline min(a, b, c)
        let minNeighbor;
        if (up < left) {
          minNeighbor = up;
        } else {
          minNeighbor = left;
        }
        if (diagonal < minNeighbor) {
          minNeighbor = diagonal;
        }

        largestSquareSize = (minNeighbor + 1) | 0;
      }

      currentRow[columnIndex] = largestSquareSize;
      totalSquares += largestSquareSize;

      // Prepare diagonal for next column (store previousRow[columnIndex] as "prev[columnIndex - 1]" for next iteration)
      upLeftOfPrevious = previousRow[columnIndex];
    }

    // Swap the row buffers (avoid copying/filling)
    const tempRow = previousRow;
    previousRow = currentRow;
    currentRow = tempRow;
    // No need to clear currentRow; next row will overwrite every entry
  }

  return totalSquares;
}
