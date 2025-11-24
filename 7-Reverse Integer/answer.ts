// Precompute 32-bit integer boundaries once for reuse in all calls
const INT32_MIN = -2147483648;
const INT32_MIN_DIV10 = -214748364;
const INT32_MIN_LAST_DIGIT = -8;

/**
 * Reverse the digits of a signed 32-bit integer.
 *
 * @param x - The signed 32-bit integer to reverse.
 * @returns The reversed integer, or 0 if it would overflow 32-bit range.
 */
function reverse(x: number): number {
  // Fast path: zero remains zero without entering the loop
  if (x === 0) {
    return 0;
  }

  // Record whether the original value is positive
  let isOriginalPositive = false;

  if (x > 0) {
    // Convert positive input to negative to work in a single safe range
    isOriginalPositive = true;
    x = -x;
  }

  // Accumulator for the reversed value (always kept non-positive)
  let reversedValue = 0;

  // Process all digits while the value is non-zero
  while (x !== 0) {
    // Extract the least significant digit (will be negative or zero)
    const currentDigit = x % 10;

    // Remove the least significant digit using 32-bit truncation toward zero
    x = (x / 10) | 0;

    // Check for overflow against INT32_MIN before multiplying by 10 and adding the digit
    if (reversedValue < INT32_MIN_DIV10) {
      return 0;
    }

    if (reversedValue === INT32_MIN_DIV10 && currentDigit < INT32_MIN_LAST_DIGIT) {
      return 0;
    }

    // Safe to append the current digit to the reversed value
    reversedValue = (reversedValue * 10) + currentDigit;
  }

  // If the original number was positive, we need to negate the result
  if (isOriginalPositive) {
    // Negating INT32_MIN would overflow to a value larger than INT32_MAX
    if (reversedValue === INT32_MIN) {
      return 0;
    }

    return -reversedValue;
  }

  // Original number was negative, result is already in correct sign
  return reversedValue;
}
