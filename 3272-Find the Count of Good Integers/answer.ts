/**
 * Precompute factorials for n from 0 to MAX_DIGITS.
 */
const MAX_DIGITS = 10;
const factorials = new Array(MAX_DIGITS + 1).fill(1);
for (let i = 1; i <= MAX_DIGITS; i++) {
  factorials[i] = factorials[i - 1] * i; // Build factorial values for later use in multinomials.
}

/**
 * Computes the multinomial coefficient for a given digit frequency array.
 * This represents the number of distinct permutations of digits.
 *
 * @param {number[]} digitFrequencies - An array of counts for each digit (0-9).
 * @param {number} totalDigits - The total number of digits.
 * @returns {number} The multinomial coefficient value.
 */
function computeTotalPermutations(digitFrequencies: number[], totalDigits: number): number {
  let permutations = factorials[totalDigits];
  // Divide by the factorial of each digit count.
  for (let digit = 0; digit < 10; digit++) {
    permutations /= factorials[digitFrequencies[digit]];
  }
  return permutations;
}

/**
 * Computes the number of invalid permutations (those that have a leading zero)
 * given the digit frequencies.
 *
 * @param {number[]} digitFrequencies - An array of counts for each digit (0-9).
 * @param {number} totalDigits - The total number of digits.
 * @returns {number} The number of permutations with a leading zero.
 */
function computeInvalidLeadingZeroPermutations(digitFrequencies: number[], totalDigits: number): number {
  if (digitFrequencies[0] === 0) {
    return 0;
  }
  // Fix a zero at the first digit and arrange the rest.
  let invalidPermutations = factorials[totalDigits - 1] / factorials[digitFrequencies[0] - 1];
  for (let digit = 1; digit < 10; digit++) {
    invalidPermutations /= factorials[digitFrequencies[digit]];
  }
  return invalidPermutations;
}

/**
 * Generates a string key that uniquely identifies the digit frequency multiset.
 *
 * @param {string} numericString - The string representation of the candidate number.
 * @returns {string} A string key representing the frequency count,
 * e.g. "0,2,0,1,0,0,0,0,0,0".
 */
function getDigitFrequencyKey(numericString: string): string {
  const digitFrequency = new Array(10).fill(0);
  // Count frequency for each digit
  for (const char of numericString) {
    digitFrequency[Number(char)]++;
  }
  return digitFrequency.join(',');
}

/**
 * Computes the count of good integers for a given number of digits and a divisor.
 * A "good" integer can have its digits rearranged into a palindrome that is divisible by the divisor.
 *
 * @param {number} totalDigits - The number of digits.
 * @param {number} divisor - The divisor.
 * @returns {number} The count of good integers.
 */
function computeGoodIntegerCount(totalDigits: number, divisor: number): number {
  const validDigitFrequencySets = new Map<string, true>();

  // Process even-digit numbers.
  if (totalDigits % 2 === 0) {
    const halfLength = totalDigits / 2;
    const startNumber = Math.pow(10, halfLength - 1);
    const endNumber = Math.pow(10, halfLength);

    // Generate the palindromic candidate using the left half.
    for (let leftHalf = startNumber; leftHalf < endNumber; leftHalf++) {
      const leftHalfStr = leftHalf.toString();
      const rightHalfStr = leftHalfStr.split('').reverse().join('');
      const candidate = leftHalfStr + rightHalfStr;

      // Candidate is automatically valid (no leading zero) as leftHalfStr does not start with '0'
      if (parseInt(candidate, 10) % divisor === 0) {
        validDigitFrequencySets.set(getDigitFrequencyKey(candidate), true);
      }
    }
  } else {
    // Process odd-digit numbers.
    if (totalDigits === 1) {
      // Single-digit numbers.
      for (let digit = 1; digit < 10; digit++) {
        if (digit % divisor === 0) {
          const digitFrequency = new Array(10).fill(0);
          digitFrequency[digit] = 1;
          validDigitFrequencySets.set(digitFrequency.join(','), true);
        }
      }
    } else {
      const halfLength = Math.floor(totalDigits / 2);
      const startNumber = Math.pow(10, halfLength - 1);
      const endNumber = Math.pow(10, halfLength);

      // Generate the palindromic candidate by selecting left half and a middle digit.
      for (let leftHalf = startNumber; leftHalf < endNumber; leftHalf++) {
        const leftHalfStr = leftHalf.toString();
        const reversedLeftHalf = leftHalfStr.split('').reverse().join('');
        for (let middleDigit = 0; middleDigit < 10; middleDigit++) {
          const candidate = leftHalfStr + middleDigit.toString() + reversedLeftHalf;

          // Skip candidate if it has a leading zero.
          if (candidate[0] === '0') continue;
          if (parseInt(candidate, 10) % divisor === 0) {
            validDigitFrequencySets.set(getDigitFrequencyKey(candidate), true);
          }
        }
      }
    }
  }

  let totalGoodCount = 0;

  // Sum arrangements for each valid frequency set.
  for (const frequencyKey of validDigitFrequencySets.keys()) {
    const digitFrequencies = frequencyKey.split(',').map(Number);
    let arrangements = computeTotalPermutations(digitFrequencies, totalDigits);

    // Remove arrangements that would result in a leading zero.
    if (digitFrequencies[0] > 0) {
      arrangements -= computeInvalidLeadingZeroPermutations(digitFrequencies, totalDigits);
    }
    totalGoodCount += arrangements;
  }
  return totalGoodCount;
}

/**
 * Precomputes results for all possible (n, divisor) pairs within the problem constraints.
 * n ranges from 1 to MAX_DIGITS and divisor ranges from 1 to 9.
 *
 * @returns {number[][]} A 2D array where result[n][divisor] gives the count for n-digit numbers.
 */
function precomputeGoodIntegers(): number[][] {
  const precomputedResults: number[][] = Array.from({ length: MAX_DIGITS + 1 }, () => Array(10).fill(0));
  // Iterate over all valid n and divisor values.
  for (let n = 1; n <= MAX_DIGITS; n++) {
    for (let divisor = 1; divisor <= 9; divisor++) {
      precomputedResults[n][divisor] = computeGoodIntegerCount(n, divisor);
    }
  }
  return precomputedResults;
}

// Precompute the results one time for efficient O(1) lookups.
const precomputedGoodIntegers = precomputeGoodIntegers();

/**
 * Returns the count of good integers for the specified number of digits and divisor.
 * This function uses precomputed values, providing an O(1) lookup.
 *
 * @param {number} n - The number of digits.
 * @param {number} k - The divisor.
 * @returns {number} The count of good integers.
 */
function countGoodIntegers(n: number, k: number): number {
  return precomputedGoodIntegers[n][k];
}
