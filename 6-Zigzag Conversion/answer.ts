function convert(s: string, numRows: number): string {
  const length = s.length;

  // No zigzag change is needed when there is only one row
  // or when every character fits into its own row.
  if (numRows === 1 || numRows >= length) {
    return s;
  }

  const lastRow = numRows - 1;
  const rows = new Array<string>(numRows);

  // Initialize each row as an empty string for later appending.
  for (let row = 0; row < numRows; row++) {
    rows[row] = "";
  }

  let currentRow = 0;
  let rowStep = 1;

  for (let index = 0; index < length; index++) {
    // Append the current character to the active zigzag row.
    rows[currentRow] += s[index];

    // Reverse direction at the top row so the path starts moving downward.
    if (currentRow === 0) {
      rowStep = 1;
    } else if (currentRow === lastRow) {
      // Reverse direction at the bottom row so the path starts moving upward.
      rowStep = -1;
    }

    // Move to the next row according to the current direction.
    currentRow += rowStep;
  }

  // Concatenate all rows to form the final zigzag reading order.
  return rows.join("");
}
