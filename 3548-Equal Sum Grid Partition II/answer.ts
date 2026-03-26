function canPartitionGrid(grid: number[][]): boolean {
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Values are in [1, 10^5]; size 100_001 lets us use a cell value as a direct index
  const MAX_CELL_VALUE = 100_001;

  const rowSum = new Float64Array(numRows);
  const colSum = new Float64Array(numCols);

  // Counts how many times each value appears across the entire grid
  const totalValueFrequency = new Int32Array(MAX_CELL_VALUE);

  // Build row sums, col sums, and the global frequency table in one pass
  let totalSum = 0;
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const cellValue = grid[row][col];
      rowSum[row] += cellValue;
      colSum[col] += cellValue;
      totalValueFrequency[cellValue]++;
      totalSum += cellValue;
    }
  }

  // prefixRowSum[i] = sum of rows 0...i-1; enables topSum = prefixRowSum[cutRow] in O(1)
  const prefixRowSum = new Float64Array(numRows + 1);
  for (let row = 0; row < numRows; row++) {
    prefixRowSum[row + 1] = prefixRowSum[row] + rowSum[row];
  }

  // prefixColSum[j] = sum of cols 0...j-1; enables leftSum = prefixColSum[cutCol] in O(1)
  const prefixColSum = new Float64Array(numCols + 1);
  for (let col = 0; col < numCols; col++) {
    prefixColSum[col + 1] = prefixColSum[col] + colSum[col];
  }

  // =========================================================
  // Horizontal cuts — top section: rows [0, cutRow)
  //                   bottom section: rows [cutRow, numRows)
  // =========================================================

  // Tracks value frequencies for the top section only; grows row-by-row as cutRow advances.
  // Bottom section frequency is derived as: totalValueFrequency - topSectionFrequency
  const topSectionFrequency = new Int32Array(MAX_CELL_VALUE);

  for (let cutRow = 1; cutRow < numRows; cutRow++) {
    // Absorb row cutRow-1 into the top section before evaluating this cut position
    for (let col = 0; col < numCols; col++) {
      topSectionFrequency[grid[cutRow - 1][col]]++;
    }

    const topSum = prefixRowSum[cutRow];
    const bottomSum = totalSum - topSum;
    const sumDifference = topSum - bottomSum;

    // Sections are already balanced — valid cut with no discount
    if (sumDifference === 0) {
      return true;
    }

    const topRowCount = cutRow;
    const bottomRowCount = numRows - cutRow;

    if (sumDifference > 0 && sumDifference < MAX_CELL_VALUE) {
      // Top is heavier; we need to remove a cell worth exactly sumDifference from it
      const targetValue = sumDifference;

      if (topRowCount >= 2 && numCols >= 2) {
        // 2-D rectangle: no cell is a bridge, so any matching cell can be discounted
        if (topSectionFrequency[targetValue] > 0) {
          return true;
        }
      } else if (topRowCount === 1 && numCols >= 2) {
        // Horizontal strip: interior cells are bridges; only col-0 or last-col is safe
        if (grid[0][0] === targetValue || grid[0][numCols - 1] === targetValue) {
          return true;
        }
      } else if (topRowCount >= 2 && numCols === 1) {
        // Vertical strip: interior cells are bridges; only row-0 or last-row is safe
        if (grid[0][0] === targetValue || grid[topRowCount - 1][0] === targetValue) {
          return true;
        }
      }
      // topRowCount === 1 && numCols === 1: removing the sole cell empties the section — skip

    } else if (sumDifference < 0 && -sumDifference < MAX_CELL_VALUE) {
      // Bottom is heavier; we need to remove a cell worth exactly -sumDifference from it
      const targetValue = -sumDifference;

      if (bottomRowCount >= 2 && numCols >= 2) {
        // Subtract top section's count from total to get bottom section's count in O(1)
        if (totalValueFrequency[targetValue] - topSectionFrequency[targetValue] > 0) {
          return true;
        }
      } else if (bottomRowCount === 1 && numCols >= 2) {
        // Bottom is the final single row; only its two endpoints are non-bridges
        if (grid[numRows - 1][0] === targetValue || grid[numRows - 1][numCols - 1] === targetValue) {
          return true;
        }
      } else if (bottomRowCount >= 2 && numCols === 1) {
        // Bottom is a vertical strip; only its top end (cutRow) or bottom end is safe
        if (grid[cutRow][0] === targetValue || grid[numRows - 1][0] === targetValue) {
          return true;
        }
      }
      // bottomRowCount === 1 && numCols === 1: removing the sole cell empties the section — skip
    }
  }

  // =========================================================
  // Vertical cuts — left section: cols [0, cutCol)
  //                 right section: cols [cutCol, numCols)
  // =========================================================

  // Same incremental-frequency approach, now tracking left section value counts
  const leftSectionFrequency = new Int32Array(MAX_CELL_VALUE);

  for (let cutCol = 1; cutCol < numCols; cutCol++) {
    // Absorb col cutCol-1 into the left section before evaluating this cut position
    for (let row = 0; row < numRows; row++) {
      leftSectionFrequency[grid[row][cutCol - 1]]++;
    }

    const leftSum = prefixColSum[cutCol];
    const rightSum = totalSum - leftSum;
    const sumDifference = leftSum - rightSum;

    // Sections are already balanced — valid cut with no discount
    if (sumDifference === 0) {
      return true;
    }

    const leftColCount = cutCol;
    const rightColCount = numCols - cutCol;

    if (sumDifference > 0 && sumDifference < MAX_CELL_VALUE) {
      // Left is heavier; remove a cell worth exactly sumDifference from it
      const targetValue = sumDifference;

      if (numRows >= 2 && leftColCount >= 2) {
        // 2-D rectangle: any matching cell can be discounted safely
        if (leftSectionFrequency[targetValue] > 0) {
          return true;
        }
      } else if (numRows === 1 && leftColCount >= 2) {
        // Horizontal strip: only the two end columns (col-0 or last-col) are non-bridges
        if (grid[0][0] === targetValue || grid[0][leftColCount - 1] === targetValue) {
          return true;
        }
      } else if (numRows >= 2 && leftColCount === 1) {
        // Vertical strip: only the top or bottom cell is a non-bridge
        if (grid[0][0] === targetValue || grid[numRows - 1][0] === targetValue) {
          return true;
        }
      }
      // numRows === 1 && leftColCount === 1: removing the sole cell empties the section — skip

    } else if (sumDifference < 0 && -sumDifference < MAX_CELL_VALUE) {
      // Right is heavier; remove a cell worth exactly -sumDifference from it
      const targetValue = -sumDifference;

      if (numRows >= 2 && rightColCount >= 2) {
        // Derive right section count via subtraction to avoid an extra scan
        if (totalValueFrequency[targetValue] - leftSectionFrequency[targetValue] > 0) {
          return true;
        }
      } else if (numRows === 1 && rightColCount >= 2) {
        // Right section is a horizontal strip; only its two endpoints are safe
        if (grid[0][cutCol] === targetValue || grid[0][numCols - 1] === targetValue) {
          return true;
        }
      } else if (numRows >= 2 && rightColCount === 1) {
        // Right section is the last vertical strip; only its top or bottom cell is safe
        if (grid[0][numCols - 1] === targetValue || grid[numRows - 1][numCols - 1] === targetValue) {
          return true;
        }
      }
      // numRows === 1 && rightColCount === 1: removing the sole cell empties the section — skip
    }
  }

  return false;
}
