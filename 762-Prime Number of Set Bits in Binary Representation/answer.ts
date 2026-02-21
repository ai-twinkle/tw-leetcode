const PRIME_BITCOUNT_MASK =
  (1 << 2) | (1 << 3) | (1 << 5) | (1 << 7) |
  (1 << 11) | (1 << 13) | (1 << 17) | (1 << 19);

function countPrimeSetBits(left: number, right: number): number {
  let count = 0;

  for (let value = left; value <= right; value++) {
    let x = value;
    let bitCount = 0;

    while (x !== 0) {
      x &= x - 1;
      bitCount++;
    }

    // Prime check in O(1) using a bitmask of valid bit counts.
    if (((PRIME_BITCOUNT_MASK >>> bitCount) & 1) !== 0) {
      count++;
    }
  }

  return count;
}
