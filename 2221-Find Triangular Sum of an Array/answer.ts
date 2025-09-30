// Precompute Pascal's triangle coefficients modulo 10 up to size 1000
const binomialCoefficientMod10: Int32Array[] = ((): Int32Array[] => {
  const coefficients: Int32Array[] = [];

  for (let rowIndex = 0; rowIndex <= 1000; rowIndex++) {
    const currentRow = new Int32Array(rowIndex + 1);

    // The first and last elements in each row are always 1
    currentRow[0] = 1;
    currentRow[rowIndex] = 1;

    // Fill interior using Pascal's rule modulo 10
    for (let column = 1; column < rowIndex; column++) {
      currentRow[column] =
        (coefficients[rowIndex - 1][column - 1] + coefficients[rowIndex - 1][column]) % 10;
    }

    coefficients.push(currentRow);
  }

  return coefficients;
})();

/**
 * Compute the triangular sum of an array based on binomial expansion.
 * The result is Σ (nums[i] * C(n-1, i)) mod 10.
 *
 * @param nums - Input integer array of digits [0..9].
 * @returns The triangular sum of nums (a single digit 0..9).
 */
function triangularSum(nums: number[]): number {
  const length = nums.length;
  const coefficientRow = binomialCoefficientMod10[length - 1];

  let result = 0;

  // Accumulate weighted sum with binomial coefficients
  for (let index = 0; index < length; index++) {
    result += nums[index] * coefficientRow[index];
  }

  return result % 10;
}
