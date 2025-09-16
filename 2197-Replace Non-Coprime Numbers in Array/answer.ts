function replaceNonCoprimes(nums: number[]): number[] {
  const length = nums.length;

  // Preallocate stack with fixed size (typed array) to minimize dynamic overhead.
  // Values are guaranteed to fit in 32 bits (<= 1e8).
  const stack = new Uint32Array(length);
  let stackPointer = -1; // Index of the current top element in the stack.

  /**
   * Compute the Greatest Common Divisor (GCD) using
   * the iterative Euclidean algorithm (fast and allocation-free).
   *
   * @param {number} a - First non-negative integer.
   * @param {number} b - Second non-negative integer.
   * @returns {number} - The GCD of a and b.
   */
  function computeGreatestCommonDivisor(a: number, b: number): number {
    while (b !== 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    return a;
  }

  for (let i = 0; i < length; i++) {
    // Coerce to unsigned 32-bit integer for stack storage.
    let currentValue = nums[i] >>> 0;

    // Continuously merge with the stack's top element
    // as long as the two numbers are non-coprime.
    while (stackPointer >= 0) {
      const previousValue = stack[stackPointer];
      const divisor = computeGreatestCommonDivisor(previousValue, currentValue);

      if (divisor === 1) {
        // Numbers are coprime, stop merging.
        break;
      }

      // Replace the two numbers with their LCM.
      // Use (a / gcd) * b to minimize overflow risk.
      currentValue = Math.trunc((previousValue / divisor) * currentValue);

      // Pop the stack top since it is merged.
      stackPointer--;
    }

    // Push the current merged value onto the stack.
    stack[++stackPointer] = currentValue;
  }

  // Copy the valid portion of the stack into the result array.
  const resultLength = stackPointer + 1;
  const result: number[] = new Array(resultLength);
  for (let i = 0; i < resultLength; i++) {
    result[i] = stack[i];
  }

  return result;
}
