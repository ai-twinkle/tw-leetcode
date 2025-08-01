function generate(numRows: number): number[][] {
  const triangle: number[][] = [[1]];
  for (let rowIndex = 1; rowIndex < numRows; rowIndex++) {
    const previousRow = triangle[rowIndex - 1];
    const currentRow: number[] = new Array(rowIndex + 1);
    currentRow[0] = 1;
    for (let colIndex = 1; colIndex < rowIndex; colIndex++) {
      currentRow[colIndex] = previousRow[colIndex - 1] + previousRow[colIndex];
    }
    currentRow[rowIndex] = 1;
    triangle.push(currentRow);
  }
  return triangle;
}
