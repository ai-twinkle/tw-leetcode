function shiftGrid(grid: number[][], k: number): number[][] {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const total = rowCount * columnCount;

  const shift = k % total;
  if (shift === 0) {
    return grid;
  }

  // Destination of source index i is (i + shift) % total. Equivalently,
  // the flattened output is the source rotated left by (total - shift).
  // splitPoint marks where the tail of the source wraps to the front.
  const splitPoint = total - shift;

  const result: number[][] = new Array(rowCount);
  let sourceIndex = splitPoint;

  for (let row = 0; row < rowCount; row++) {
    const outputRow = new Array(columnCount);
    for (let column = 0; column < columnCount; column++) {
      // Walk the source in rotated order, wrapping once at total.
      if (sourceIndex === total) {
        sourceIndex = 0;
      }
      outputRow[column] = grid[(sourceIndex / columnCount) | 0][sourceIndex % columnCount];
      sourceIndex++;
    }
    result[row] = outputRow;
  }

  return result;
}
