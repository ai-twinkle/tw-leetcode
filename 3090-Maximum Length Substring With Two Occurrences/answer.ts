const ALPHABET_SIZE = 26;
const LOWERCASE_A_CHAR_CODE = 97;
const MAX_OCCURRENCES_PER_CHARACTER = 2;

// 26 distinct letters x 2 occurrences each is a hard ceiling on any valid window.
const MAX_POSSIBLE_WINDOW_LENGTH = ALPHABET_SIZE * MAX_OCCURRENCES_PER_CHARACTER;

// Offset of the "second latest occurrence" half inside the single position table.
const SECOND_LATEST_OFFSET = ALPHABET_SIZE;

const NO_OCCURRENCE = -1;

/**
 * Returns the maximum length of a substring containing at most two occurrences
 * of each character.
 *
 * @param s - Input string consisting only of lowercase English letters.
 * @returns The length of the longest valid substring.
 */
function maximumLengthSubstring(s: string): number {
  const length = s.length;

  // Any string of length 0..2 already satisfies the "at most two" rule.
  if (length <= MAX_OCCURRENCES_PER_CHARACTER) {
    return length;
  }

  // One flat table: [0..25] = latest index of each letter, [26..51] = second latest.
  const occurrencePositions = new Int32Array(ALPHABET_SIZE * 2).fill(NO_OCCURRENCE);

  let maximumLength = 0;
  let windowStart = 0;

  for (let windowEnd = 0; windowEnd < length; windowEnd += 1) {
    const characterIndex = s.charCodeAt(windowEnd) - LOWERCASE_A_CHAR_CODE;
    const secondLatestIndex = characterIndex + SECOND_LATEST_OFFSET;
    const secondLatestPosition = occurrencePositions[secondLatestIndex];

    // Counting the current one, this letter's third-newest copy must fall outside
    // the window, so the start jumps past it in a single arithmetic step.
    if (secondLatestPosition >= windowStart) {
      windowStart = secondLatestPosition + 1;
    }

    // Shift this letter's occurrence history: second latest <- latest <- current.
    occurrencePositions[secondLatestIndex] = occurrencePositions[characterIndex];
    occurrencePositions[characterIndex] = windowEnd;

    const currentWindowLength = windowEnd - windowStart + 1;

    if (currentWindowLength > maximumLength) {
      maximumLength = currentWindowLength;

      // The theoretical ceiling was reached, so no later window can be longer.
      if (maximumLength === MAX_POSSIBLE_WINDOW_LENGTH) {
        return maximumLength;
      }
    }

    // The longest window still reachable is (length - windowStart); stop if it can't win.
    if (length - windowStart <= maximumLength) {
      break;
    }
  }

  return maximumLength;
}
