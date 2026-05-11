// Pre-computed powers of 10 for fast digit extraction (stored outside function)
// Index N holds 10^N — used as divisor to peel leading digit of an (N+1)-digit number
const POWERS_OF_TEN = new Int32Array([1, 10, 100, 1000, 10000, 100000]);

/**
 * Separates each integer in the input array into its individual digits,
 * preserving the original order of integers and digits.
 * @param nums - Array of positive integers (each up to 10^5)
 * @return Flat array containing the digits of every integer in order
 */
function separateDigits(nums: number[]): number[] {
  const numsLength = nums.length;

  // First pass: compute total digit count to allocate exact-sized output
  let totalDigitCount = 0;
  for (let index = 0; index < numsLength; index++) {
    const value = nums[index];
    // Threshold comparison is faster than Math.log10 or repeated division
    if (value < 10) {
      totalDigitCount += 1;
    } else if (value < 100) {
      totalDigitCount += 2;
    } else if (value < 1000) {
      totalDigitCount += 3;
    } else if (value < 10000) {
      totalDigitCount += 4;
    } else if (value < 100000) {
      totalDigitCount += 5;
    } else {
      totalDigitCount += 6;
    }
  }

  // Pre-allocate result array with exact length — avoids dynamic resizing/push overhead
  const result: number[] = new Array(totalDigitCount);
  let writeIndex = 0;

  // Second pass: extract digits from most significant to least significant
  for (let index = 0; index < numsLength; index++) {
    let value = nums[index];

    // Determine digit count using the same threshold ladder
    let digitCount: number;
    if (value < 10) {
      digitCount = 1;
    } else if (value < 100) {
      digitCount = 2;
    } else if (value < 1000) {
      digitCount = 3;
    } else if (value < 10000) {
      digitCount = 4;
    } else if (value < 100000) {
      digitCount = 5;
    } else {
      digitCount = 6;
    }

    // Extract digits left-to-right using descending powers of 10
    // This avoids any reverse step after extraction
    for (let digitPosition = digitCount - 1; digitPosition >= 0; digitPosition--) {
      const divisor = POWERS_OF_TEN[digitPosition];
      // Bitwise OR with 0 truncates to integer faster than Math.floor
      const leadingDigit = (value / divisor) | 0;
      result[writeIndex++] = leadingDigit;
      // Strip the leading digit by subtracting its contribution
      value -= leadingDigit * divisor;
    }
  }

  return result;
}
