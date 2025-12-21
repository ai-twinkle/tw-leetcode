function minDeletionSize(strs: string[]): number {
  const rowCount = strs.length;
  const columnCount = strs[0].length;

  // Track whether each adjacent pair (rowIndex, rowIndex+1) is already strictly ordered.
  const isAdjacentPairResolved = new Uint8Array(rowCount - 1);

  // Reusable buffer to store which adjacent pairs become resolved by the current column.
  const pendingResolvedPairIndex = new Uint8Array(rowCount - 1);

  let unresolvedPairCount = rowCount - 1;
  let deletedColumnCount = 0;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    if (unresolvedPairCount === 0) {
      break;
    }

    let mustDeleteColumn = false;
    let pendingCount = 0;

    // Scan this column once: detect deletion, and record which pairs can be resolved.
    for (let rowIndex = 0; rowIndex < rowCount - 1; rowIndex++) {
      if (isAdjacentPairResolved[rowIndex] !== 0) {
        continue;
      }

      const upperCode = strs[rowIndex].charCodeAt(columnIndex);
      const lowerCode = strs[rowIndex + 1].charCodeAt(columnIndex);

      if (upperCode > lowerCode) {
        // Important step: this column breaks lexicographic order for an unresolved pair -> delete it.
        mustDeleteColumn = true;
        deletedColumnCount++;
        break;
      }

      if (upperCode < lowerCode) {
        pendingResolvedPairIndex[pendingCount] = rowIndex;
        pendingCount++;
      }
    }

    if (mustDeleteColumn) {
      continue;
    }

    // Apply the "resolved" updates only if the column is kept.
    for (let pendingIndex = 0; pendingIndex < pendingCount; pendingIndex++) {
      const pairIndex = pendingResolvedPairIndex[pendingIndex];
      if (isAdjacentPairResolved[pairIndex] === 0) {
        isAdjacentPairResolved[pairIndex] = 1;
        unresolvedPairCount--;
      }
    }
  }

  return deletedColumnCount;
}
