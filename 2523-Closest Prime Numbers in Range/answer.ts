const MAX_LIMIT = 1e6;

// Create a sieve array using Uint8Array for performance.
// Each index represents whether the number is considered prime (1) or not (0).
const primeFlags = new Uint8Array(MAX_LIMIT + 1).fill(1);
primeFlags[0] = primeFlags[1] = 0; // 0 and 1 are not prime numbers

// This array will store all prime numbers found within the range [2, MAX_LIMIT].
const primeNumbers: number[] = [];

// Use the Sieve of Eratosthenes to mark non-prime numbers.
// Loop through each number starting from 2 up to the square root of MAX_LIMIT.
for (let currentNumber = 2; currentNumber * currentNumber <= MAX_LIMIT; currentNumber++) {
  if (primeFlags[currentNumber]) {
    // Mark all multiples of currentNumber as non-prime, starting from currentNumber^2.
    for (let multiple = currentNumber * currentNumber; multiple <= MAX_LIMIT; multiple += currentNumber) {
      primeFlags[multiple] = 0;
    }
  }
}

// Collect all prime numbers up to MAX_LIMIT by checking the sieve.
for (let currentNumber = 2; currentNumber <= MAX_LIMIT; currentNumber++) {
  if (primeFlags[currentNumber]) {
    primeNumbers.push(currentNumber);
  }
}

/**
 * Finds the pair of closest prime numbers within the given range.
 * The function uses the precomputed list of prime numbers.
 *
 * @param rangeStart {number} - The start of the range (inclusive).
 * @param rangeEnd {number} - The end of the range (inclusive).
 * @returns {number[]} - An array containing the pair of closest primes, or [-1, -1] if not found.
 */
function closestPrimes(rangeStart: number, rangeEnd: number): number[] {
  // Early return if the range includes the optimal prime pair [2, 3].
  if (rangeStart <= 2 && rangeEnd >= 3) {
    return [2, 3];
  }

  /**
   * Custom binary search to find the lower-bound index in a sorted array.
   * It returns the first index where the element is not less than the target.
   *
   * @param array {number[]} - The sorted array to search.
   * @param target {number} - The target value to search for.
   * @returns {number} - The lower-bound index.
   */
  function lowerBoundIndex(array: number[], target: number): number {
    let lowerIndex = 0;
    let upperIndex = array.length;
    while (lowerIndex < upperIndex) {
      const middleIndex = (lowerIndex + upperIndex) >>> 1; // Fast integer division by 2
      if (array[middleIndex] < target) {
        lowerIndex = middleIndex + 1;
      } else {
        upperIndex = middleIndex;
      }
    }
    return lowerIndex;
  }

  /**
   * Custom binary search to find the upper-bound index in a sorted array.
   * It returns the first index where the element is greater than the target.
   *
   * @param array {number[]} - The sorted array to search.
   * @param target {number} - The target value to search for.
   * @returns {number} - The upper-bound index.
   */
  function upperBoundIndex(array: number[], target: number): number {
    let lowerIndex = 0;
    let upperIndex = array.length;
    while (lowerIndex < upperIndex) {
      const middleIndex = (lowerIndex + upperIndex) >>> 1;
      if (array[middleIndex] <= target) {
        lowerIndex = middleIndex + 1;
      } else {
        upperIndex = middleIndex;
      }
    }
    return lowerIndex;
  }

  // Find the start index of prime numbers that are >= rangeStart.
  const startIndex = lowerBoundIndex(primeNumbers, rangeStart);
  // Find the end index (last prime number <= rangeEnd) by finding the upper bound and subtracting one.
  let endIndex = upperBoundIndex(primeNumbers, rangeEnd) - 1;

  // If there are not at least two primes in the range, return [-1, -1].
  if (endIndex - startIndex < 1) {
    return [-1, -1];
  }

  // Initialize variables to keep track of the smallest gap and the closest prime pair.
  let minimumGap = Number.MAX_SAFE_INTEGER;
  let closestPrimePair: number[] = [-1, -1];

  // Iterate through the primes within the range to find the pair with the minimum difference.
  for (let currentIndex = startIndex; currentIndex < endIndex; currentIndex++) {
    // Calculate the gap between consecutive primes.
    const currentGap = primeNumbers[currentIndex + 1] - primeNumbers[currentIndex];

    // Update if a smaller gap is found.
    if (currentGap < minimumGap) {
      minimumGap = currentGap;
      closestPrimePair = [primeNumbers[currentIndex], primeNumbers[currentIndex + 1]];

      // Early exit on twin primes (gap of 2) since they are the optimal pair.
      if (currentGap === 2) {
        return closestPrimePair;
      }
    }
  }

  // Return the closest prime pair found within the range.
  return closestPrimePair;
}
