function highestPeak(isWater: number[][]): number[][] {
  const rowCount = isWater.length;
  if (rowCount === 0) {
    return [];
  }

  const columnCount = isWater[0].length;
  const totalCells = rowCount * columnCount;
  const maximumPossibleHeight = rowCount + columnCount;

  // 1. Allocate and initialize flat height buffer
  const flatHeightBuffer = new Int16Array(totalCells);
  flatHeightBuffer.fill(maximumPossibleHeight);

  // 2. First pass: top‐left → bottom‐right
  let currentIndex = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const waterRow = isWater[rowIndex];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, currentIndex++) {
      if (waterRow[columnIndex] === 1) {
        flatHeightBuffer[currentIndex] = 0;
      } else {
        let bestHeight = flatHeightBuffer[currentIndex];

        // from above
        if (rowIndex > 0) {
          const heightFromAbove = flatHeightBuffer[currentIndex - columnCount] + 1;
          if (heightFromAbove < bestHeight) {
            bestHeight = heightFromAbove;
          }
        }

        // from left
        if (columnIndex > 0) {
          const heightFromLeft = flatHeightBuffer[currentIndex - 1] + 1;
          if (heightFromLeft < bestHeight) {
            bestHeight = heightFromLeft;
          }
        }

        flatHeightBuffer[currentIndex] = bestHeight;
      }
    }
  }

  // 3. Second pass: bottom‐right → top‐left
  currentIndex = totalCells - 1;
  for (let rowIndex = rowCount - 1; rowIndex >= 0; rowIndex--) {
    for (let columnIndex = columnCount - 1; columnIndex >= 0; columnIndex--, currentIndex--) {
      let bestHeight = flatHeightBuffer[currentIndex];

      // from below
      if (rowIndex < rowCount - 1) {
        const heightFromBelow = flatHeightBuffer[currentIndex + columnCount] + 1;
        if (heightFromBelow < bestHeight) {
          bestHeight = heightFromBelow;
        }
      }

      // from right
      if (columnIndex < columnCount - 1) {
        const heightFromRight = flatHeightBuffer[currentIndex + 1] + 1;
        if (heightFromRight < bestHeight) {
          bestHeight = heightFromRight;
        }
      }

      flatHeightBuffer[currentIndex] = bestHeight;
    }
  }

  // 4. Un-flatten into 2D result matrix
  const heightMatrix: number[][] = new Array(rowCount);
  let writeIndex = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const resultRow = new Array<number>(columnCount);
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, writeIndex++) {
      resultRow[columnIndex] = flatHeightBuffer[writeIndex];
    }
    heightMatrix[rowIndex] = resultRow;
  }

  return heightMatrix;
}
