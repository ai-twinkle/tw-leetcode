function bitwiseComplement(n: number): number {
  // Build an all-1 mask with the same binary length as n, then subtract n to flip the bits.
  return Math.pow(2, n.toString(2).length) - 1 - n;
}
