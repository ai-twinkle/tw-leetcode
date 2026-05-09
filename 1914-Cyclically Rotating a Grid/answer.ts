function rotateGrid(grid: number[][], k: number): number[][] {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const layerCount = (rowCount < columnCount ? rowCount : columnCount) >> 1;

  // Reusable typed buffer sized for the largest possible perimeter (outermost layer)
  const perimeterBuffer = new Int32Array(2 * (rowCount + columnCount));

  for (let layer = 0; layer < layerCount; ++layer) {
    const topRow = layer;
    const bottomRow = rowCount - layer - 1;
    const leftColumn = layer;
    const rightColumn = columnCount - layer - 1;
    const layerHeight = bottomRow - topRow;
    const layerWidth = rightColumn - leftColumn;
    const perimeterLength = (layerHeight + layerWidth) << 1;

    // Read the perimeter in counter-clockwise order into the buffer
    let writeIndex = 0;
    // Left column going down (top -> bottom-1)
    for (let row = topRow; row < bottomRow; ++row) {
      perimeterBuffer[writeIndex++] = grid[row][leftColumn];
    }
    // Bottom row going right (left -> right-1)
    const bottomGridRow = grid[bottomRow];
    for (let column = leftColumn; column < rightColumn; ++column) {
      perimeterBuffer[writeIndex++] = bottomGridRow[column];
    }
    // Right column going up (bottom -> top+1)
    for (let row = bottomRow; row > topRow; --row) {
      perimeterBuffer[writeIndex++] = grid[row][rightColumn];
    }
    // Top row going left (right -> left+1)
    const topGridRow = grid[topRow];
    for (let column = rightColumn; column > leftColumn; --column) {
      perimeterBuffer[writeIndex++] = topGridRow[column];
    }

    // Effective rotation count for this layer
    const effectiveShift = k % perimeterLength;
    // Each element moves into its CCW-adjacent slot, so position i receives the value from position (i - shift)
    // Starting read pointer is (perimeterLength - effectiveShift), normalized to zero when shift is zero
    let readIndex = perimeterLength - effectiveShift;
    if (readIndex === perimeterLength) {
      readIndex = 0;
    }

    // Walk the perimeter again, writing values; replace per-element modulo with a cheap wrap check
    // Left column going down
    for (let row = topRow; row < bottomRow; ++row) {
      grid[row][leftColumn] = perimeterBuffer[readIndex];
      ++readIndex;
      // Wrap around once when reaching the end of the buffer
      if (readIndex === perimeterLength) {
        readIndex = 0;
      }
    }
    // Bottom row going right
    for (let column = leftColumn; column < rightColumn; ++column) {
      bottomGridRow[column] = perimeterBuffer[readIndex];
      ++readIndex;
      if (readIndex === perimeterLength) {
        readIndex = 0;
      }
    }
    // Right column going up
    for (let row = bottomRow; row > topRow; --row) {
      grid[row][rightColumn] = perimeterBuffer[readIndex];
      ++readIndex;
      if (readIndex === perimeterLength) {
        readIndex = 0;
      }
    }
    // Top row going left
    for (let column = rightColumn; column > leftColumn; --column) {
      topGridRow[column] = perimeterBuffer[readIndex];
      ++readIndex;
      if (readIndex === perimeterLength) {
        readIndex = 0;
      }
    }
  }

  return grid;
}
