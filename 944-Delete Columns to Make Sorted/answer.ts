function minDeletionSize(strs: string[]): number {
  const rowCount = strs.length;
  const columnCount = strs[0].length;

  let deletionCount = 0;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    let previousCharCode = strs[0].charCodeAt(columnIndex);
    let isUnsorted = false;

    for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
      const currentCharCode = strs[rowIndex].charCodeAt(columnIndex);

      // Stop scanning this column as soon as we detect a decreasing pair.
      if (previousCharCode > currentCharCode) {
        isUnsorted = true;
        break;
      }

      previousCharCode = currentCharCode;
    }

    if (isUnsorted) {
      deletionCount++;
    }
  }

  return deletionCount;
}
