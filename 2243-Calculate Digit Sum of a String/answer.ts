function digitSum(s: string, k: number): string {
  let length = s.length;

  // Convert characters to digits once so later rounds never touch strings
  const digits = new Uint8Array(length);
  for (let index = 0; index < length; index++) {
    digits[index] = s.charCodeAt(index) - 48;
  }

  while (length > k) {
    let writeIndex = 0;
    let readIndex = 0;

    while (readIndex < length) {
      let groupEnd = readIndex + k;
      if (groupEnd > length) {
        groupEnd = length;
      }

      // Sum all digits in the current group
      let groupSum = 0;
      while (readIndex < groupEnd) {
        groupSum += digits[readIndex];
        readIndex++;
      }

      // Write the decimal digits of the sum in place (sum is at most 900, so at most 3 digits)
      if (groupSum >= 100) {
        const hundreds = (groupSum / 100) | 0;
        const remainder = groupSum - hundreds * 100;
        const tens = (remainder / 10) | 0;
        digits[writeIndex] = hundreds;
        digits[writeIndex + 1] = tens;
        digits[writeIndex + 2] = remainder - tens * 10;
        writeIndex += 3;
      } else if (groupSum >= 10) {
        const tens = (groupSum / 10) | 0;
        digits[writeIndex] = tens;
        digits[writeIndex + 1] = groupSum - tens * 10;
        writeIndex += 2;
      } else {
        digits[writeIndex] = groupSum;
        writeIndex++;
      }
    }

    length = writeIndex;
  }

  // Build the final string from the remaining digits
  let result = "";
  for (let index = 0; index < length; index++) {
    result += digits[index];
  }

  return result;
}
