function minAbsDiff(grid: number[][], k: number): number[][] {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const outputRowCount = rowCount - k + 1;
  const outputColumnCount = columnCount - k + 1;
  const windowSize = k * k;

  const windowValues = new Int32Array(windowSize);

  // Flatten the 2D grid into 1D so each row is contiguous in memory
  const flatGrid = new Int32Array(rowCount * columnCount);
  for (let row = 0; row < rowCount; row++) {
    const gridRow = grid[row];
    const rowOffset = row * columnCount;
    for (let column = 0; column < columnCount; column++) {
      flatGrid[rowOffset + column] = gridRow[column];
    }
  }

  const result: number[][] = Array.from(
    { length: outputRowCount },
    () => new Array(outputColumnCount).fill(0),
  );

  for (let rowIndex = 0; rowIndex < outputRowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < outputColumnCount; columnIndex++) {
      let writePosition = 0;

      // Snapshot all values in the current k×k window into a flat buffer
      for (let windowRow = rowIndex; windowRow < rowIndex + k; windowRow++) {
        const rowOffset = windowRow * columnCount;
        for (let windowColumn = columnIndex; windowColumn < columnIndex + k; windowColumn++) {
          windowValues[writePosition++] = flatGrid[rowOffset + windowColumn];
        }
      }

      // Sorting brings the closest values adjacent, so one linear pass finds the minimum gap
      windowValues.sort();

      let minimumDifference = Number.MAX_SAFE_INTEGER;

      // Walk sorted pairs; the answer must be the gap between two neighboring values
      for (let position = 1; position < windowSize; position++) {
        const currentValue = windowValues[position];
        const previousValue = windowValues[position - 1];

        // Equal neighbors contribute no new gap; skip to avoid a zero result
        if (currentValue === previousValue) {
          continue;
        }

        const difference = currentValue - previousValue;
        if (difference < minimumDifference) {
          minimumDifference = difference;
        }

        // 1 is the smallest possible difference between two distinct integers; no need to look further
        if (minimumDifference === 1) {
          break;
        }
      }

      // minimumDifference stays at MAX_SAFE_INTEGER only when every value in the window is identical, which maps to 0 by the pre-filled default
      if (minimumDifference !== Number.MAX_SAFE_INTEGER) {
        result[rowIndex][columnIndex] = minimumDifference;
      }
    }
  }

  return result;
}
