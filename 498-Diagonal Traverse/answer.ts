function findDiagonalOrder(mat: number[][]): number[] {
  const totalRows = mat.length;
  const totalColumns = mat[0].length;
  const totalElements = totalRows * totalColumns;

  const result = new Array(totalElements);
  let writeIndex = 0;

  // Total number of diagonals = rows + cols - 1
  const totalDiagonals = totalRows + totalColumns - 1;

  for (let diagonalSum = 0; diagonalSum < totalDiagonals; diagonalSum++) {
    // Row range for this diagonal
    const rowStart = Math.max(0, diagonalSum - (totalColumns - 1));
    const rowEnd = Math.min(totalRows - 1, diagonalSum);

    if ((diagonalSum & 1) === 0) {
      // Even diagonal: traverse upward (row decreases)
      for (let row = rowEnd; row >= rowStart; row--) {
        const column = diagonalSum - row;
        result[writeIndex++] = mat[row][column];
      }
    } else {
      // Odd diagonal: traverse downward (row increases)
      for (let row = rowStart; row <= rowEnd; row++) {
        const column = diagonalSum - row;
        result[writeIndex++] = mat[row][column];
      }
    }
  }

  return result;
}
