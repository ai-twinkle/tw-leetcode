/**
 Do not return anything, modify matrix in-place instead.
 */
function rotate(matrix: number[][]): void {
  const size: number = matrix.length;

  // Trivial case: a 1x1 matrix is already rotated
  if (size < 2) {
    return;
  }

  const lastIndex: number = size - 1;
  // Outer loop covers half the rows (rounded down)
  const halfRows: number = (size / 2) | 0;
  // Inner loop covers half the columns (rounded up) to handle odd sizes
  const halfColumns: number = (size + 1) >> 1;

  for (let layer = 0; layer < halfRows; layer++) {
    // Cache the top and bottom row references for this layer
    const topRow = matrix[layer];
    const bottomRow = matrix[lastIndex - layer];

    for (let offset = 0; offset < halfColumns; offset++) {
      // Cache mirrored column indices once per inner iteration
      const mirroredOffset: number = lastIndex - offset;
      // Cache the two middle row references that participate in the cycle
      const leftRow = matrix[mirroredOffset];
      const rightRow = matrix[offset];

      // Save the top-left value before overwriting it
      const temp: number = topRow[offset];

      // Perform the 4-way cyclic shift: bottom-left -> top-left
      topRow[offset] = leftRow[layer];
      // Bottom-right -> bottom-left
      leftRow[layer] = bottomRow[mirroredOffset];
      // Top-right -> bottom-right
      bottomRow[mirroredOffset] = rightRow[lastIndex - layer];
      // Saved top-left -> top-right
      rightRow[lastIndex - layer] = temp;
    }
  }
}
