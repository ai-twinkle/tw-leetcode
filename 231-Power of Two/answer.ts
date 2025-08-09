function isPowerOfTwo(n: number): boolean {
  if (n <= 0) {
    // Negative or zero cannot be powers of two
    return false;
  }
  return (n & (n - 1)) === 0; // True iff exactly one bit is set
}
