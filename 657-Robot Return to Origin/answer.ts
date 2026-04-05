// Pre-compute character code constants to avoid repeated string comparisons
const CHAR_R = "R".charCodeAt(0);
const CHAR_L = "L".charCodeAt(0);
const CHAR_U = "U".charCodeAt(0);
const CHAR_D = "D".charCodeAt(0);

/**
 * Judges whether a robot returns to the origin after completing all moves.
 * @param moves - The sequence of moves as a string of 'U', 'D', 'L', 'R' characters
 * @return True if the robot ends at (0, 0), false otherwise
 */
function judgeCircle(moves: string): boolean {
  let horizontal = 0;
  let vertical = 0;
  const length = moves.length;

  // Iterate using charCodeAt to avoid string allocation per character
  for (let index = 0; index < length; index++) {
    const code = moves.charCodeAt(index);

    if (code === CHAR_R) {
      horizontal++;
    } else if (code === CHAR_L) {
      horizontal--;
    } else if (code === CHAR_U) {
      vertical++;
    } else if (code === CHAR_D) {
      vertical--;
    }
  }

  return horizontal === 0 && vertical === 0;
}
