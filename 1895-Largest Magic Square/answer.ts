function largestMagicSquare(grid: number[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // Any single cell is trivially a magic square.
  if (rowCount === 1 || columnCount === 1) {
    return 1;
  }

  const rowStride = columnCount + 1;
  const diagonalStride = columnCount + 1;

  // Row prefix sums to allow O(1) horizontal segment queries.
  const rowPrefix = new Int32Array(rowCount * rowStride);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = grid[rowIndex];
    const base = rowIndex * rowStride;
    let sum = 0;
    rowPrefix[base] = 0;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      sum += row[columnIndex] | 0;
      rowPrefix[base + columnIndex + 1] = sum;
    }
  }

  // Column prefix sums to allow O(1) vertical segment queries.
  const colPrefix = new Int32Array((rowCount + 1) * columnCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = grid[rowIndex];
    const topBase = rowIndex * columnCount;
    const bottomBase = (rowIndex + 1) * columnCount;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      colPrefix[bottomBase + columnIndex] =
        colPrefix[topBase + columnIndex] + (row[columnIndex] | 0);
    }
  }

  // Down-right diagonal prefix sums for O(1) main diagonal queries.
  const diagDownRight = new Int32Array((rowCount + 1) * diagonalStride);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = grid[rowIndex];
    const prevBase = rowIndex * diagonalStride;
    const nextBase = (rowIndex + 1) * diagonalStride;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      diagDownRight[nextBase + columnIndex + 1] =
        diagDownRight[prevBase + columnIndex] + (row[columnIndex] | 0);
    }
  }

  // Down-left diagonal prefix sums for O(1) anti-diagonal queries.
  const diagDownLeft = new Int32Array((rowCount + 1) * diagonalStride);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = grid[rowIndex];
    const prevBase = rowIndex * diagonalStride;
    const nextBase = (rowIndex + 1) * diagonalStride;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      diagDownLeft[nextBase + columnIndex] =
        diagDownLeft[prevBase + columnIndex + 1] + (row[columnIndex] | 0);
    }
  }

  const maximumEdgeLength = Math.min(rowCount, columnCount);

  // Try larger squares first to allow early exit on the first valid result.
  for (let edgeLength = maximumEdgeLength; edgeLength >= 2; edgeLength--) {
    const lastTopRowIndex = rowCount - edgeLength;
    const lastLeftColumnIndex = columnCount - edgeLength;

    for (let topRowIndex = 0; topRowIndex <= lastTopRowIndex; topRowIndex++) {
      const topRowBase = topRowIndex * rowStride;
      const topColBase = topRowIndex * columnCount;
      const bottomColBase = (topRowIndex + edgeLength) * columnCount;

      const topDiagBase = topRowIndex * diagonalStride;
      const bottomDiagBase = (topRowIndex + edgeLength) * diagonalStride;

      for (let leftColumnIndex = 0; leftColumnIndex <= lastLeftColumnIndex; leftColumnIndex++) {
        const rightExclusive = leftColumnIndex + edgeLength;

        // Use the first row as the reference sum.
        const standardSum =
          rowPrefix[topRowBase + rightExclusive] - rowPrefix[topRowBase + leftColumnIndex];

        // Fast rejection using both diagonals before checking rows and columns.
        const diagonalSum1 =
          diagDownRight[bottomDiagBase + rightExclusive] -
          diagDownRight[topDiagBase + leftColumnIndex];
        if (diagonalSum1 !== standardSum) {
          continue;
        }

        const diagonalSum2 =
          diagDownLeft[bottomDiagBase + leftColumnIndex] -
          diagDownLeft[topDiagBase + rightExclusive];
        if (diagonalSum2 !== standardSum) {
          continue;
        }

        let isMagic = true;

        // Verify all row sums inside the square.
        for (let rowOffset = 1; rowOffset < edgeLength; rowOffset++) {
          const rowBase = (topRowIndex + rowOffset) * rowStride;
          const rowSum =
            rowPrefix[rowBase + rightExclusive] - rowPrefix[rowBase + leftColumnIndex];
          if (rowSum !== standardSum) {
            isMagic = false;
            break;
          }
        }
        if (!isMagic) {
          continue;
        }

        // Verify all column sums inside the square.
        for (let columnOffset = 0; columnOffset < edgeLength; columnOffset++) {
          const columnIndex = leftColumnIndex + columnOffset;
          const colSum =
            colPrefix[bottomColBase + columnIndex] - colPrefix[topColBase + columnIndex];
          if (colSum !== standardSum) {
            isMagic = false;
            break;
          }
        }

        // The first valid square found is guaranteed to be the largest.
        if (isMagic) {
          return edgeLength;
        }
      }
    }
  }

  return 1;
}
