// Upper bound of the input range as specified by the problem constraints
const MAX_NUMBER = 100000;

// Precomputed prefix sum of waviness values, indexed by number
// wavinessPrefixSum[i] holds the cumulative waviness for all integers from 1 to i inclusive
const wavinessPrefixSum = (() => {
  const prefixSum = new Int32Array(MAX_NUMBER + 1);
  // Numbers below 100 have fewer than 3 digits and contribute 0 waviness, so start at 100
  for (let number = 100; number <= MAX_NUMBER; number++) {
    let remaining = number;
    // Extract the two least-significant digits to prime the sliding window
    let rightDigit = remaining % 10;
    remaining = (remaining / 10) | 0;
    let middleDigit = remaining % 10;
    remaining = (remaining / 10) | 0;
    let count = 0;
    // Slide a three-digit window from right to left across the number
    while (remaining > 0) {
      const leftDigit = remaining % 10;
      // Peak: middle digit strictly exceeds both neighbors
      if (middleDigit > rightDigit && middleDigit > leftDigit) {
        count++;
      } else if (middleDigit < rightDigit && middleDigit < leftDigit) {
        // Valley: middle digit strictly less than both neighbors
        count++;
      }
      // Advance the window one position toward the most significant digit
      rightDigit = middleDigit;
      middleDigit = leftDigit;
      remaining = (remaining / 10) | 0;
    }
    prefixSum[number] = prefixSum[number - 1] + count;
  }
  return prefixSum;
})();

/**
 * Compute the total waviness summed across an inclusive integer range.
 * @param num1 lower bound of the range, inclusive
 * @param num2 upper bound of the range, inclusive
 * @returns the sum of waviness values for every integer in [num1, num2]
 */
function totalWaviness(num1: number, num2: number): number {
  // Constant-time range query against the precomputed prefix sum table
  return wavinessPrefixSum[num2] - wavinessPrefixSum[num1 - 1];
}
