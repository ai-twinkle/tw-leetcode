function areSimilar(mat: number[][], k: number): boolean {
  const columnCount = mat[0].length;
  const effectiveShift = k % columnCount;

  // Zero shift means no element ever moves
  if (effectiveShift === 0) {
    return true;
  }

  const rowCount = mat.length;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = mat[rowIndex];

    // Only need to check effectiveShift elements per row:
    // if row[j] === row[(j + effectiveShift) % n] holds for j in [0, effectiveShift),
    // the remaining positions are covered by transitivity of the cyclic period
    for (let columnIndex = 0; columnIndex < effectiveShift; columnIndex++) {
      if (row[columnIndex] !== row[(columnIndex + effectiveShift) % columnCount]) {
        return false;
      }
    }
  }

  return true;
}
