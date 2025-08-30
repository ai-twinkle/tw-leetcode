function isValidSudoku(board: string[][]): boolean {
  // Bitmask arrays for tracking digits in rows, columns, and 3x3 boxes
  const rowMasks = new Uint16Array(9);
  const columnMasks = new Uint16Array(9);
  const boxMasks = new Uint16Array(9);

  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const row = board[rowIndex];
    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      const cell = row[columnIndex];

      if (cell === '.') {
        continue;
      }
      const digit = cell.charCodeAt(0) - 48;
      const bit = 1 << (digit - 1);
      const boxIndex = ((rowIndex / 3) | 0) * 3 + ((columnIndex / 3) | 0);
      if ((rowMasks[rowIndex] & bit) !== 0) {
        return false;
      }
      if ((columnMasks[columnIndex] & bit) !== 0) {
        return false;
      }
      if ((boxMasks[boxIndex] & bit) !== 0) {
        return false;
      }
      rowMasks[rowIndex] |= bit;
      columnMasks[columnIndex] |= bit;
      boxMasks[boxIndex] |= bit;
    }
  }

  // All checks passed; board is valid
  return true;
}
