function lenOfVDiagonal(grid: number[][]): number {
  const numberOfRows = grid.length;
  const numberOfColumns = grid[0].length;
  const totalSize = numberOfRows * numberOfColumns;

  // Step 1: Flatten grid into typed array
  const cellValues = new Uint8Array(totalSize);
  let index = 0;
  for (let row = 0; row < numberOfRows; row++) {
    const gridRow = grid[row];
    for (let column = 0; column < numberOfColumns; column++) {
      cellValues[index++] = gridRow[column];
    }
  }

  // Step 2: Prepare diagonal directions
  const rowDirection = new Int8Array([ 1,  1, -1, -1]);
  const columnDirection = new Int8Array([ 1, -1, -1,  1]);

  const directionStep = new Int32Array(4);
  for (let direction = 0; direction < 4; direction++) {
    directionStep[direction] = rowDirection[direction] * numberOfColumns + columnDirection[direction];
  }

  const counterClockwiseMap: Int8Array = new Int8Array([3, 0, 1, 2]);

  // Step 3: Forward DP -> sequences ending at each cell
  const endWithTwo = [0, 0, 0, 0].map(() => new Uint16Array(totalSize));
  const endWithZero = [0, 0, 0, 0].map(() => new Uint16Array(totalSize));

  for (let direction = 0; direction < 4; direction++) {
    const deltaRow = rowDirection[direction];
    const deltaColumn = columnDirection[direction];

    const startRow = deltaRow > 0 ? 0 : numberOfRows - 1;
    const endRow = deltaRow > 0 ? numberOfRows : -1;
    const stepRow = deltaRow > 0 ? 1 : -1;

    const startColumn = deltaColumn > 0 ? 0 : numberOfColumns - 1;
    const endColumn = deltaColumn > 0 ? numberOfColumns : -1;
    const stepColumn = deltaColumn > 0 ? 1 : -1;

    const endTwoArray = endWithTwo[direction];
    const endZeroArray = endWithZero[direction];

    for (let row = startRow; row !== endRow; row += stepRow) {
      const rowBase = row * numberOfColumns;
      const previousRow = row - deltaRow;
      const previousRowBase = (previousRow >= 0 && previousRow < numberOfRows) ? previousRow * numberOfColumns : -1;

      for (let column = startColumn; column !== endColumn; column += stepColumn) {
        const index = rowBase + column;
        const value = cellValues[index];

        const previousColumn = column - deltaColumn;
        const hasPrevious = (previousRow >= 0 && previousRow < numberOfRows && previousColumn >= 0 && previousColumn < numberOfColumns);
        const previousIndex = hasPrevious ? previousRowBase + previousColumn : -1;

        // Build sequence ending with 2
        if (value === 2) {
          let best = 0;

          if (hasPrevious) {
            if (cellValues[previousIndex] === 1) {
              best = 2; // Start: 1 -> 2
            }

            const previousEndZero = endZeroArray[previousIndex];
            if (previousEndZero !== 0) {
              const candidate = previousEndZero + 1; // Extend ...0 -> 2
              if (candidate > best) {
                best = candidate;
              }
            }
          }

          endTwoArray[index] = best;
        } else {
          endTwoArray[index] = 0;
        }

        // Build sequence ending with 0
        if (value === 0) {
          let length = 0;
          if (hasPrevious) {
            const previousEndTwo = endTwoArray[previousIndex];
            if (previousEndTwo !== 0) {
              length = previousEndTwo + 1; // Extend ...2 -> 0
            }
          }
          endZeroArray[index] = length;
        } else {
          endZeroArray[index] = 0;
        }
      }
    }
  }

  // Step 4: Backward DP -> sequences starting from each cell
  let bestAnswer = 0;

  for (let outgoingDirection = 0; outgoingDirection < 4; outgoingDirection++) {
    const deltaRow = rowDirection[outgoingDirection];
    const deltaColumn = columnDirection[outgoingDirection];

    const incomingDirection = counterClockwiseMap[outgoingDirection];
    const incomingEndTwo = endWithTwo[incomingDirection];
    const incomingEndZero = endWithZero[incomingDirection];

    const startRow = deltaRow > 0 ? numberOfRows - 1 : 0;
    const endRow = deltaRow > 0 ? -1 : numberOfRows;
    const stepRow = deltaRow > 0 ? -1 : 1;

    const startColumn = deltaColumn > 0 ? numberOfColumns - 1 : 0;
    const endColumn = deltaColumn > 0 ? -1 : numberOfColumns;
    const stepColumn = deltaColumn > 0 ? -1 : 1;

    const remainWithTwo = new Uint16Array(totalSize);
    const remainWithZero = new Uint16Array(totalSize);

    for (let row = startRow; row !== endRow; row += stepRow) {
      const rowBase = row * numberOfColumns;
      const nextRow = row + deltaRow;
      const nextRowBase = (nextRow >= 0 && nextRow < numberOfRows) ? nextRow * numberOfColumns : -1;

      for (let column = startColumn; column !== endColumn; column += stepColumn) {
        const index = rowBase + column;
        const value = cellValues[index];

        const nextColumn = column + deltaColumn;
        const hasNext = (nextRow >= 0 && nextRow < numberOfRows && nextColumn >= 0 && nextColumn < numberOfColumns);
        const nextIndex = hasNext ? nextRowBase + nextColumn : -1;

        const nextRemainTwo = hasNext ? remainWithTwo[nextIndex] : 0;
        const nextRemainZero = hasNext ? remainWithZero[nextIndex] : 0;

        let hereRemainTwo = 0;
        let hereRemainZero = 0;

        if (value === 2) {
          hereRemainTwo = nextRemainZero + 1; // Extend ...0 -> 2
        }

        if (value === 0) {
          hereRemainZero = nextRemainTwo + 1; // Extend ...2 -> 0
        }

        remainWithTwo[index] = hereRemainTwo;
        remainWithZero[index] = hereRemainZero;

        // Straight case: no turn
        if (value === 1) {
          const straightLength = nextRemainTwo + 1;
          if (straightLength > bestAnswer) {
            bestAnswer = straightLength;
          }
        }

        // Turn case: combine first leg and second leg
        const apexRow = row - deltaRow;
        const apexColumn = column - deltaColumn;
        if (apexRow >= 0 && apexRow < numberOfRows && apexColumn >= 0 && apexColumn < numberOfColumns) {
          const apexIndex = apexRow * numberOfColumns + apexColumn;
          const apexValue = cellValues[apexIndex];

          if (apexValue === 1) {
            const total = 1 + hereRemainTwo; // Turn after "1"
            if (total > bestAnswer) {
              bestAnswer = total;
            }
          } else if (apexValue === 2) {
            const firstLeg = incomingEndTwo[apexIndex];
            if (firstLeg !== 0) {
              const total = firstLeg + hereRemainZero; // Turn after "2"
              if (total > bestAnswer) {
                bestAnswer = total;
              }
            }
          } else {
            const firstLeg = incomingEndZero[apexIndex];
            if (firstLeg !== 0) {
              const total = firstLeg + hereRemainTwo; // Turn after "0"
              if (total > bestAnswer) {
                bestAnswer = total;
              }
            }
          }
        }
      }
    }
  }

  // Step 5: return best found length
  return bestAnswer;
}
