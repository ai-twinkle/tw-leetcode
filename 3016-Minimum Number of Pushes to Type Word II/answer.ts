/**
 * Push cost for each frequency rank: the eight most frequent letters sit in the
 * first slot of a key (1 push), the next eight in the second slot (2 pushes), and so on.
 * Precomputed once at module load so the hot path only does a table lookup.
 */
const PUSH_COST_BY_RANK = new Int32Array([
  1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2,
  3, 3, 3, 3, 3, 3, 3, 3,
  4, 4,
]);

/**
 * Computes the minimum number of key pushes needed to type the given word
 * after optimally remapping the letters onto keys 2 through 9.
 *
 * @param word - A string of lowercase English letters (length up to 10^5).
 * @returns The minimum total number of key pushes.
 */
function minimumPushes(word: string): number {
  const wordLength = word.length;
  const letterCounts = new Int32Array(26);

  // Single pass tally; charCodeAt avoids allocating substrings per character
  for (let index = 0; index < wordLength; index++) {
    letterCounts[word.charCodeAt(index) - 97]++;
  }

  // Descending insertion sort over a fixed 26-slot array: no comparator call overhead
  for (let current = 1; current < 26; current++) {
    const value = letterCounts[current];
    let position = current - 1;

    while (position >= 0 && letterCounts[position] < value) {
      letterCounts[position + 1] = letterCounts[position];
      position--;
    }

    letterCounts[position + 1] = value;
  }

  let totalPushes = 0;

  // Most frequent letters claim the cheapest keypad slots; zeros end the useful range
  for (let rank = 0; rank < 26; rank++) {
    const count = letterCounts[rank];

    if (count === 0) {
      break;
    }

    totalPushes += count * PUSH_COST_BY_RANK[rank];
  }

  return totalPushes;
}
