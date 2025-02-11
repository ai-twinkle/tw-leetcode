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
  while (s.includes(part)) {
    s = s.replace(part, '');
  }
  return s;
}
