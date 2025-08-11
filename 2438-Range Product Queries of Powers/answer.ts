function productQueries(n: number, queries: number[][]): number[] {
  const MODULO = 1_000_000_007;

  // Keep an unsigned copy since n <= 1e9
  const inputNumber = n >>> 0;

  // 1. Count the number of set bits (number of powers of two in representation)
  let tempNumber = inputNumber;
  let setBitCount = 0;
  while (tempNumber) {
    tempNumber &= (tempNumber - 1); // Remove the lowest set bit
    setBitCount++;
  }

  // 2. Store bit positions (exponents) of set bits in ascending order
  const bitPositionList = new Uint16Array(setBitCount);
  let positionWritePointer = 0;
  let currentBitPosition = 0;
  let remainingValue = inputNumber;
  while (remainingValue) {
    if (remainingValue & 1) {
      bitPositionList[positionWritePointer++] = currentBitPosition;
    }
    remainingValue >>>= 1;
    currentBitPosition++;
  }

  // 3. Compute prefix sum of bit positions (exponents)
  const exponentPrefixSum = new Uint32Array(setBitCount + 1);
  for (let i = 0; i < setBitCount; i++) {
    exponentPrefixSum[i + 1] = exponentPrefixSum[i] + bitPositionList[i];
  }
  const maxExponentSum = exponentPrefixSum[setBitCount];

  // 4. Precompute powers of two modulo MODULO up to maxExponentSum
  const powersOfTwoModulo = new Uint32Array(maxExponentSum + 1);
  powersOfTwoModulo[0] = 1;
  for (let exponent = 1; exponent <= maxExponentSum; exponent++) {
    powersOfTwoModulo[exponent] = (powersOfTwoModulo[exponent - 1] * 2) % MODULO;
  }

  // 5. Answer each query in O(1) using prefix sums
  const queryCount = queries.length;
  const queryResults: number[] = new Array(queryCount);
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const startIndex = queries[queryIndex][0] | 0;
    const endIndex = queries[queryIndex][1] | 0;
    const exponentSumInRange =
      exponentPrefixSum[endIndex + 1] - exponentPrefixSum[startIndex];
    queryResults[queryIndex] = powersOfTwoModulo[exponentSumInRange];
  }

  return queryResults;
}
