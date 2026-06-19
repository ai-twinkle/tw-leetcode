/**
 * Reverses a string by accumulating its characters from end to start.
 * Defined outside processStr so no closure is allocated per call.
 *
 * @param value - The string to reverse.
 * @returns The reversed string.
 */
function reverseString(value: string): string {
  let reversed = "";
  for (let index = value.length - 1; index >= 0; --index) {
    reversed += value[index];
  }
  return reversed;
}

/**
 * Builds the result string by applying letter-append, deletion ('*'),
 * duplication ('#'), and reversal ('%') operations.
 *
 * Reversal is tracked with a flag so consecutive '%' collapse for free. The
 * flag is resolved right before a '#', so the reversal always acts on the
 * small pre-doubled string (never an amplified one), guaranteeing the
 * reversal cost never exceeds the base approach.
 *
 * @param s - Instruction string of lowercase letters and special characters.
 * @returns The final processed string.
 */
function processStr(s: string): string {
  let result = "";
  let isReversed = false;
  for (let index = 0; index < s.length; ++index) {
    const character = s[index];
    if (character === "*") {
      // Remove the logical last character from the correct physical end.
      if (result.length > 0) {
        if (isReversed) {
          result = result.slice(1);
        } else {
          result = result.slice(0, -1);
        }
      }
    } else if (character === "#") {
      // Resolve the reversal first so we double an already-correct string.
      if (isReversed) {
        result = reverseString(result);
        isReversed = false;
      }
      // Native concatenation; V8 makes this an O(1) rope until materialized.
      result = result + result;
    } else if (character === "%") {
      // Defer the reversal; merely flip the direction flag.
      isReversed = !isReversed;
    } else {
      // Append the letter to the current logical end.
      if (isReversed) {
        result = character + result;
      } else {
        result = result + character;
      }
    }
  }
  // Apply any pending reversal exactly once at the end.
  if (isReversed) {
    result = reverseString(result);
  }
  return result;
}
