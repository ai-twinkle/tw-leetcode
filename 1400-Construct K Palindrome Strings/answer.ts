function canConstruct(s: string, k: number): boolean {
  // Early return if the length of the string is less than the number of palindrome strings
  if (s.length < k) {
    return false;
  }

  // Count the amount of each character
  const charCount = new Array(26).fill(0);
  for (const char of s) {
    charCount[char.charCodeAt(0) - 97]++;
  }

  // Count the number of odd count characters
  let oddCount = 0;
  for (const count of charCount) {
    if (count % 2 === 1) {
      oddCount++;
    }
  }

  // Return if the number of odd count characters is less than or equal to the number of palindrome strings
  return oddCount <= k;
}

/**
 * The pure functional version of the above solution (Just for fun)
 * @param s String
 * @param k Number of palindrome strings
 * @returns Whether the string can be constructed
 */
function canConstruct2(s: string, k: number): boolean {
  return s.length >= k &&
    s.split('')
      .reduce(
        (counts, char) => counts.map((count, index) => index === char.charCodeAt(0) - 97 ? count + 1 : count),
        new Array(26).fill(0),
      ).filter(count => count % 2 === 1).length <= k;
}
