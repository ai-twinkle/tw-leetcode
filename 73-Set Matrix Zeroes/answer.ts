/**
 Do not return anything, modify matrix in-place instead.
 */
function setZeroes(matrix: number[][]): void {
  const rowCount = matrix.length;
  const columnCount = matrix[0].length;

  if (rowCount === 0) {
    return;
  }

  // Use Uint8Array for super-fast marking of rows/columns that must be zeroed
  const rowZeroMarks = new Uint8Array(rowCount);
  const columnZeroMarks = new Uint8Array(columnCount);

  // 1. Scan once to mark which rows & columns contain a zero
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = matrix[rowIndex];

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (currentRow[columnIndex] === 0) {
        rowZeroMarks[rowIndex] = 1;
        columnZeroMarks[columnIndex] = 1;
      }
    }
  }

  // 2. One more pass to zero out everything in any marked row or column
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = matrix[rowIndex];
    const isRowMarked = rowZeroMarks[rowIndex] === 1;

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (isRowMarked || columnZeroMarks[columnIndex] === 1) {
        currentRow[columnIndex] = 0;
      }
    }
  }
}
