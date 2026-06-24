function zigZagArrays(n: number, l: number, r: number): number {
  const rangeSize = r - l + 1;

  // As no two adjacent elements are equal, if rangeSize < 2, it is impossible to form a valid array
  if (rangeSize < 2) {
    return 0;
  }

  const moduloConstant = 1000000007n;

  /**
   * Multiplies two square matrices of size rangeSize x rangeSize.
   *
   * @param matrixA - The left matrix operand
   * @param matrixB - The right matrix operand
   * @returns The newly computed product matrix
   */
  function multiplyMatrices(matrixA: BigInt64Array, matrixB: BigInt64Array): BigInt64Array<ArrayBuffer> {
    const productMatrix = new BigInt64Array(rangeSize * rangeSize);

    for (let rowIndex = 0; rowIndex < rangeSize; rowIndex++) {
      const rowOffset = rowIndex * rangeSize;

      for (let innerIndex = 0; innerIndex < rangeSize; innerIndex++) {
        const multiplier = matrixA[rowOffset + innerIndex];

        if (multiplier === 0n) {
          continue;
        }

        const innerRowOffset = innerIndex * rangeSize;

        for (let colIndex = 0; colIndex < rangeSize; colIndex++) {
          // Calculate matrix cell value with modulo to natively prevent 64-bit overflow
          const currentProduct = multiplier * matrixB[innerRowOffset + colIndex];
          productMatrix[rowOffset + colIndex] = (productMatrix[rowOffset + colIndex] + currentProduct) % moduloConstant;
        }
      }
    }

    return productMatrix;
  }

  // Initialize the base transition matrix mapped purely to "peak" states
  const transitionMatrix = new BigInt64Array(rangeSize * rangeSize);

  for (let rowValue = 0; rowValue < rangeSize; rowValue++) {
    const rowOffset = rowValue * rangeSize;

    for (let colValue = rangeSize - rowValue; colValue < rangeSize; colValue++) {
      transitionMatrix[rowOffset + colValue] = 1n;
    }
  }

  let resultMatrix = new BigInt64Array(rangeSize * rangeSize);

  for (let diagonalIndex = 0; diagonalIndex < rangeSize; diagonalIndex++) {
    resultMatrix[diagonalIndex * rangeSize + diagonalIndex] = 1n;
  }

  let baseMatrix = transitionMatrix;
  let exponent = n - 2;

  // Use exponentiation by squaring to reach O(log N) efficiency
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      resultMatrix = multiplyMatrices(resultMatrix, baseMatrix);
    }

    baseMatrix = multiplyMatrices(baseMatrix, baseMatrix);
    exponent = Math.floor(exponent / 2);
  }

  const initialVector = new BigInt64Array(rangeSize);

  for (let vectorIndex = 0; vectorIndex < rangeSize; vectorIndex++) {
    initialVector[vectorIndex] = BigInt(vectorIndex);
  }

  let totalPeakSequences = 0n;

  // Multiply the final exponentiated matrix by the initial vector state
  for (let rowIndex = 0; rowIndex < rangeSize; rowIndex++) {
    let rowSum = 0n;
    const rowOffset = rowIndex * rangeSize;

    for (let colIndex = 0; colIndex < rangeSize; colIndex++) {
      const cellProduct = resultMatrix[rowOffset + colIndex] * initialVector[colIndex];
      rowSum = (rowSum + cellProduct) % moduloConstant;
    }

    totalPeakSequences = (totalPeakSequences + rowSum) % moduloConstant;
  }

  // Multiply by 2 to accurately account for both peak-ending and valley-ending symmetric arrays
  const totalValidArrays = (totalPeakSequences * 2n) % moduloConstant;

  return Number(totalValidArrays);
}
