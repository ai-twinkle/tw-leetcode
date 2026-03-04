function numSpecial(mat: number[][]): number {
  const rowCount = mat.length;
  const columnCount = mat[0].length;

  const onesInRow = new Uint8Array(rowCount);
  const onesInColumn = new Uint8Array(columnCount);

  // For each row, store the column index of its first encountered '1'.
  // This value is only meaningful if the row contains exactly one '1'.
  const firstOneColumnIndexInRow = new Int16Array(rowCount);
  firstOneColumnIndexInRow.fill(-1);

  // Single traversal to count the number of '1's in each row and column.
  // At the same time, remember the first column where each row sees a '1'.
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = mat[rowIndex];

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (currentRow[columnIndex] !== 1) {
        continue;
      }

      // Increase row count and store the first '1' position.
      const updatedRowCount = onesInRow[rowIndex] + 1;
      onesInRow[rowIndex] = updatedRowCount;

      if (updatedRowCount === 1) {
        firstOneColumnIndexInRow[rowIndex] = columnIndex;
      }

      // Increase column count for later validation.
      onesInColumn[columnIndex]++;
    }
  }

  // Only rows with exactly one '1' can contain a special position.
  // For such rows, check whether the corresponding column also has exactly one '1'.
  let specialCount = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    if (onesInRow[rowIndex] !== 1) {
      continue;
    }

    const columnIndex = firstOneColumnIndexInRow[rowIndex];
    if (onesInColumn[columnIndex] !== 1) {
      continue;
    }

    specialCount++;
  }

  return specialCount;
}
