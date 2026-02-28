function concatenatedBinary(n: number): number {
  const modulo = 1000000007;

  let answer = 0;

  // Track when bit-length increases using the next power of two threshold.
  // This avoids a per-iteration (value & (value - 1)) power-of-two check.
  let currentBitLength = 1;
  let shiftMultiplier = 2; // 2^{currentBitLength}
  let nextPowerOfTwo = 2;

  for (let value = 1; value <= n; value++) {
    if (value === nextPowerOfTwo) {
      currentBitLength++;
      shiftMultiplier = shiftMultiplier << 1;
      nextPowerOfTwo = nextPowerOfTwo << 1;
    }

    // Append "value" in binary by shifting the current answer then adding value.
    answer = (answer * shiftMultiplier + value) % modulo;
  }

  return answer;
}
