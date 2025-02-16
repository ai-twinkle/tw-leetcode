/**
 * Given an integer `n`, find a sequence that satisfies all of the following:
 *
 * - The integer `1` occurs once in the sequence.
 * - Each integer between `2` and `n` occurs twice in the sequence.
 * - For every integer `i` between `2` and `n`, the distance between the two occurrences of `i` is exactly `i`.
 *
 * The distance between two numbers on the sequence, `a[i] and a[j]`, is the absolute difference of their indices, `|j - i|`.
 * @param {number} n The integer `n`
 * @return {number[]} The lexicographically largest sequence
 */
function constructDistancedSequence(n: number): number[] {
  // The result array, when we only need a `1` in the sequence, for other numbers, we can just double them
  const result: number[] = new Array(2 * n - 1).fill(0);
  // A boolean array to mark if a number is used for constructing the sequence
  const used: boolean[] = new Array(n + 1).fill(false);

  /**
   * A depth-first search function to construct the sequence
   * @param index {number} The current index in the result array
   * @param result {number[]} The result array
   * @param used {boolean[]} The used array
   * @param n {number} The integer `n`
   */
  const dfs = (index: number, result: number[], used: boolean[], n: number): boolean => {
    if (index === result.length) {
      // If we reach the end of the result array, we have found the sequence
      return true;
    }

    if (result[index] !== 0) {
      // If the current index is already filled, we move to the next index
      return dfs(index + 1, result, used, n);
    }

    // We start from the largest number for lexicographical order
    for (let i = n; i >= 1; i--) {
      if (used[i]) {
        // If the number is already used, we skip it
        continue;
      }

      if (i === 1) {
        // If the number is `1`, we can just fill it in the result array
        used[i] = true;
        result[index] = i;

        if (dfs(index + 1, result, used, n)) {
          // If we can find a valid sequence, we return true
          return true;
        }

        // If we cannot find a valid sequence, we backtrack
        used[i] = false;
        result[index] = 0;
      } else if (index + i < result.length && result[index + i] === 0) {
        // If the number is not `1` and the second occurrence of the number can be filled in the result array
        used[i] = true;
        result[index] = i;
        result[index + i] = i;

        if (dfs(index + 1, result, used, n)) {
          // If we can find a valid sequence, we return true
          return true;
        }

        // If we cannot find a valid sequence, we backtrack
        used[i] = false;
        result[index] = 0;
        result[index + i] = 0;
      }
    }

    return false;
  }

  // Start the depth-first search
  dfs(0, result, used, n);

  // Return the result array
  return result;
}
