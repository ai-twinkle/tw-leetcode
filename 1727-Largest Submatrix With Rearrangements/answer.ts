/**
 * Return the largest all-1 submatrix area after reordering columns optimally.
 *
 * @param matrix - The binary matrix
 * @returns The maximum possible area
 */
function largestSubmatrix(matrix: number[][]): number {
  const rowCount = matrix.length;
  const columnCount = matrix[0].length;
  const heightByColumn = new Uint32Array(columnCount);

  if (rowCount <= columnCount) {
    return getMaximumAreaByCounting(matrix, rowCount, columnCount, heightByColumn);
  }

  return getMaximumAreaBySorting(matrix, rowCount, columnCount, heightByColumn);
}

/**
 * Use height counting when the row count is small enough.
 *
 * @param matrix - The binary matrix
 * @param rowCount - Total number of rows
 * @param columnCount - Total number of columns
 * @param heightByColumn - Reusable height buffer
 * @returns The maximum possible area
 */
function getMaximumAreaByCounting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  const frequencyByHeight = new Uint32Array(rowCount + 1);
  let maximumArea = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = matrix[rowIndex];

    // Update the histogram height for each column
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (currentRow[columnIndex] === 0) {
        heightByColumn[columnIndex] = 0;
      } else {
        heightByColumn[columnIndex] += 1;
      }
    }

    // Count how many columns have each height
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const height = heightByColumn[columnIndex];
      frequencyByHeight[height] += 1;
    }

    let width = 0;

    // Try larger heights first after virtual column reordering
    for (let height = rowIndex + 1; height >= 1; height--) {
      width += frequencyByHeight[height];
      const area = width * height;

      if (area > maximumArea) {
        maximumArea = area;
      }
    }

    // Clear used counters for the next row
    for (let height = 0; height <= rowIndex + 1; height++) {
      frequencyByHeight[height] = 0;
    }
  }

  return maximumArea;
}

/**
 * Use sorting when the column count is small.
 *
 * @param matrix - The binary matrix
 * @param rowCount - Total number of rows
 * @param columnCount - Total number of columns
 * @param heightByColumn - Reusable height buffer
 * @returns The maximum possible area
 */
function getMaximumAreaBySorting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  const sortedHeightArray = new Uint32Array(columnCount);
  let maximumArea = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = matrix[rowIndex];

    // Update the histogram height for each column
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (currentRow[columnIndex] === 0) {
        heightByColumn[columnIndex] = 0;
      } else {
        heightByColumn[columnIndex] += 1;
      }
    }

    // Reuse the same typed array for sorting
    sortedHeightArray.set(heightByColumn);
    sortedHeightArray.sort();

    // Traverse from the largest height to the smallest
    for (let sortedIndex = columnCount - 1; sortedIndex >= 0; sortedIndex--) {
      const height = sortedHeightArray[sortedIndex];

      if (height === 0) {
        break;
      }

      const width = columnCount - sortedIndex;
      const area = height * width;

      if (area > maximumArea) {
        maximumArea = area;
      }
    }
  }

  return maximumArea;
}
