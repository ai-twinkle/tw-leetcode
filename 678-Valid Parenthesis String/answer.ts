/**
 * Character code constants for the three possible input characters.
 * Comparing numeric char codes avoids per-index string slice allocations.
 */
const OPEN_PAREN_CODE = 40;
const CLOSE_PAREN_CODE = 41;

/**
 * Checks whether a string of '(', ')' and '*' can form a balanced
 * parenthesis sequence, where '*' may act as '(', ')' or an empty string.
 *
 * Instead of tracking every concrete interpretation, the algorithm carries the
 * interval [minimumOpen, maximumOpen] of how many unmatched '(' could remain.
 * A wildcard widens that interval in both directions, so one left-to-right
 * sweep replaces the exponential search over wildcard assignments.
 *
 * Time: O(n) with a single pass and no allocation. Space: O(1).
 *
 * @param s - The input string containing only '(', ')' and '*'.
 * @returns True when some assignment of the wildcards makes the string valid.
 */
function checkValidString(s: string): boolean {
  const length = s.length;

  // A leading ')' can never be matched, and a trailing '(' can never be closed.
  if (s.charCodeAt(0) === CLOSE_PAREN_CODE || s.charCodeAt(length - 1) === OPEN_PAREN_CODE) {
    return false;
  }

  // Smallest and largest possible number of still-unmatched '(' so far.
  let minimumOpen = 0;
  let maximumOpen = 0;

  for (let index = 0; index < length; index++) {
    const characterCode = s.charCodeAt(index);

    // '(' forces an open; '*' may open, so both raise the upper bound.
    if (characterCode === CLOSE_PAREN_CODE) {
      maximumOpen--;
    } else {
      maximumOpen++;
    }

    // Only a literal '(' guarantees an open; ')' and '*' may both close one.
    if (characterCode === OPEN_PAREN_CODE) {
      minimumOpen++;
    } else {
      minimumOpen--;
    }

    // Even treating every wildcard as '(', there are too many ')' already.
    if (maximumOpen < 0) {
      return false;
    }

    // Surplus closers were absorbed by wildcards acting as empty strings.
    if (minimumOpen < 0) {
      minimumOpen = 0;
    }
  }

  // Valid only if zero unmatched '(' is reachable within the interval.
  return minimumOpen === 0;
}
