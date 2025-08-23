// Global cache for repeated queries
const minimumSumResultCache = new Map<string, number>();

function minimumSum(grid: number[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // 1. Build a cache key for repeated queries
  let cacheKeyBuilder = "";
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    cacheKeyBuilder += grid[rowIndex].join("");
  }
  const cacheKey = `${rowCount}x${columnCount}:${cacheKeyBuilder}`;
  if (minimumSumResultCache.has(cacheKey)) {
    return minimumSumResultCache.get(cacheKey)!;
  }

  // 2. Copy grid into typed arrays for efficient memory access
  const binaryGrid = new Array<Uint8Array>(rowCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowArray = new Uint8Array(columnCount);
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      rowArray[columnIndex] = grid[rowIndex][columnIndex] as 0 | 1;
    }
    binaryGrid[rowIndex] = rowArray;
  }

  // 3. Row prefix sums for O(1) horizontal queries
  const rowPrefixSum = new Array<Int32Array>(rowCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const prefix = new Int32Array(columnCount + 1);
    let sum = 0;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      sum += binaryGrid[rowIndex][columnIndex];
      prefix[columnIndex + 1] = sum;
    }
    rowPrefixSum[rowIndex] = prefix;
  }

  // 4. Column prefix sums for O(1) vertical queries
  const columnPrefixSum = new Array<Int32Array>(columnCount);
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const prefix = new Int32Array(rowCount + 1);
    let sum = 0;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      sum += binaryGrid[rowIndex][columnIndex];
      prefix[rowIndex + 1] = sum;
    }
    columnPrefixSum[columnIndex] = prefix;
  }

  // 5. 2D prefix sum for O(1) submatrix queries
  const stride = columnCount + 1;
  const twoDimensionalPrefixSum = new Int32Array((rowCount + 1) * (columnCount + 1));
  for (let rowIndex = 1; rowIndex <= rowCount; rowIndex++) {
    let rowSum = 0;
    for (let columnIndex = 1; columnIndex <= columnCount; columnIndex++) {
      rowSum += binaryGrid[rowIndex - 1][columnIndex - 1];
      twoDimensionalPrefixSum[rowIndex * stride + columnIndex] =
        twoDimensionalPrefixSum[(rowIndex - 1) * stride + columnIndex] + rowSum;
    }
  }

  // 6. Helper functions
  const countOnesInRegion = (
    rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
  ): number => {
    const r1 = rowStart;
    const r2 = rowEnd + 1;
    const c1 = columnStart;
    const c2 = columnEnd + 1;
    return (
      twoDimensionalPrefixSum[r2 * stride + c2] -
      twoDimensionalPrefixSum[r1 * stride + c2] -
      twoDimensionalPrefixSum[r2 * stride + c1] +
      twoDimensionalPrefixSum[r1 * stride + c1]
    );
  }

  const countOnesInRowRange = (
    rowIndex: number, columnStart: number, columnEnd: number
  ): number => {
    return rowPrefixSum[rowIndex][columnEnd + 1] - rowPrefixSum[rowIndex][columnStart];
  }

  const countOnesInColumnRange = (
    columnIndex: number, rowStart: number, rowEnd: number
  ): number => {
    return columnPrefixSum[columnIndex][rowEnd + 1] - columnPrefixSum[columnIndex][rowStart];
  }

  // 7. Cache for bounding-box computations
  const singleRegionAreaCache = new Map<number, number>();
  const encodeRegion = (
    rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
  ): number => {
    return (rowStart << 24) | (rowEnd << 16) | (columnStart << 8) | columnEnd;
  }

  // 8. Compute the tight bounding box area of a region
  const computeTightBoundingArea = (
    rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
  ): number => {
    const code = encodeRegion(rowStart, rowEnd, columnStart, columnEnd);
    if (singleRegionAreaCache.has(code)) {
      return singleRegionAreaCache.get(code)!;
    }

    if (countOnesInRegion(rowStart, rowEnd, columnStart, columnEnd) === 0) {
      singleRegionAreaCache.set(code, -1);
      return -1;
    }

    // Find minimal bounding box rows
    let minRow = -1, maxRow = -1;
    for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex++) {
      if (countOnesInRowRange(rowIndex, columnStart, columnEnd) > 0) {
        minRow = rowIndex;
        break;
      }
    }
    for (let rowIndex = rowEnd; rowIndex >= rowStart; rowIndex--) {
      if (countOnesInRowRange(rowIndex, columnStart, columnEnd) > 0) {
        maxRow = rowIndex;
        break;
      }
    }

    // Find minimal bounding box columns
    let minColumn = -1, maxColumn = -1;
    for (let columnIndex = columnStart; columnIndex <= columnEnd; columnIndex++) {
      if (countOnesInColumnRange(columnIndex, rowStart, rowEnd) > 0) {
        minColumn = columnIndex;
        break;
      }
    }
    for (let columnIndex = columnEnd; columnIndex >= columnStart; columnIndex--) {
      if (countOnesInColumnRange(columnIndex, rowStart, rowEnd) > 0) {
        maxColumn = columnIndex;
        break;
      }
    }

    const area = (maxRow - minRow + 1) * (maxColumn - minColumn + 1);
    singleRegionAreaCache.set(code, area);
    return area;
  }

  // 9. Compute best split into two rectangles inside a region
  const computeBestTwoRectangles = (
    rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
  ): number => {
    let best = Number.POSITIVE_INFINITY;

    // Vertical split
    for (let splitColumn = columnStart; splitColumn < columnEnd; splitColumn++) {
      const leftArea = computeTightBoundingArea(rowStart, rowEnd, columnStart, splitColumn);
      const rightArea = computeTightBoundingArea(rowStart, rowEnd, splitColumn + 1, columnEnd);
      if (leftArea !== -1 && rightArea !== -1) {
        best = Math.min(best, leftArea + rightArea);
      }
    }

    // Horizontal split
    for (let splitRow = rowStart; splitRow < rowEnd; splitRow++) {
      const topArea = computeTightBoundingArea(rowStart, splitRow, columnStart, columnEnd);
      const bottomArea = computeTightBoundingArea(splitRow + 1, rowEnd, columnStart, columnEnd);
      if (topArea !== -1 && bottomArea !== -1) {
        best = Math.min(best, topArea + bottomArea);
      }
    }

    return best;
  }

  // 10. Enumerate all partition strategies for 3 rectangles
  let minimumAnswer = Number.POSITIVE_INFINITY;

  // Three vertical strips
  for (let firstCut = 0; firstCut <= columnCount - 3; firstCut++) {
    for (let secondCut = firstCut + 1; secondCut <= columnCount - 2; secondCut++) {
      const area1 = computeTightBoundingArea(0, rowCount - 1, 0, firstCut);
      const area2 = computeTightBoundingArea(0, rowCount - 1, firstCut + 1, secondCut);
      const area3 = computeTightBoundingArea(0, rowCount - 1, secondCut + 1, columnCount - 1);
      if (area1 !== -1 && area2 !== -1 && area3 !== -1) {
        minimumAnswer = Math.min(minimumAnswer, area1 + area2 + area3);
      }
    }
  }

  // Three horizontal strips
  for (let firstCut = 0; firstCut <= rowCount - 3; firstCut++) {
    for (let secondCut = firstCut + 1; secondCut <= rowCount - 2; secondCut++) {
      const area1 = computeTightBoundingArea(0, firstCut, 0, columnCount - 1);
      const area2 = computeTightBoundingArea(firstCut + 1, secondCut, 0, columnCount - 1);
      const area3 = computeTightBoundingArea(secondCut + 1, rowCount - 1, 0, columnCount - 1);
      if (area1 !== -1 && area2 !== -1 && area3 !== -1) {
        minimumAnswer = Math.min(minimumAnswer, area1 + area2 + area3);
      }
    }
  }

  // One rectangle + two rectangles (vertical cut)
  for (let cutColumn = 0; cutColumn < columnCount - 1; cutColumn++) {
    const leftArea = computeTightBoundingArea(0, rowCount - 1, 0, cutColumn);
    const rightArea = computeTightBoundingArea(0, rowCount - 1, cutColumn + 1, columnCount - 1);

    if (leftArea !== -1) {
      const bestRight = computeBestTwoRectangles(0, rowCount - 1, cutColumn + 1, columnCount - 1);
      if (bestRight < Number.POSITIVE_INFINITY) {
        minimumAnswer = Math.min(minimumAnswer, leftArea + bestRight);
      }
    }
    if (rightArea !== -1) {
      const bestLeft = computeBestTwoRectangles(0, rowCount - 1, 0, cutColumn);
      if (bestLeft < Number.POSITIVE_INFINITY) {
        minimumAnswer = Math.min(minimumAnswer, rightArea + bestLeft);
      }
    }
  }

  // One rectangle + two rectangles (horizontal cut)
  for (let cutRow = 0; cutRow < rowCount - 1; cutRow++) {
    const topArea = computeTightBoundingArea(0, cutRow, 0, columnCount - 1);
    const bottomArea = computeTightBoundingArea(cutRow + 1, rowCount - 1, 0, columnCount - 1);

    if (topArea !== -1) {
      const bestBottom = computeBestTwoRectangles(cutRow + 1, rowCount - 1, 0, columnCount - 1);
      if (bestBottom < Number.POSITIVE_INFINITY) {
        minimumAnswer = Math.min(minimumAnswer, topArea + bestBottom);
      }
    }
    if (bottomArea !== -1) {
      const bestTop = computeBestTwoRectangles(0, cutRow, 0, columnCount - 1);
      if (bestTop < Number.POSITIVE_INFINITY) {
        minimumAnswer = Math.min(minimumAnswer, bottomArea + bestTop);
      }
    }
  }

  // 11. Store in cache and return
  minimumSumResultCache.set(cacheKey, minimumAnswer);
  return minimumAnswer;
}
