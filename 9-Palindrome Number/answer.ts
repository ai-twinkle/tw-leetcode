function isPalindrome(x: number): boolean {
  // Negative numbers cannot be palindromes because of the minus sign
  if (x < 0) {
    return false;
  }

  // Preserve the original value for final comparison
  const originalValue = x;

  // reversedValue accumulates the reversed digits of x
  let reversedValue = 0;

  // Reverse all digits using modulo and fast integer division
  while (x > 0) {
    // Extract the least significant digit
    const digit = x % 10;

    // Append the digit to the reversed value
    reversedValue = (reversedValue * 10) + digit;

    // Remove the least significant digit using 32-bit truncation
    x = (x / 10) | 0;
  }

  // A palindrome must equal its reversed representation
  return reversedValue === originalValue;
}
