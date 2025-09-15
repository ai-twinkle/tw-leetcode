/**
 * Calculates the sum of all XOR totals for every subset of the input array.
 * The XOR total of an array is defined as the bitwise XOR of all its elements,
 * or 0 if the array is empty.
 *
 * @param {number[]} nums - The input array of numbers.
 * @return {number} The sum of XOR totals for every subset of the input array.
 */
function subsetXORSum(nums: number[]): number {
  const arrayLength = nums.length;

  if (arrayLength === 0) {
    return 0;
  }

  let bitwiseOrAggregate = 0;
  for (const currentNumber of nums) {
    bitwiseOrAggregate |= currentNumber;
  }

  // 2^(n - 1) can be computed by left shifting 1 by (arrayLength - 1)
  const powerMultiplier = 1 << (arrayLength - 1);
  return bitwiseOrAggregate * powerMultiplier;
}
