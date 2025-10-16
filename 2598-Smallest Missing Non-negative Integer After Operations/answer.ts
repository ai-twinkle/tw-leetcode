/**
 * Compute the remainder in [0, modulus) efficiently, even for negative numbers.
 *
 * @param numberValue - The raw number to reduce.
 * @param modulus - The positive modulus.
 * @returns The normalized remainder in [0, modulus).
 */
function positiveRemainder(numberValue: number, modulus: number): number {
  let remainder = numberValue % modulus;
  if (remainder < 0) {
    remainder += modulus;
  }
  return remainder;
}

/**
 * Return the maximum possible MEX after any number of +/- value operations.
 *
 * @param nums - The input array of integers.
 * @param value - The adjustment step (positive integer).
 * @return The maximum achievable MEX.
 */
function findSmallestInteger(nums: number[], value: number): number {
  // Allocate a typed array per invocation (no cross-call caching)
  const remainderFrequency = new Int32Array(value);

  // Build frequency of remainders in [0, value)
  const arrayLength = nums.length;
  for (let index = 0; index < arrayLength; index += 1) {
    const remainder = positiveRemainder(nums[index], value);
    remainderFrequency[remainder] += 1;
  }

  // Greedily consume from buckets to form 0,1,2,... in order
  // The first k where its bucket is empty is the MEX.
  let mexCandidate = 0;
  while (true) {
    const requiredRemainder = mexCandidate % value;

    if (remainderFrequency[requiredRemainder] > 0) {
      // Use one number from this remainder bucket to realize 'mexCandidate'
      remainderFrequency[requiredRemainder] -= 1;
      mexCandidate += 1;
    } else {
      // We cannot realize 'mexCandidate'; it is the maximal MEX
      break;
    }
  }

  return mexCandidate;
}
