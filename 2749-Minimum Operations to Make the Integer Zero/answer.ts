function makeTheIntegerZero(num1: number, num2: number): number {
  if (num1 === 0) {
    // If num1 is already zero, no operations are required
    return 0;
  }

  const TWO32 = 4294967296; // 2^32
  const INV_TWO32 = 1 / TWO32;

  /**
   * Count the number of set bits (1s) in a 32-bit unsigned integer.
   *
   * Uses a branchless bit-manipulation algorithm for efficiency.
   *
   * @param {number} value - A 32-bit integer (forced unsigned inside).
   * @returns {number} The number of set bits in `value`.
   */
  function popcount32(value: number): number {
    value = value >>> 0;
    value = value - ((value >>> 1) & 0x55555555);
    value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
    value = (value + (value >>> 4)) & 0x0F0F0F0F;
    value = value + (value >>> 8);
    value = value + (value >>> 16);
    return value & 0x3F;
  }

  /**
   * Count the number of set bits (1s) in a non-negative integer
   * that fits within JavaScript’s safe integer range.
   *
   * Splits the number into high and low 32-bit halves,
   * then applies `popcount32` to each part.
   *
   * @param {number} x - A non-negative integer (up to ~2^36 here).
   * @returns {number} The number of set bits in `x`.
   */
  function popcount64(x: number): number {
    const high = (x * INV_TWO32) >>> 0;   // higher 32 bits
    const low = (x - high * TWO32) >>> 0; // lower 32 bits
    return popcount32(high) + popcount32(low);
  }

  // Initial remainder after one operation
  let currentX = num1 - num2;

  for (let operationCount = 1; operationCount <= 60; operationCount++) {
    // The remaining value must be at least the number of operations so far
    if (currentX >= operationCount) {
      const bits = popcount64(currentX);
      if (bits <= operationCount) {
        return operationCount;
      }
    } else {
      // If num2 is positive, the remainder shrinks with each step.
      // Once it is smaller than the number of operations, no solution is possible.
      if (num2 > 0) {
        return -1;
      }
    }

    // Prepare the next remainder
    currentX -= num2;
  }

  return -1;
}
