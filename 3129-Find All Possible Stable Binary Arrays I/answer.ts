function numberOfStableArrays(zero: number, one: number, limit: number): number {
  const MOD = 1_000_000_007;
  const columnCount = one + 1;
  const totalSize = (zero + 1) * columnCount;

  // Arrays ending with 0
  const stableArrayEndingWithZero = new Uint32Array(totalSize);

  // Arrays ending with 1
  const stableArrayEndingWithOne = new Uint32Array(totalSize);

  // Prefix sum of arrays ending with 1 along the zero dimension
  const prefixSumEndingWithOne = new Uint32Array(totalSize);

  // Prefix sum of arrays ending with 0 along the one dimension
  const prefixSumEndingWithZero = new Uint32Array(totalSize);

  // Dummy state to initialize first blocks
  stableArrayEndingWithZero[0] = 1;
  stableArrayEndingWithOne[0] = 1;

  for (let zeroCount = 0; zeroCount <= zero; zeroCount += 1) {
    const currentZeroOffset = zeroCount * columnCount;
    const previousZeroOffset = (zeroCount - 1) * columnCount;
    const limitedZeroOffset = (zeroCount - limit - 1) * columnCount;

    for (let oneCount = 0; oneCount <= one; oneCount += 1) {
      const index = currentZeroOffset + oneCount;

      // Handle the initial dummy state
      if (zeroCount === 0 && oneCount === 0) {
        prefixSumEndingWithOne[index] = 1;
        prefixSumEndingWithZero[index] = 1;
        continue;
      }

      // Compute arrays ending with zero
      if (zeroCount > 0) {
        let value = prefixSumEndingWithOne[previousZeroOffset + oneCount];

        if (zeroCount > limit) {
          value = (value - prefixSumEndingWithOne[limitedZeroOffset + oneCount] + MOD) % MOD;
        }

        stableArrayEndingWithZero[index] = value;
      }

      // Compute arrays ending with one
      if (oneCount > 0) {
        let value = prefixSumEndingWithZero[index - 1];

        if (oneCount > limit) {
          value = (value - prefixSumEndingWithZero[index - limit - 1] + MOD) % MOD;
        }

        stableArrayEndingWithOne[index] = value;
      }

      // Update prefix sum along the zero dimension
      let prefixOneValue = stableArrayEndingWithOne[index];
      if (zeroCount > 0) {
        prefixOneValue = (prefixOneValue + prefixSumEndingWithOne[previousZeroOffset + oneCount]) % MOD;
      }
      prefixSumEndingWithOne[index] = prefixOneValue;

      // Update prefix sum along the one dimension
      let prefixZeroValue = stableArrayEndingWithZero[index];
      if (oneCount > 0) {
        prefixZeroValue = (prefixZeroValue + prefixSumEndingWithZero[index - 1]) % MOD;
      }
      prefixSumEndingWithZero[index] = prefixZeroValue;
    }
  }

  const targetIndex = zero * columnCount + one;

  return (stableArrayEndingWithZero[targetIndex] + stableArrayEndingWithOne[targetIndex]) % MOD;
}
