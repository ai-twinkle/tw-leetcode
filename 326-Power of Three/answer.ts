function isPowerOfThree(n: number): boolean {
  // Negative numbers and zero cannot be powers of three
  if (n <= 0) {
    return false;
  }

  // Divide n by 3 as long as it is divisible by 3
  while (n % 3 === 0) {
    n /= 3;
  }

  // If n becomes 1, it was a power of three; otherwise, it's not
  return n === 1;
}
