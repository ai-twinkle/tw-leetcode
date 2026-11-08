// Letters for each digit '0'-'9' (character code minus 48), built once outside the function
const DIGIT_TO_LETTERS: readonly (readonly string[])[] = [
  [], [],
  ["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"], ["j", "k", "l"],
  ["m", "n", "o"], ["p", "q", "r", "s"], ["t", "u", "v"], ["w", "x", "y", "z"],
];

/**
 * Return all letter combinations the phone digits could represent.
 * @param digits String of digits in the range '2'-'9'.
 * @returns Every possible letter combination.
 */
function letterCombinations(digits: string): string[] {
  const digitCount = digits.length;

  if (digitCount === 0) {
    return [];
  }

  // Seed with the letters of the first digit
  let combinations: string[] = DIGIT_TO_LETTERS[digits.charCodeAt(0) - 48].slice();

  for (let digitIndex = 1; digitIndex < digitCount; digitIndex++) {
    const letters = DIGIT_TO_LETTERS[digits.charCodeAt(digitIndex) - 48];
    const letterCount = letters.length;
    const previousCount = combinations.length;

    // Allocate the exact size up front so there is no push and no resizing
    const nextCombinations: string[] = new Array(previousCount * letterCount);
    let writeIndex = 0;

    for (let previousIndex = 0; previousIndex < previousCount; previousIndex++) {
      const prefix = combinations[previousIndex];

      for (let letterIndex = 0; letterIndex < letterCount; letterIndex++) {
        nextCombinations[writeIndex++] = prefix + letters[letterIndex];
      }
    }

    combinations = nextCombinations;
  }

  return combinations;
}
