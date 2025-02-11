/**
 * Given two strings `s` and `part`, perform the following operation on `s`
 * until all occurrences of the substring `part` are removed:
 *
 * - Find the leftmost occurrence of the substring `part` and remove it from `s`.
 * - Return `s` after removing all occurrences of `part`.
 * @param s the string to remove occurrences from
 * @param part the substring to remove from `s`
 * @returns the string `s` after removing all occurrences of `part`
 */
function removeOccurrences(s: string, part: string): string {
  const stack: string[] = [];
  for (const char of s) {
    stack.push(char);
    if (stack.length >= part.length && stack.slice(-part.length).join('') === part) {
      stack.splice(-part.length);
    }
  }
  return stack.join('');
}
