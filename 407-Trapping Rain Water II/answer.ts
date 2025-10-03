const MAX_HEIGHT = 20000;

/**
 * Compute trapped water in a 2D height map using a bucketed priority queue.
 * Optimized with typed arrays and flattened grid for cache locality.
 *
 * @param {number[][]} heightMap - Matrix of non-negative heights (m x n)
 * @return {number} Total volume of trapped water
 */
function trapRainWater(heightMap: number[][]): number {
  const rowCount = heightMap.length;
  const columnCount = heightMap[0].length;

  // Early exit: cannot trap water if either dimension is less than 3
  if (rowCount < 3 || columnCount < 3) {
    return 0;
  }

  const cellCount = rowCount * columnCount;

  // Allocate typed arrays for performance and cache locality
  const cellHeights = new Int32Array(cellCount);
  const visitedCells = new Uint8Array(cellCount);
  const bucketHead = new Int32Array(MAX_HEIGHT + 1).fill(-1);
  const nextCellLink = new Int32Array(cellCount);
  const rowOfCell = new Uint16Array(cellCount);
  const columnOfCell = new Uint16Array(cellCount);

  // Flatten the input matrix into 1D and precompute row/column for each index
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowReference = heightMap[rowIndex];
    const baseIndex = rowIndex * columnCount;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const flatIndex = baseIndex + columnIndex;
      cellHeights[flatIndex] = rowReference[columnIndex] | 0;
      rowOfCell[flatIndex] = rowIndex;
      columnOfCell[flatIndex] = columnIndex;
    }
  }

  // Push a cell index into the corresponding height bucket
  const pushToBucket = (height: number, flatIndex: number): void => {
    nextCellLink[flatIndex] = bucketHead[height];
    bucketHead[height] = flatIndex;
  };

  // Add boundary cells to buckets and mark them visited
  let minimumBoundaryHeight = MAX_HEIGHT;
  let queueCount = 0;
  const enqueueBoundary = (flatIndex: number): void => {
    if (visitedCells[flatIndex] === 0) {
      visitedCells[flatIndex] = 1;
      const cellHeight = cellHeights[flatIndex];
      pushToBucket(cellHeight, flatIndex);
      if (cellHeight < minimumBoundaryHeight) {
        minimumBoundaryHeight = cellHeight;
      }
      queueCount++;
    }
  };

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    enqueueBoundary(columnIndex); // top row
    enqueueBoundary((rowCount - 1) * columnCount + columnIndex); // bottom row
  }
  for (let rowIndex = 1; rowIndex < rowCount - 1; rowIndex++) {
    enqueueBoundary(rowIndex * columnCount); // left column
    enqueueBoundary(rowIndex * columnCount + columnCount - 1); // right column
  }

  // Track the current water level
  let currentHeightLevel = minimumBoundaryHeight;
  let totalTrappedWater = 0;

  // Expand inward using bucket-based best-first search
  while (queueCount > 0) {
    // Find next non-empty bucket if the current one is empty
    while (currentHeightLevel <= MAX_HEIGHT && bucketHead[currentHeightLevel] === -1) {
      currentHeightLevel++;
    }
    if (currentHeightLevel > MAX_HEIGHT) {
      break;
    }

    // Pop one cell from the bucket
    const flatIndex = bucketHead[currentHeightLevel];
    bucketHead[currentHeightLevel] = nextCellLink[flatIndex];
    queueCount--;

    const rowIndex = rowOfCell[flatIndex];
    const columnIndex = columnOfCell[flatIndex];

    // Explore four neighbors
    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
      let neighborIndex: number | undefined;

      if (directionIndex === 0 && columnIndex + 1 < columnCount) {
        neighborIndex = flatIndex + 1;
      } else if (directionIndex === 1 && columnIndex > 0) {
        neighborIndex = flatIndex - 1;
      } else if (directionIndex === 2 && rowIndex + 1 < rowCount) {
        neighborIndex = flatIndex + columnCount;
      } else if (directionIndex === 3 && rowIndex > 0) {
        neighborIndex = flatIndex - columnCount;
      } else {
        continue;
      }

      if (visitedCells[neighborIndex] === 1) {
        continue;
      }
      visitedCells[neighborIndex] = 1;

      const neighborHeight = cellHeights[neighborIndex];
      if (currentHeightLevel > neighborHeight) {
        totalTrappedWater += currentHeightLevel - neighborHeight;
        pushToBucket(currentHeightLevel, neighborIndex);
      } else {
        pushToBucket(neighborHeight, neighborIndex);
      }
      queueCount++;
    }
  }

  return totalTrappedWater;
}
