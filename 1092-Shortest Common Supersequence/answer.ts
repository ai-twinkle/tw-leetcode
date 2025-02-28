/**
 * Returns the shortest common supersequence of two strings.
 * A supersequence is a string that contains both input strings as subsequences.
 *
 * Optimizations:
 * 1. Remove the common prefix and suffix to reduce the DP table size.
 * 2. Use push() to collect characters and reverse the array later,
 *    which is generally more efficient than using unshift().
 *
 * @param str1 - The first input string.
 * @param str2 - The second input string.
 * @returns The shortest common supersequence containing both str1 and str2.
 */
function shortestCommonSupersequence(str1: string, str2: string): string {
  // If both strings are identical, return one directly.
  if (str1 === str2) return str1;

  // Remove common prefix
  let commonPrefix = "";
  while (str1.length > 0 && str2.length > 0 && str1[0] === str2[0]) {
    commonPrefix += str1[0];
    str1 = str1.slice(1);
    str2 = str2.slice(1);
  }

  // Remove common suffix
  let commonSuffix = "";
  while (
    str1.length > 0 &&
    str2.length > 0 &&
    str1[str1.length - 1] === str2[str2.length - 1]
    ) {
    commonSuffix = str1[str1.length - 1] + commonSuffix;
    str1 = str1.slice(0, -1);
    str2 = str2.slice(0, -1);
  }

  const len1 = str1.length;
  const len2 = str2.length;

  // Build the DP table for the LCS length.
  // dp[i][j] represents the length of the LCS for str1[0..i-1] and str2[0..j-1].
  const dp: number[][] = Array.from({ length: len1 + 1 }, () =>
    Array(len2 + 1).fill(0)
  );

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack through the DP table to construct the super sequence.
  let i = len1;
  let j = len2;
  const sequence: string[] = [];

  // Build the sequence in reverse order using push.
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      // When characters match, add the character (part of LCS) to the sequence.
      sequence.push(str1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      // Choose the character from str1.
      sequence.push(str1[i - 1]);
      i--;
    } else {
      // Choose the character from str2.
      sequence.push(str2[j - 1]);
      j--;
    }
  }

  // Append any remaining characters from str1.
  while (i > 0) {
    sequence.push(str1[i - 1]);
    i--;
  }

  // Append any remaining characters from str2.
  while (j > 0) {
    sequence.push(str2[j - 1]);
    j--;
  }

  // Reverse the sequence since we built it backwards.
  const middleSequence = sequence.reverse().join('');
  // Combine the common prefix, the middle sequence, and the common suffix.
  return commonPrefix + middleSequence + commonSuffix;
}
