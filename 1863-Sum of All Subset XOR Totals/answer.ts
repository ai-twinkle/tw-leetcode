/**
 * Calculates the sum of all XOR totals for every subset of the input array.
 * The XOR total of an array is defined as the bitwise XOR of all its elements,
 * or 0 if the array is empty.
 *
 * @param {number[]} arrayOfNumbers - The input array of numbers.
 * @return {number} The sum of XOR totals for every subset of the input array.
 */
function subsetXORSum(arrayOfNumbers: number[]): number {
  const arrayLength: number = arrayOfNumbers.length;

  if (arrayLength === 0) {
    return 0;
  }

  let bitwiseOrAggregate: number = 0;
  for (const currentNumber of arrayOfNumbers) {
    bitwiseOrAggregate |= currentNumber;
  }

  // 2^(n - 1) can be computed by left shifting 1 by (arrayLength - 1)
  const powerMultiplier: number = 1 << (arrayLength - 1);
  return bitwiseOrAggregate * powerMultiplier;
}
