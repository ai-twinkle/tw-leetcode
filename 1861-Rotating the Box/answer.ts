function rotateTheBox(boxGrid: string[][]): string[][] {
  const rows = boxGrid.length;
  const cols = boxGrid[0].length;

  // Pre-allocate the rotated result and fill every cell with '.'
  // Manual fill is faster than Array.fill or Array.from in V8 here
  const result: string[][] = new Array(cols);
  for (let columnIndex = 0; columnIndex < cols; columnIndex++) {
    const newRow: string[] = new Array(rows);
    for (let fillIndex = 0; fillIndex < rows; fillIndex++) {
      newRow[fillIndex] = ".";
    }
    result[columnIndex] = newRow;
  }

  // Single pass: simulate gravity and write directly to rotated coordinates
  // Source cell (r, c) maps to rotated cell (c, rows-1-r)
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const sourceRow = boxGrid[rowIndex];
    // Target column in the rotated grid for this source row
    const rotatedColumn = rows - 1 - rowIndex;
    // Next available landing slot, scanning right-to-left
    let landingSlot = cols - 1;

    for (let colIndex = cols - 1; colIndex >= 0; colIndex--) {
      const cell = sourceRow[colIndex];
      if (cell === "*") {
        // Obstacle keeps its column; reset landing slot to its left
        result[colIndex][rotatedColumn] = "*";
        landingSlot = colIndex - 1;
      } else if (cell === "#") {
        // Stone falls to the current landing slot in the rotated grid
        result[landingSlot][rotatedColumn] = "#";
        landingSlot--;
      }
      // Empty '.' cells need no work since the result is already pre-filled
    }
  }

  return result;
}
