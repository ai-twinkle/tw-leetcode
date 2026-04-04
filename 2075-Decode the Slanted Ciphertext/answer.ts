function decodeCiphertext(encodedText: string, rows: number): string {
  const totalLength = encodedText.length;

  if (totalLength === 0) {
    return "";
  }

  // A single-row matrix is an identity transform — nothing to decode.
  if (rows === 1) {
    return encodedText;
  }

  // Each diagonal spans (rows) characters, and consecutive diagonals share
  // (rows - 1) columns, so a new diagonal starts every (rows - 1) columns.
  const totalColumns = Math.ceil(totalLength / rows);

  // Pre-allocate a typed array so we avoid repeated string concatenation.
  const outputBuffer = new Uint16Array(totalLength);

  // outputIndex tracks where in the original (diagonal) order we write next.
  let outputIndex = 0;

  // Iterate over every diagonal.  Diagonal d starts at column d in the matrix.
  for (let diagonalStart = 0; diagonalStart < totalColumns; diagonalStart++) {
    // Walk down this diagonal one row at a time.
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      // The column this cell occupies in the matrix.
      const column = diagonalStart + rowIndex;

      if (column >= totalColumns) {
        // Diagonal has left the matrix bounds — stop early.
        break;
      }

      // Flat index into encodedText: row r, column c → r * totalColumns + c.
      const flatIndex = rowIndex * totalColumns + column;

      if (flatIndex >= totalLength) {
        break;
      }

      outputBuffer[outputIndex] = encodedText.charCodeAt(flatIndex);
      outputIndex++;
    }
  }

  // Trim trailing spaces without allocating an intermediate string.
  let trimmedEnd = outputIndex;
  while (trimmedEnd > 0 && outputBuffer[trimmedEnd - 1] === 32) { // The ' ' character is ASCII code 32.
    trimmedEnd--;
  }

  return String.fromCharCode(...outputBuffer.subarray(0, trimmedEnd));
}
