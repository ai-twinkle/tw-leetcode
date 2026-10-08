/**
 * Depth delta for each parenthesis character code, precomputed once outside the
 * function so the scan never needs a comparison branch to classify a character.
 * Index 40 is '(' and index 41 is ')'.
 */
const PARENTHESIS_DEPTH_DELTA = new Int8Array(42);
PARENTHESIS_DEPTH_DELTA[40] = 1;
PARENTHESIS_DEPTH_DELTA[41] = -1;

/**
 * Removes the outermost parentheses of every primitive string in the primitive
 * decomposition of a valid parentheses string.
 *
 * Instead of emitting the result character by character, this walks primitive to
 * primitive: for each primitive it scans only until the depth returns to zero,
 * then appends the interior as one slice. V8 makes `substring` an O(1) sliced
 * string and `+=` an O(1) rope node, so the whole result is assembled with one
 * node per primitive and a single flatten at the end, instead of up to 10^5
 * single-character concatenations.
 *
 * @param s A valid parentheses string containing only '(' and ')'.
 * @returns The string with the outer parentheses of each primitive removed.
 */
function removeOuterParentheses(s: string): string {
  const length = s.length;
  let result = '';
  let primitiveStart = 0;

  while (primitiveStart < length) {
    // s[primitiveStart] always opens a primitive, so the depth starts at one.
    let depth = 1;
    let scanIndex = primitiveStart + 1;

    // Advance to the ')' that closes this primitive; the input is guaranteed
    // valid, so the depth is certain to reach zero before running off the end.
    while (depth !== 0) {
      depth += PARENTHESIS_DEPTH_DELTA[s.charCodeAt(scanIndex)];
      scanIndex++;
    }

    const innerEnd = scanIndex - 1;

    // Skip the append entirely for a bare "()" primitive, whose interior is empty.
    if (innerEnd > primitiveStart + 1) {
      result += s.substring(primitiveStart + 1, innerEnd);
    }

    primitiveStart = scanIndex;
  }

  return result;
}
