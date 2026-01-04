const MAXIMUM_NUM_VALUE = 100000;
const sumOfDivisorsForNumbersWithFourDivisors =
  precomputeFourDivisorSums(MAXIMUM_NUM_VALUE);

/**
 * Precomputes divisor sums for numbers that have exactly four divisors.
 * This allows the main function to answer each query in O(1) time.
 *
 * @param maxValue Upper bound for the input values.
 * @returns Lookup table where index = number, value = sum of divisors or 0.
 */
function precomputeFourDivisorSums(maxValue: number): Int32Array {
  // Uint8Array is used as a fast, memory-efficient boolean array for sieve marking
  const isComposite = new Uint8Array(maxValue + 1);

  // Pre-allocate prime storage to avoid dynamic array resizing overhead
  const primeBuffer = new Int32Array(maxValue);
  let primeCount = 0;

  // Sieve of Eratosthenes to generate all primes up to maxValue
  for (let candidate = 2; candidate <= maxValue; candidate++) {
    if (isComposite[candidate] === 0) {
      primeBuffer[primeCount] = candidate;
      primeCount++;

      // Start marking from candidate² to avoid redundant work
      const candidateSquared = candidate * candidate;
      if (candidateSquared <= maxValue) {
        for (
          let multiple = candidateSquared;
          multiple <= maxValue;
          multiple += candidate
        ) {
          isComposite[multiple] = 1;
        }
      }
    }
  }

  // Create a trimmed view of the prime list to avoid unused capacity
  const primes = primeBuffer.subarray(0, primeCount);

  // Lookup table storing divisor sums only for valid four-divisor numbers
  const divisorSumLookup = new Int32Array(maxValue + 1);

  // Case 1: Numbers of the form p³
  // These are the only prime powers that have exactly four divisors
  for (let primeIndex = 0; primeIndex < primes.length; primeIndex++) {
    const primeValue = primes[primeIndex];
    const primeSquared = primeValue * primeValue;
    const primeCubed = primeSquared * primeValue;

    // Early exit prevents unnecessary overflow checks and iterations
    if (primeCubed > maxValue) {
      break;
    }

    // Store divisor sum directly for O(1) lookup later
    divisorSumLookup[primeCubed] =
      1 + primeValue + primeSquared + primeCubed;
  }

  // Case 2: Numbers of the form p * q where p ≠ q
  // Using ordered prime pairs ensures each number is processed exactly once
  for (let firstPrimeIndex = 0; firstPrimeIndex < primes.length; firstPrimeIndex++) {
    const firstPrime = primes[firstPrimeIndex];

    for (
      let secondPrimeIndex = firstPrimeIndex + 1;
      secondPrimeIndex < primes.length;
      secondPrimeIndex++
    ) {
      const secondPrime = primes[secondPrimeIndex];
      const product = firstPrime * secondPrime;

      // Primes are increasing, so all further products will exceed maxValue
      if (product > maxValue) {
        break;
      }

      // Store divisor sum for fast access during queries
      divisorSumLookup[product] =
        1 + firstPrime + secondPrime + product;
    }
  }

  return divisorSumLookup;
}

/**
 * Returns the sum of divisors of all numbers in the input array
 * that have exactly four divisors.
 *
 * @param nums Input integer array.
 * @returns Total sum of valid divisor sums.
 */
function sumFourDivisors(nums: number[]): number {
  const divisorSumLookup = sumOfDivisorsForNumbersWithFourDivisors;

  let totalSum = 0;

  // Linear scan with O(1) lookup ensures optimal runtime
  for (let index = 0; index < nums.length; index++) {
    const value = nums[index];
    totalSum += divisorSumLookup[value];
  }

  return totalSum;
}
