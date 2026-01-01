function plusOne(digits: number[]): number[] {
  // Walk from least significant digit to most significant, handling carry.
  for (let index = digits.length - 1; index >= 0; index--) {
    const currentDigit = digits[index];

    if (currentDigit !== 9) {
      digits[index] = currentDigit + 1;
      return digits;
    }

    digits[index] = 0;
  }

  // All digits were 9, so we need a new array with a leading 1.
  const newLength = digits.length + 1;
  const result = new Array<number>(newLength);
  result[0] = 1;

  for (let index = 1; index < newLength; index++) {
    result[index] = 0;
  }

  return result;
}
