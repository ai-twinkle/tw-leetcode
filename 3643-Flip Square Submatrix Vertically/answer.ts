function reverseSubmatrix(grid: number[][], x: number, y: number, k: number): number[][] {
  let topRowIndex = x;
  let bottomRowIndex = x + k - 1;

  // The last column index within the submatrix boundary
  const endColumnIndex = y + k - 1;

  // Converge top and bottom row pointers inward, swapping each row pair
  while (topRowIndex < bottomRowIndex) {
    const topRow = grid[topRowIndex];
    const bottomRow = grid[bottomRowIndex];

    // Swap only the columns that fall within the submatrix, leaving the rest of the row untouched
    for (let columnIndex = y; columnIndex <= endColumnIndex; columnIndex++) {
      const temporary = topRow[columnIndex];
      topRow[columnIndex] = bottomRow[columnIndex];
      bottomRow[columnIndex] = temporary;
    }

    topRowIndex++;
    bottomRowIndex--;
  }

  return grid;
}
