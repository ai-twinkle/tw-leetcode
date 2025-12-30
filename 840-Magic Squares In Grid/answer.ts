/**
 * Checks whether the 3x3 subgrid with its top-left corner at (topRowIndex, leftColumnIndex)
 * forms a valid 3x3 magic square using numbers 1..9 exactly once.
 *
 * @param grid - 2D grid of integers
 * @param topRowIndex - Top row index of the 3x3 subgrid
 * @param leftColumnIndex - Left column index of the 3x3 subgrid
 * @return True if the 3x3 subgrid is a magic square
 */
function isMagicSquareAt(grid: number[][], topRowIndex: number, leftColumnIndex: number): boolean {
  // A Lo Shu 3x3 magic square must have 5 in the center
  if (grid[topRowIndex + 1][leftColumnIndex + 1] !== 5) {
    return false;
  }

  const seenValues = new Set<number>();

  // Check values are 1...9 and all distinct
  for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
    for (let columnOffset = 0; columnOffset < 3; columnOffset++) {
      const value = grid[topRowIndex + rowOffset][leftColumnIndex + columnOffset];

      if (value < 1 || value > 9 || seenValues.has(value)) {
        return false;
      }

      seenValues.add(value);
    }
  }

  const targetSum =
    grid[topRowIndex][leftColumnIndex] +
    grid[topRowIndex][leftColumnIndex + 1] +
    grid[topRowIndex][leftColumnIndex + 2];

  // Verify all rows and columns match the target sum
  for (let offset = 0; offset < 3; offset++) {
    const rowSum =
      grid[topRowIndex + offset][leftColumnIndex] +
      grid[topRowIndex + offset][leftColumnIndex + 1] +
      grid[topRowIndex + offset][leftColumnIndex + 2];

    if (rowSum !== targetSum) {
      return false;
    }

    const columnSum =
      grid[topRowIndex][leftColumnIndex + offset] +
      grid[topRowIndex + 1][leftColumnIndex + offset] +
      grid[topRowIndex + 2][leftColumnIndex + offset];

    if (columnSum !== targetSum) {
      return false;
    }
  }

  return true;
}

/**
 * Counts how many 3x3 magic-square subgrids exist in the given grid.
 *
 * @param grid - 2D grid of integers
 * @return The number of 3x3 magic-square subgrids
 */
function numMagicSquaresInside(grid: number[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  let magicSquareCount = 0;

  // Slide a 3x3 window across the grid
  for (let topRowIndex = 0; topRowIndex <= rowCount - 3; topRowIndex++) {
    for (let leftColumnIndex = 0; leftColumnIndex <= columnCount - 3; leftColumnIndex++) {
      if (isMagicSquareAt(grid, topRowIndex, leftColumnIndex)) {
        magicSquareCount++;
      }
    }
  }

  return magicSquareCount;
}
