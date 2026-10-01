/**
 * Lookup table mapping an opening bracket's char code to its expected closing
 * char code. A zero entry means the character is not an opening bracket.
 * Indices used: '(' = 40, '[' = 91, '{' = 123.
 */
const EXPECTED_CLOSING_CODE = new Uint8Array(126);
EXPECTED_CLOSING_CODE[40] = 41;
EXPECTED_CLOSING_CODE[91] = 93;
EXPECTED_CLOSING_CODE[123] = 125;

/**
 * Determines whether every bracket in the string is closed by the same type in
 * the correct order.
 *
 * @param s - String consisting only of the characters '()[]{}'.
 * @returns True when the bracket sequence is valid, otherwise false.
 */
function isValid(s: string): boolean {
  const length = s.length;

  // An odd number of brackets can never pair up completely.
  if ((length & 1) === 1) {
    return false;
  }

  // At most length / 2 openings can ever be pending, so the stack never grows beyond that.
  const capacity = length >> 1;
  const pendingClosingCodes = new Uint8Array(capacity);
  let stackSize = 0;

  for (let index = 0; index < length; index++) {
    const characterCode = s.charCodeAt(index);
    const closingCode = EXPECTED_CLOSING_CODE[characterCode];

    if (closingCode !== 0) {
      // More than length / 2 openings means there are not enough closings left.
      if (stackSize === capacity) {
        return false;
      }

      pendingClosingCodes[stackSize++] = closingCode;
      continue;
    }

    // A closing bracket must match the most recent pending opening exactly.
    if (stackSize === 0 || pendingClosingCodes[--stackSize] !== characterCode) {
      return false;
    }
  }

  return stackSize === 0;
}
