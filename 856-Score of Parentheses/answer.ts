const OPEN_PAREN_CODE = 40;

/**
 * Computes the score of a balanced parentheses string.
 *
 * Instead of recursing or using a stack, this exploits the closed form of the
 * scoring rules: each innermost "()" pair sits at nesting depth d and is
 * doubled once per enclosing pair, contributing exactly 2^d to the total.
 * Depth never exceeds 25 for s.length <= 50, so 1 << depth stays in int32 range.
 *
 * @param s A balanced parentheses string containing only '(' and ')'.
 * @returns The score of the string.
 */
function scoreOfParentheses(s: string): number {
  const length = s.length;
  let score = 0;
  let depth = 0;
  let previousCode = 0;

  for (let index = 0; index < length; index++) {
    const currentCode = s.charCodeAt(index);

    if (currentCode === OPEN_PAREN_CODE) {
      depth++;
    } else {
      depth--;

      // A ")" immediately after "(" is an innermost pair worth 2^depth
      if (previousCode === OPEN_PAREN_CODE) {
        score += 1 << depth;
      }
    }

    // Carry the code forward so the innermost-pair check costs no extra read
    previousCode = currentCode;
  }

  return score;
}
