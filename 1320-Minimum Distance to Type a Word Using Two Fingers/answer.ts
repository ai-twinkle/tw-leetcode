// Precompute Manhattan distances between all 26 letter pairs
const LETTER_DISTANCE = new Int32Array(26 * 26);
for (let i = 0; i < 26; i++) {
  const rowI = (i / 6) | 0;
  const colI = i % 6;
  for (let j = i + 1; j < 26; j++) {
    const distance = Math.abs(rowI - ((j / 6) | 0)) + Math.abs(colI - j % 6);
    LETTER_DISTANCE[i * 26 + j] = distance;
    LETTER_DISTANCE[j * 26 + i] = distance;
  }
}

const LARGE_VALUE = 0x3f3f3f3f;

/**
 * Computes the minimum total Manhattan distance to type a word using two fingers.
 * @param word The word to type, consisting of uppercase English letters
 * @return The minimum total distance
 */
function minimumDistance(word: string): number {
  const length = word.length;

  // Use two flat Int32Arrays as rolling DP rows instead of nested arrays
  let previousRow = new Int32Array(26).fill(0);
  let currentRow = new Int32Array(26);

  for (let i = 1; i < length; i++) {
    const currentLetter = word.charCodeAt(i) - 65;
    const previousLetter = word.charCodeAt(i - 1) - 65;
    // Cost to move the "active" finger from previous letter to current letter
    const sameFingerCost = LETTER_DISTANCE[previousLetter * 26 + currentLetter];

    // Precompute the minimum of dp[i-1][k] + dist(k, cur) across all k
    // This is only used when j === previousLetter
    const previousLetterOffset = currentLetter * 26;
    let bestSwitchCost = LARGE_VALUE;
    for (let k = 0; k < 26; k++) {
      const switchCost = previousRow[k] + LETTER_DISTANCE[k * 26 + currentLetter];
      if (switchCost < bestSwitchCost) {
        bestSwitchCost = switchCost;
      }
    }

    for (let j = 0; j < 26; j++) {
      // Option 1: move the finger that was at previousLetter to currentLetter
      currentRow[j] = previousRow[j] + sameFingerCost;
    }

    // Option 2: for j === previousLetter, switch which finger types currentLetter
    if (bestSwitchCost < currentRow[previousLetter]) {
      currentRow[previousLetter] = bestSwitchCost;
    }

    // Swap rolling buffers
    const temp = previousRow;
    previousRow = currentRow;
    currentRow = temp;
  }

  // Find minimum cost across all possible "other finger" positions
  let result = LARGE_VALUE;
  for (let j = 0; j < 26; j++) {
    if (previousRow[j] < result) {
      result = previousRow[j];
    }
  }
  return result;
}
