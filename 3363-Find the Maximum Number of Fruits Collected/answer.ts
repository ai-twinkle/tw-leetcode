function maxCollectedFruits(fruits: number[][]): number {
  const gridSize = fruits.length;
  let totalFruitsCollected = 0;
  const halfPoint = Math.ceil((gridSize - 1) / 2);

  // 1. Collect all fruits along the main diagonal for the child starting from (0,0).
  for (let index = 0; index < gridSize; index++) {
    totalFruitsCollected += fruits[index][index];
  }

  // 2. Dynamic programming for the child starting from (n-1, 0).
  // Use rolling arrays to reduce memory usage and increase cache efficiency.
  let previousColumn: Uint32Array = new Uint32Array(gridSize);
  let currentColumn: Uint32Array = new Uint32Array(gridSize);

  // Initialize only the starting cell as reachable.
  previousColumn[gridSize - 1] = fruits[gridSize - 1][0];

  // Traverse from column 1 to column n-2.
  for (let columnIndex = 1; columnIndex <= gridSize - 2; columnIndex++) {
    currentColumn.fill(0);
    const startRowIndex = columnIndex <= halfPoint - 1 ? gridSize - columnIndex - 1 : columnIndex + 1;
    for (let rowIndex = startRowIndex; rowIndex < gridSize; rowIndex++) {
      let maximumFromPrevious = previousColumn[rowIndex]; // From (rowIndex, columnIndex-1)
      if (rowIndex > 0 && previousColumn[rowIndex - 1] > maximumFromPrevious) {
        maximumFromPrevious = previousColumn[rowIndex - 1]; // From (rowIndex-1, columnIndex-1)
      }
      if (rowIndex + 1 < gridSize && previousColumn[rowIndex + 1] > maximumFromPrevious) {
        maximumFromPrevious = previousColumn[rowIndex + 1]; // From (rowIndex+1, columnIndex-1)
      }
      currentColumn[rowIndex] = maximumFromPrevious + fruits[rowIndex][columnIndex];
    }
    // Swap references for the next column.
    [previousColumn, currentColumn] = [currentColumn, previousColumn];
  }
  // The cell (n-1, n-2) contains the best result for this child.
  totalFruitsCollected += previousColumn[gridSize - 1];

  // 3. Dynamic programming for the child starting from (0, n-1).
  previousColumn = new Uint32Array(gridSize);
  currentColumn = new Uint32Array(gridSize);

  // Initialize only the starting cell as reachable.
  previousColumn[gridSize - 1] = fruits[0][gridSize - 1];

  // Traverse from row 1 to row n-2.
  for (let rowIndex = 1; rowIndex <= gridSize - 2; rowIndex++) {
    currentColumn.fill(0);
    const startColumnIndex = rowIndex <= halfPoint - 1 ? gridSize - rowIndex - 1 : rowIndex + 1;
    for (let columnIndex = startColumnIndex; columnIndex < gridSize; columnIndex++) {
      let maximumFromPrevious = previousColumn[columnIndex]; // From (rowIndex-1, columnIndex)
      if (columnIndex > 0 && previousColumn[columnIndex - 1] > maximumFromPrevious) {
        maximumFromPrevious = previousColumn[columnIndex - 1]; // From (rowIndex-1, columnIndex-1)
      }
      if (columnIndex + 1 < gridSize && previousColumn[columnIndex + 1] > maximumFromPrevious) {
        maximumFromPrevious = previousColumn[columnIndex + 1]; // From (rowIndex-1, columnIndex+1)
      }
      currentColumn[columnIndex] = maximumFromPrevious + fruits[rowIndex][columnIndex];
    }
    // Swap references for the next row.
    [previousColumn, currentColumn] = [currentColumn, previousColumn];
  }
  // The cell (n-2, n-1) contains the best result for this child.
  totalFruitsCollected += previousColumn[gridSize - 1];

  return totalFruitsCollected;
}
