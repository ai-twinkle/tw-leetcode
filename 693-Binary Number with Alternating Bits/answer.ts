function hasAlternatingBits(n: number): boolean {
  // XOR with right-shift collapses "alternating" into a contiguous all-ones mask.
  const mixed = n ^ (n >>> 1);

  // For x = 0b111...111, x + 1 = 0b1000...000, so x & (x + 1) == 0.
  // If x is not all 1s, there will be at least one position where both have 1 -> result != 0.
  return (mixed & (mixed + 1)) === 0;
}
