/**
 * Checks whether two binary matrices are element-wise equal.
 * @param mat - First n x n binary matrix
 * @param target - Second n x n binary matrix
 * @param n - The dimension of the matrices
 * @returns true if all elements are equal, false otherwise
 */
function isEqual(mat: number[][], target: number[][], n: number): boolean {
  for (let row = 0; row < n; row++) {
    for (let column = 0; column < n; column++) {
      if (mat[row][column] !== target[row][column]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Rotates an n x n matrix 90 degrees clockwise in-place.
 * Uses the standard 4-cell cycle swap with hoisted bounds.
 * @param mat - The n x n binary matrix to rotate in-place
 * @param n - The dimension of the matrix
 */
function rotateInPlace(mat: number[][], n: number): void {
  // Hoist loop bounds outside the loop to avoid recomputation each iteration
  const rowBound = Math.floor(n / 2);
  const columnBound = Math.floor((n + 1) / 2);

  for (let row = 0; row < rowBound; row++) {
    for (let column = 0; column < columnBound; column++) {
      // Perform 4-cell cycle swap using a single temporary variable (no heap allocation)
      const temporary = mat[row][column];
      mat[row][column] = mat[n - 1 - column][row];
      mat[n - 1 - column][row] = mat[n - 1 - row][n - 1 - column];
      mat[n - 1 - row][n - 1 - column] = mat[column][n - 1 - row];
      mat[column][n - 1 - row] = temporary;
    }
  }
}

/**
 * Determines if mat can be rotated in 90-degree increments to equal target.
 * @param mat - The source n x n binary matrix
 * @param target - The target n x n binary matrix
 * @returns true if any rotation of mat equals target, false otherwise
 */
function findRotation(mat: number[][], target: number[][]): boolean {
  const n = mat.length;

  for (let rotation = 0; rotation < 4; rotation++) {
    if (isEqual(mat, target, n)) {
      return true;
    }
    rotateInPlace(mat, n);
  }

  return false;
}
