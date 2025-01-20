function firstCompleteIndex(arr: number[], mat: number[][]): number {
  const n = mat.length;    // Number of rows
  const m = mat[0].length; // Number of columns

  // Arrays to map each number in the matrix to its row and column indices
  const numberToRow: number[] = new Array(n * m);
  const numberToCol: number[] = new Array(n * m);

  // Preprocess the matrix to create a direct mapping of numbers to their row and column
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < m; col++) {
      const value = mat[row][col];
      numberToRow[value] = row;
      numberToCol[value] = col;
    }
  }

  // Arrays to track how many elements have been filled in each row and column
  const rowCounts: number[] = new Array(n).fill(0);
  const colCounts: number[] = new Array(m).fill(0);

  // Process the `arr` to find the first completed row or column
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const row = numberToRow[current];
    const col = numberToCol[current];

    // Update row and column counts
    rowCounts[row]++;
    colCounts[col]++;

    // Check if the current row or column is completed, we will return the index if it is
    if (rowCounts[row] === m || colCounts[col] === n) {
      return i;
    }
  }

  // Return -1 if no row or column is completed
  return -1;
}
