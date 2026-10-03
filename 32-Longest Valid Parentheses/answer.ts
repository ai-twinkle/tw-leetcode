// Character code of '(' — comparing numbers avoids per-character string allocation
const OPEN_PARENTHESIS_CODE = 40;

/**
 * Finds the length of the longest valid (well-formed) parentheses substring.
 *
 * Single left-to-right pass keeping a stack of unmatched '(' indices in a typed
 * array, plus the index just before the current candidate window at slot 0.
 * Every ')' that closes a pair measures the whole block in one subtraction, so
 * the answer comes out in O(n) time with one allocation and no string slicing.
 *
 * @param s - A string containing only the characters '(' and ')'.
 * @returns The length of the longest valid parentheses substring.
 */
function longestValidParentheses(s: string): number {
  const length = s.length;

  // Fewer than two characters can never form a balanced pair
  if (length < 2) {
    return 0;
  }

  // Int32Array stack: slot 0 holds the barrier index, slots above hold '(' positions
  const unmatchedOpenIndices = new Int32Array(length + 1);
  let stackTop = 0;
  let longest = 0;

  unmatchedOpenIndices[0] = -1;

  for (let index = 0; index < length; index += 1) {
    if (s.charCodeAt(index) === OPEN_PARENTHESIS_CODE) {
      // Remember this '(' so a later ')' can pair with it
      stackTop += 1;
      unmatchedOpenIndices[stackTop] = index;

      continue;
    }

    if (stackTop !== 0) {
      // This ')' closes the most recent '(', so the valid run reaches the barrier below it
      stackTop -= 1;

      const currentLength = index - unmatchedOpenIndices[stackTop];

      if (currentLength > longest) {
        longest = currentLength;
      }

      continue;
    }

    // Unmatchable ')': it becomes the new barrier for every future window
    unmatchedOpenIndices[0] = index;
  }

  return longest;
}
