function isPowerOfFour(n: number): boolean {
  // Negative numbers and zero cannot be powers of four
  if (n <= 0) {
    return false;
  }

  // Divide n by 4 as long as it is divisible by 4
  while (n % 4 === 0) {
    n /= 4;
  }

  // If n becomes 1, it was a power of four; otherwise, it's not
  return n === 1;
}
