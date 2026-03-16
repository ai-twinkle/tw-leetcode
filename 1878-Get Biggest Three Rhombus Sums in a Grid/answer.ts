/**
 * Maintain the biggest three distinct sums.
 */
class TopThreeDistinctSums {
  private first = 0;
  private second = 0;
  private third = 0;

  /**
   * Insert a candidate value into the top three distinct sums.
   *
   * @param value - The candidate value.
   */
  put(value: number): void {
    if (value > this.first) {
      this.third = this.second;
      this.second = this.first;
      this.first = value;
    } else if (value !== this.first && value > this.second) {
      this.third = this.second;
      this.second = value;
    } else if (value !== this.first && value !== this.second && value > this.third) {
      this.third = value;
    }
  }

  /**
   * Get the stored sums in descending order.
   *
   * @returns The biggest three distinct sums.
   */
  get(): number[] {
    const result = [this.first];

    if (this.second !== 0) {
      result.push(this.second);
    }

    if (this.third !== 0) {
      result.push(this.third);
    }

    return result;
  }
}

/**
 * Return the biggest three distinct rhombus border sums in descending order.
 *
 * @param grid - The input matrix.
 * @returns The biggest three distinct rhombus sums.
 */
function getBiggestThree(grid: number[][]): number[] {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const stride = columnCount + 2;

  // Store prefix sums for "\" diagonals.
  const downRightPrefix = new Int32Array((rowCount + 1) * stride);

  // Store prefix sums for "/" diagonals.
  const downLeftPrefix = new Int32Array((rowCount + 1) * stride);

  // Build both diagonal prefix sum tables.
  for (let row = 1; row <= rowCount; row++) {
    const currentRow = grid[row - 1];
    const currentBase = row * stride;
    const previousBase = (row - 1) * stride;

    for (let column = 1; column <= columnCount; column++) {
      const value = currentRow[column - 1];
      downRightPrefix[currentBase + column] =
        downRightPrefix[previousBase + column - 1] + value;
      downLeftPrefix[currentBase + column] =
        downLeftPrefix[previousBase + column + 1] + value;
    }
  }

  const topThreeDistinctSums = new TopThreeDistinctSums();

  for (let topRow = 0; topRow < rowCount; topRow++) {
    for (let topColumn = 0; topColumn < columnCount; topColumn++) {
      // A single cell is also a valid rhombus.
      topThreeDistinctSums.put(grid[topRow][topColumn]);

      const maxRadiusByBottom = (rowCount - 1 - topRow) >> 1;
      const maxRadiusByLeft = topColumn;
      const maxRadiusByRight = columnCount - 1 - topColumn;

      let maxRadius = maxRadiusByBottom;

      if (maxRadiusByLeft < maxRadius) {
        maxRadius = maxRadiusByLeft;
      }

      if (maxRadiusByRight < maxRadius) {
        maxRadius = maxRadiusByRight;
      }

      // Enumerate all rhombuses with the current cell as the top corner.
      for (let radius = 1; radius <= maxRadius; radius++) {
        // Compute the four corners of the rhombus.
        const middleRow = topRow + radius;
        const bottomRow = middleRow + radius;
        const leftColumn = topColumn - radius;
        const rightColumn = topColumn + radius;

        // Query the four border edges from the diagonal prefix sums.
        const upperLeftEdge =
          downLeftPrefix[(middleRow + 1) * stride + (leftColumn + 1)] -
          downLeftPrefix[topRow * stride + (topColumn + 2)];
        const upperRightEdge =
          downRightPrefix[(middleRow + 1) * stride + (rightColumn + 1)] -
          downRightPrefix[topRow * stride + topColumn];
        const lowerLeftEdge =
          downRightPrefix[(bottomRow + 1) * stride + (topColumn + 1)] -
          downRightPrefix[middleRow * stride + leftColumn];
        const lowerRightEdge =
          downLeftPrefix[(bottomRow + 1) * stride + (topColumn + 1)] -
          downLeftPrefix[middleRow * stride + (rightColumn + 2)];

        // Merge all four edges, then remove the duplicated corners.
        const rhombusSum =
          upperLeftEdge +
          upperRightEdge +
          lowerLeftEdge +
          lowerRightEdge -
          grid[topRow][topColumn] -
          grid[middleRow][leftColumn] -
          grid[middleRow][rightColumn] -
          grid[bottomRow][topColumn];

        topThreeDistinctSums.put(rhombusSum);
      }
    }
  }

  return topThreeDistinctSums.get();
}
