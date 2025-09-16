function largestIsland(grid: number[][]): number {
  const dimension = grid.length;
  const totalCells = dimension * dimension;

  // 1. Special case: handle smallest grid (1x1)
  if (totalCells === 1) {
    if (grid[0][0] === 1) {
      return 1;
    } else {
      return 1;
    }
  }

  // 2. Flatten the 2D grid into a 1D typed array
  const flatGrid = new Int32Array(totalCells);
  let zeroCount = 0;

  for (let row = 0; row < dimension; row++) {
    const rowBase = row * dimension;
    const rowArray = grid[row];

    for (let column = 0; column < dimension; column++) {
      const value = rowArray[column] | 0;
      flatGrid[rowBase + column] = value;

      if (value === 0) {
        zeroCount++;
      }
    }
  }

  // 3. Quick return if the grid has no zero → already full island
  if (zeroCount === 0) {
    return totalCells;
  }

  // 4. Label islands and compute their sizes (iterative DFS flood-fill)
  const islandSizes = new Int32Array(totalCells + 2);
  let islandId = 2;
  let maximumIslandSize = 0;

  // Pre-allocated stacks for flood-fill traversal
  const stackRow = new Int32Array(totalCells);
  const stackColumn = new Int32Array(totalCells);
  let stackSize = 0;

  for (let row = 0; row < dimension; row++) {
    const rowBase = row * dimension;

    for (let column = 0; column < dimension; column++) {
      const index = rowBase + column;

      if (flatGrid[index] !== 1) {
        continue;
      }

      // Start exploring a new island
      let currentSize = 0;
      stackRow[stackSize] = row;
      stackColumn[stackSize] = column;
      stackSize++;

      flatGrid[index] = islandId;

      // Flood-fill with stack
      while (stackSize > 0) {
        stackSize--;
        const currentRow = stackRow[stackSize];
        const currentColumn = stackColumn[stackSize];
        const currentBase = currentRow * dimension;
        currentSize++;

        // Explore Up
        if (currentRow > 0) {
          const upIndex = (currentRow - 1) * dimension + currentColumn;
          if (flatGrid[upIndex] === 1) {
            flatGrid[upIndex] = islandId;
            stackRow[stackSize] = currentRow - 1;
            stackColumn[stackSize] = currentColumn;
            stackSize++;
          }
        }

        // Explore Down
        if (currentRow + 1 < dimension) {
          const downIndex = (currentRow + 1) * dimension + currentColumn;
          if (flatGrid[downIndex] === 1) {
            flatGrid[downIndex] = islandId;
            stackRow[stackSize] = currentRow + 1;
            stackColumn[stackSize] = currentColumn;
            stackSize++;
          }
        }

        // Explore Left
        if (currentColumn > 0) {
          const leftIndex = currentBase + (currentColumn - 1);
          if (flatGrid[leftIndex] === 1) {
            flatGrid[leftIndex] = islandId;
            stackRow[stackSize] = currentRow;
            stackColumn[stackSize] = currentColumn - 1;
            stackSize++;
          }
        }

        // Explore Right
        if (currentColumn + 1 < dimension) {
          const rightIndex = currentBase + (currentColumn + 1);
          if (flatGrid[rightIndex] === 1) {
            flatGrid[rightIndex] = islandId;
            stackRow[stackSize] = currentRow;
            stackColumn[stackSize] = currentColumn + 1;
            stackSize++;
          }
        }
      }

      // Store computed island size
      islandSizes[islandId] = currentSize;
      if (currentSize > maximumIslandSize) {
        maximumIslandSize = currentSize;
      }

      islandId++;
    }
  }

  // 5. Try flipping each zero to one and merge with neighbors
  let bestResult = maximumIslandSize;

  for (let row = 0; row < dimension; row++) {
    const rowBase = row * dimension;

    for (let column = 0; column < dimension; column++) {
      const index = rowBase + column;

      if (flatGrid[index] !== 0) {
        continue;
      }

      // Collect neighboring island ids
      const upId = row > 0 ? flatGrid[(row - 1) * dimension + column] : 0;
      const downId = row + 1 < dimension ? flatGrid[(row + 1) * dimension + column] : 0;
      const leftId = column > 0 ? flatGrid[index - 1] : 0;
      const rightId = column + 1 < dimension ? flatGrid[index + 1] : 0;

      // Candidate island size (start with 1 for the flipped cell)
      let candidateSize = 1;

      if (upId > 1) {
        candidateSize += islandSizes[upId];
      }

      if (rightId > 1 && rightId !== upId) {
        candidateSize += islandSizes[rightId];
      }

      if (downId > 1 && downId !== upId && downId !== rightId) {
        candidateSize += islandSizes[downId];
      }

      if (leftId > 1 && leftId !== upId && leftId !== rightId && leftId !== downId) {
        candidateSize += islandSizes[leftId];
      }

      // Update best result
      if (candidateSize > bestResult) {
        bestResult = candidateSize;

        // Early exit if we reach full grid
        if (bestResult === totalCells) {
          return bestResult;
        }
      }
    }
  }

  // 6. If all were zero, flipping one creates an island of size 1
  if (bestResult === 0) {
    return 1;
  }

  return bestResult;
}
