const MOD_VALUE = 1_000_000_007;
const MAXIMUM_POWER = 100_001;

// Powers of ten modulo MOD_VALUE, split into high/low halves so range values can be
// reconstructed with plain double multiplications that never exceed 2^53.
const powersOfTenLow = new Float64Array(MAXIMUM_POWER);
const powersOfTenHigh = new Float64Array(MAXIMUM_POWER);
let currentPower = 1;
for (let index = 0; index < MAXIMUM_POWER; index++) {
  powersOfTenLow[index] = currentPower % 65536;
  powersOfTenHigh[index] = Math.floor(currentPower / 65536);
  currentPower = (currentPower * 10) % MOD_VALUE;
}

function sumAndMultiply(s: string, queries: number[][]): number[] {
  const length = s.length;

  // nonZeroCountPrefix[i] = number of non-zero digits in s[0..i-1].
  const nonZeroCountPrefix = new Int32Array(length + 1);
  // valueByNonZeroIndex[c] = integer formed by the first c non-zero digits, mod MOD_VALUE.
  const valueByNonZeroIndex = new Float64Array(length + 1);
  // sumByNonZeroIndex[c] = sum of the first c non-zero digits.
  const sumByNonZeroIndex = new Int32Array(length + 1);

  let nonZeroSeen = 0;
  let runningValue = 0;
  let runningSum = 0;
  for (let index = 0; index < length; index++) {
    const digit = s.charCodeAt(index) - 48;

    // Zero digits are skipped entirely when building x and its digit sum.
    if (digit !== 0) {
      runningValue = (runningValue * 10 + digit) % MOD_VALUE;
      runningSum += digit;
      nonZeroSeen++;
      valueByNonZeroIndex[nonZeroSeen] = runningValue;
      sumByNonZeroIndex[nonZeroSeen] = runningSum;
    }

    nonZeroCountPrefix[index + 1] = nonZeroSeen;
  }

  const queryCount = queries.length;
  const results = new Array<number>(queryCount);
  for (let index = 0; index < queryCount; index++) {
    const query = queries[index];
    const startNonZero = nonZeroCountPrefix[query[0]];
    const endNonZero = nonZeroCountPrefix[query[1] + 1];
    const digitCount = endNonZero - startNonZero;

    // An empty non-zero range gives x = 0, hence result 0.
    if (digitCount === 0) {
      results[index] = 0;
      continue;
    }

    // Reconstruct prefixValue * 10^digitCount via split halves: each partial
    // product stays below 10^9 * 65536 < 2^53, so no precision is lost.
    const prefixValue = valueByNonZeroIndex[startNonZero];
    const shiftedPrefix = (prefixValue * powersOfTenHigh[digitCount] % MOD_VALUE * 65536 +
      prefixValue * powersOfTenLow[digitCount]) % MOD_VALUE;
    let concatenatedValue = valueByNonZeroIndex[endNonZero] - shiftedPrefix;
    if (concatenatedValue < 0) {
      concatenatedValue += MOD_VALUE;
    }

    // Digit sum is at most 9 * 1e5, so x * sum stays within safe double range.
    const digitSum = sumByNonZeroIndex[endNonZero] - sumByNonZeroIndex[startNonZero];
    results[index] = (concatenatedValue * digitSum) % MOD_VALUE;
  }

  return results;
}
