function maxSideLength(mat: number[][], threshold: number): number {
  const rowCount = mat.length;
  const columnCount = mat[0].length;

  const prefixWidth = columnCount + 1;
  const prefixHeight = rowCount + 1;
  const prefix = new Int32Array(prefixWidth * prefixHeight);

  // Build a flat 2D prefix sum for cache-friendly O(1) rectangle queries.
  for (let row = 1; row <= rowCount; row++) {
    const matRow = mat[row - 1];
    const prefixRowBase = row * prefixWidth;
    const prefixPrevRowBase = (row - 1) * prefixWidth;

    let rowRunningSum = 0;
    for (let col = 1; col <= columnCount; col++) {
      rowRunningSum += matRow[col - 1];
      prefix[prefixRowBase + col] = prefix[prefixPrevRowBase + col] + rowRunningSum;
    }
  }

  /**
   * Check if there exists any square of the given side length with sum <= threshold.
   *
   * @param sideLength - Candidate square side length.
   * @returns True if a valid square exists; otherwise false.
   */
  function hasValidSquare(sideLength: number): boolean {
    const maxRowStart = rowCount - sideLength;
    const maxColStart = columnCount - sideLength;

    const localPrefix = prefix;
    const localPrefixWidth = prefixWidth;

    for (let rowStart = 0; rowStart <= maxRowStart; rowStart++) {
      const topBase = rowStart * localPrefixWidth;
      const bottomBase = (rowStart + sideLength) * localPrefixWidth;

      // Slide (left,right) together to avoid recomputing colStart + sideLength each iteration.
      let left = 0;
      let right = sideLength;

      for (let colStart = 0; colStart <= maxColStart; colStart++) {
        const sum = localPrefix[bottomBase + right] - localPrefix[topBase + right] -
          localPrefix[bottomBase + left] + localPrefix[topBase + left];

        if (sum <= threshold) {
          return true;
        }

        left++;
        right++;
      }
    }

    return false;
  }

  let low = 0;
  let high = rowCount < columnCount ? rowCount : columnCount;

  // Binary searches the maximum feasible side length.
  while (low < high) {
    const middle = (low + high + 1) >> 1;

    if (hasValidSquare(middle)) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return low;
}
