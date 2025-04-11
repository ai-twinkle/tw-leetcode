// Create a fixed-size prefix sum array for indices 0..10000.
const prefixSymmetricCount = new Uint16Array(10001);

/**
 * Precompute the cumulative count of symmetric numbers from 1 to 10000.
 * Only 2-digit and 4-digit numbers can be symmetric.
 */
function calculateSymmetricCount() {
  // Loop 1: Handle numbers 1 to 999.
  // For 2-digit numbers (11 to 99), check symmetry (symmetric if divisible by 11).
  // For 1-digit and 3-digit numbers, simply propagate the previous count.
  for (let number = 1; number < 1000; number++) {
    if (number >= 11 && number < 100) {
      prefixSymmetricCount[number] = prefixSymmetricCount[number - 1] + (number % 11 === 0 ? 1 : 0);
    } else {
      prefixSymmetricCount[number] = prefixSymmetricCount[number - 1];
    }
  }

  // Loop 2: Handle 4-digit numbers: 1000 to 9999.
  // A 4-digit number ABCD is symmetric if (A+B) equals (C+D).
  // For each number in this range, update the prefix sum accordingly.
  for (let number = 1000; number < 10000; number++) {
    const digitOnes = number % 10;
    const digitTens = ((number % 100) / 10) | 0;
    const digitHundreds = ((number % 1000) / 100) | 0;
    const digitThousands = (number / 1000) | 0;
    prefixSymmetricCount[number] = prefixSymmetricCount[number - 1] +
      ((digitOnes + digitTens === digitHundreds + digitThousands) ? 1 : 0);
  }

  // The number 10000 is 5-digit (not symmetric), so simply propagate the previous value.
  prefixSymmetricCount[10000] = prefixSymmetricCount[9999];
}

// Precompute the prefix symmetric count.
calculateSymmetricCount();

/**
 * Returns the number of symmetric numbers in the inclusive range [low, high].
 * The answer is computed in O(1) time using the precomputed prefix sum.
 * @param low {number} - The lower bound of the range (inclusive).
 * @param high {number} - The upper bound of the range (inclusive).
 * @returns {number} - The count of symmetric integers in the range [low, high].
 */
function countSymmetricIntegers(low: number, high: number): number {
  return prefixSymmetricCount[high] - prefixSymmetricCount[low - 1];
}
