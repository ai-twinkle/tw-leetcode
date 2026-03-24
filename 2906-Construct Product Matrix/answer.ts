const MODULO: number = 12345;

/**
 * Constructs the product matrix where each element p[i][j] equals
 * the product of all grid elements except grid[i][j], modulo 12345.
 * Uses a two-pass (suffix then prefix) strategy directly on 2D rows.
 *
 * @param grid - 2D input matrix of positive integers
 * @returns 2D product matrix of the same dimensions
 */
function constructProductMatrix(grid: number[][]): number[][] {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // Pre-allocate result rows once; no .fill() needed as values are always written before read
  const productMatrix: number[][] = new Array(rowCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    productMatrix[rowIndex] = new Array(columnCount);
  }

  // Backward pass: fill each cell with the suffix product (product of all elements after it in row-major order)
  let suffixProduct = 1;
  for (let rowIndex = rowCount - 1; rowIndex >= 0; rowIndex--) {
    const gridRow = grid[rowIndex];
    const resultRow = productMatrix[rowIndex];
    for (let columnIndex = columnCount - 1; columnIndex >= 0; columnIndex--) {
      resultRow[columnIndex] = suffixProduct;
      suffixProduct = (suffixProduct * gridRow[columnIndex]) % MODULO;
    }
  }

  // Forward pass: multiply each suffix product cell by the running prefix product
  let prefixProduct = 1;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const gridRow = grid[rowIndex];
    const resultRow = productMatrix[rowIndex];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      resultRow[columnIndex] = (resultRow[columnIndex] * prefixProduct) % MODULO;
      prefixProduct = (prefixProduct * gridRow[columnIndex]) % MODULO;
    }
  }

  return productMatrix;
}
