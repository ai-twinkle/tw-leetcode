/**
 * Count the number of powerful integers within the range [start, finish] that end with a given suffix.
 *
 * A powerful integer is one whose every digit is ≤ {limit} and that ends with the string {s}.
 *
 * @param {number} start - The lower bound of the range (inclusive).
 * @param {number} finish - The upper bound of the range (inclusive).
 * @param {number} limit - The maximum allowed digit (digits 0 through limit).
 * @param {string} s - The required suffix.
 * @returns {number} The count of powerful integers in the range.
 */
function numberOfPowerfulInt(start: number, finish: number, limit: number, s: string): number {
  // Convert bounds to strings and use our helper "calculate".
  const startStr = (start - 1).toString();
  const finishStr = finish.toString();
  return calculate(finishStr, s, limit) - calculate(startStr, s, limit);
}


/**
 * Count the powerful integers in [0, x] that end with the suffix {s}.
 *
 * This helper function interprets the part of the number before {s} as a number in base (limit+1)
 * to quickly compute the count.
 *
 * @param {string} x - The upper bound as a string.
 * @param {string} s - The required suffix.
 * @param {number} limit - The maximum allowed digit.
 * @returns {number} The count of powerful integers in [0, x].
 */
function calculate(x: string, s: string, limit: number): number {
  const n = x.length;
  const suffixLen = s.length;

  // Not enough digits to include the suffix
  if (n < suffixLen) {
    return 0;
  }

  // If the number of digits equals the suffix's length, the only candidate is "s" itself.
  if (n === suffixLen) {
    return x >= s ? 1 : 0;
  }

  const preLen = n - suffixLen;

  // Precompute powers: pows[i] = (limit+1)^i for 0 <= i <= preLen.
  const pows = new Float64Array(preLen + 1);
  pows[0] = 1;
  for (let i = 1; i <= preLen; i++) {
    pows[i] = pows[i - 1] * (limit + 1);
  }

  let count = 0;
  // Process the prefix digits one by one.
  for (let i = 0; i < preLen; i++) {
    // Use charCodeAt to avoid function call overhead from parseInt.
    const digit = x.charCodeAt(i) - 48;
    if (digit > limit) {
      // Once a digit exceeds the allowed limit, all choices thereafter are unconstrained.
      count += pows[preLen - i];
      return count;
    }
    count += digit * pows[preLen - 1 - i];
  }

  // If every digit in the prefix is allowed, check the suffix.
  const suffix = x.slice(preLen);
  if (suffix >= s) {
    count++;
  }

  return count;
}
