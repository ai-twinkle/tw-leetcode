function minimumOneBitOperations(n: number): number {
  // Accumulates the prefix XOR that inverts Gray code to binary
  let operationCount = 0;

  // Process until all bits are consumed
  while (n !== 0) {
    operationCount ^= n; // Merge current prefix parity into the answer
    n = n >>> 1;         // Unsigned shift to avoid sign-extension overhead
  }

  // Return the total number of operations needed
  return operationCount;
}
