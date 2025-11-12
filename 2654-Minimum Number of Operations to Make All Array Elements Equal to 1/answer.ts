function minOperations(nums: number[]): number {
  const length = nums.length;
  let countOfOnes = 0;
  let overallGcd = 0;

  /**
   * Compute the greatest common divisor of two numbers using Euclid's algorithm.
   *
   * @param a - First number
   * @param b - Second number
   * @returns Greatest common divisor
   */
  function getGcd(a: number, b: number): number {
    while (b !== 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    return a;
  }

  // Count ones and compute overall gcd
  for (const value of nums) {
    if (value === 1) {
      countOfOnes++;
    }
    overallGcd = getGcd(overallGcd, value);
  }

  // Case 1: already contains ones
  if (countOfOnes > 0) {
    return length - countOfOnes;
  }

  // Case 2: impossible to reach 1
  if (overallGcd > 1) {
    return -1;
  }

  // Case 3: find the shortest subarray that can produce gcd == 1
  let minimalLength = length;
  for (let start = 0; start < length; start++) {
    let currentGcd = nums[start];
    for (let end = start + 1; end < length; end++) {
      currentGcd = getGcd(currentGcd, nums[end]);
      if (currentGcd === 1) {
        const windowLength = end - start + 1;
        if (windowLength < minimalLength) {
          minimalLength = windowLength;
        }
        break;
      }
    }
  }

  // After making one 1, it takes (n - 1) more operations to spread it
  return minimalLength + length - 2;
}
