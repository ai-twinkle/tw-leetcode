function countIslands(grid: number[][], k: number): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // A one-cell ring of zeros around the board makes every neighbour index valid,
  // so the flood fill needs no row/column bounds checks at all.
  const paddedWidth = columnCount + 2;
  const values = new Int32Array(paddedWidth * (rowCount + 2));

  let writeOffset = paddedWidth + 1;

  for (let row = 0; row < rowCount; row++) {
    const sourceRow = grid[row];

    for (let column = 0; column < columnCount; column++) {
      values[writeOffset + column] = sourceRow[column];
    }

    writeOffset += paddedWidth;
  }

  // Each cell is pushed at most once, so a flat Int32Array stack sized m * n never overflows.
  const stack = new Int32Array(rowCount * columnCount);
  let islandCount = 0;
  let scanOffset = paddedWidth + 1;

  for (let row = 0; row < rowCount; row++) {
    const rowEnd = scanOffset + columnCount;

    for (let index = scanOffset; index < rowEnd; index++) {
      const seedValue = values[index];

      if (seedValue === 0) {
        continue;
      }

      // Zeroing a cell as it is consumed doubles as the visited mark, so no visited array is needed.
      let total = seedValue;
      values[index] = 0;
      let stackTop = 0;
      stack[stackTop++] = index;

      while (stackTop > 0) {
        const current = stack[--stackTop];

        const left = current - 1;
        const leftValue = values[left];

        if (leftValue !== 0) {
          total += leftValue;
          values[left] = 0;
          stack[stackTop++] = left;
        }

        const right = current + 1;
        const rightValue = values[right];

        if (rightValue !== 0) {
          total += rightValue;
          values[right] = 0;
          stack[stackTop++] = right;
        }

        const up = current - paddedWidth;
        const upValue = values[up];

        if (upValue !== 0) {
          total += upValue;
          values[up] = 0;
          stack[stackTop++] = up;
        }

        const down = current + paddedWidth;
        const downValue = values[down];

        if (downValue !== 0) {
          total += downValue;
          values[down] = 0;
          stack[stackTop++] = down;
        }
      }

      // The island sum is at most 10^5 * 10^6 = 10^11, exact in a float64, so one modulo per island suffices.
      if (total % k === 0) {
        islandCount++;
      }
    }

    scanOffset += paddedWidth;
  }

  return islandCount;
}
