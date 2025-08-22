function minimumArea(grid: number[][]): number {
  const numberOfRows = grid.length;
  const numberOfColumns = grid[0].length; // Rectangular per constraints

  // Sentinels chosen to avoid Infinity and enable branchless min/max updates
  let minimumRow = numberOfRows;
  let maximumRow = -1;
  let minimumColumn = numberOfColumns;
  let maximumColumn = -1;

  for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
    const row = grid[rowIndex];

    // Trim zeros from both ends to find first/last '1' in this row
    let left = 0;
    let right = numberOfColumns - 1;

    while (left <= right && row[left] === 0) left++;
    if (left > right) {
      continue; // This row has no '1'
    }
    while (row[right] === 0) {
      right--;
    }

    // Update global bounds
    if (rowIndex < minimumRow) {
      minimumRow = rowIndex;
    }
    if (rowIndex > maximumRow) {
      maximumRow = rowIndex;
    }
    if (left < minimumColumn) {
      minimumColumn = left;
    }
    if (right > maximumColumn) {
      maximumColumn = right;
    }

    // Early exit if bounding box already spans entire grid
    if (
      minimumRow === 0 &&
      maximumRow === numberOfRows - 1 &&
      minimumColumn === 0 &&
      maximumColumn === numberOfColumns - 1
    ) {
      return numberOfRows * numberOfColumns;
    }
  }

  // At least one '1' is guaranteed by the problem
  return (maximumRow - minimumRow + 1) * (maximumColumn - minimumColumn + 1);
}
