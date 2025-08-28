// Reusable buffer for diagonal extraction
let diagonalBuffer = new Int32Array(0);

/**
 * Ensures the reusable diagonal buffer has at least the given capacity.
 * Expands the buffer if current length is smaller than required.
 *
 * @param n - Minimum required capacity
 */
function ensureBufferCapacity(n: number): void {
  if (diagonalBuffer.length < n) {
    diagonalBuffer = new Int32Array(n);
  }
}

/**
 * Sorts the diagonals of a square matrix:
 * - Bottom-left triangle (including main diagonal): non-increasing order
 * - Top-right triangle: non-decreasing order
 *
 * @param grid - Square matrix of integers
 * @returns The sorted matrix
 */
function sortMatrix(grid: number[][]): number[][] {
  const n = grid.length;
  ensureBufferCapacity(n);

  // Process bottom-left diagonals (including main diagonal)
  for (let rowStart = 0; rowStart < n; rowStart++) {
    const diagonalLength = n - rowStart;
    const view = diagonalBuffer.subarray(0, diagonalLength);

    // Copy diagonal elements into buffer
    for (let needle = 0; needle < diagonalLength; needle++) {
      view[needle] = grid[rowStart + needle][needle];
    }

    // Sort buffer in ascending order
    view.sort();

    // Write values back in reverse to get non-increasing order
    for (let needle = 0; needle < diagonalLength; needle++) {
      grid[rowStart + needle][needle] = view[diagonalLength - 1 - needle];
    }
  }

  // Process top-right diagonals (excluding main diagonal)
  for (let colStart = 1; colStart < n; colStart++) {
    const diagonalLength = n - colStart;
    const view = diagonalBuffer.subarray(0, diagonalLength);

    // Copy diagonal elements into buffer
    for (let needle = 0; needle < diagonalLength; needle++) {
      view[needle] = grid[needle][colStart + needle];
    }

    // Sort buffer in ascending order
    view.sort();

    // Write values back directly in ascending order
    for (let needle = 0; needle < diagonalLength; needle++) {
      grid[needle][colStart + needle] = view[needle];
    }
  }

  return grid;
}
