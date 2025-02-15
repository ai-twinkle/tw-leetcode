/**
 * Computes the punishment number for a given positive integer n.
 * The punishment number of n is defined as the sum of the squares of all integers i (1 <= i <= n)
 * such that the decimal representation of i² can be partitioned into contiguous substrings
 * whose integer values sum to i.
 *
 * @param {number} n - The upper limit of integers to check.
 * @returns {number} The punishment number for n.
 */
function punishmentNumber(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    // Using "casting out nines" as a necessary condition:
    // i must be congruent to 0 or 1 modulo 9.
    if (i % 9 !== 0 && i % 9 !== 1) {
      continue;
    }

    const squareStr = (i * i).toString();
    if (canPartition(squareStr, 0, i)) {
      total += i * i;
    }
  }
  return total;
}

/**
 * Recursively checks whether the string representation of a square number
 * can be partitioned into contiguous substrings whose integer values sum up to the target.
 *
 * @param {string} s - The string representation of i².
 * @param {number} index - The current index in the string to start partitioning.
 * @param {number} target - The remaining sum required to equal i.
 * @returns {boolean} True if a valid partition exists that sums to target; otherwise, false.
 */
function canPartition(s: string, index: number, target: number): boolean {
  // If we've processed the entire string, check if the remaining target is 0.
  if (index === s.length) {
    return target === 0;
  }

  let num = 0;
  // Try all possible partitions starting from the current index.
  for (let i = index; i < s.length; i++) {
    // Build the current number by adding one digit at a time.
    num = num * 10 + Number(s[i]);

    // If the accumulated number exceeds the target, further partitions are futile.
    if (num > target) break;

    // Recursively check the rest of the string with the updated target.
    if (canPartition(s, i + 1, target - num)) {
      return true;
    }
  }

  return false;
}
