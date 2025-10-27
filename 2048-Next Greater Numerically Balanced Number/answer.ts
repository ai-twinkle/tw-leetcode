/**
 * Perform a binary search to find the first element strictly greater than the given target.
 * @param sortedArray - A sorted Uint32Array of ascending numbers.
 * @param targetValue - The number to compare against.
 * @returns The index of the first element > targetValue, or sortedArray.length if not found.
 */
function upperBound(sortedArray: Uint32Array, targetValue: number): number {
  let leftIndex = 0
  let rightIndex = sortedArray.length

  while (leftIndex < rightIndex) {
    const middleIndex = (leftIndex + rightIndex) >>> 1
    if (sortedArray[middleIndex] > targetValue) {
      rightIndex = middleIndex
    } else {
      leftIndex = middleIndex + 1
    }
  }

  return leftIndex
}

/**
 * Precompute all numerically balanced numbers with up to 7 digits (using digits 1 through 7).
 *
 * A number is numerically balanced if, for every digit d in the number,
 * the count of digit d is exactly equal to d.
 */
const PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS: Uint32Array = (() => {
  const allBalancedNumbers: number[] = []
  const remainingDigitCounts = new Int8Array(8) // index 1..7 represents the remaining count for each digit

  /**
   * Recursive helper to generate all possible numeric combinations that satisfy the balanced condition.
   * @param digitsRemaining - Number of digits left to place.
   * @param currentValue - Current partial integer being formed.
   */
  function generateNumbersRecursively(digitsRemaining: number, currentValue: number) {
    if (digitsRemaining === 0) {
      allBalancedNumbers.push(currentValue)
      return
    }

    // Try placing each digit that still has remaining occurrences
    for (let digit = 1; digit <= 7; digit++) {
      if (remainingDigitCounts[digit] > 0) {
        remainingDigitCounts[digit]--

        // Build next integer by appending the digit
        const nextValue = currentValue * 10 + digit
        generateNumbersRecursively(digitsRemaining - 1, nextValue)

        // Backtrack after exploring this branch
        remainingDigitCounts[digit]++
      }
    }
  }

  /**
   * Generate all possible digit subsets (from 1 to 7) where each digit d appears exactly d times.
   * Skip subsets whose total digit count exceeds 7.
   */
  function generateAllSubsets() {
    const totalSubsets = 1 << 7 // 2^7 possible subsets of digits {1..7}

    for (let subsetMask = 1; subsetMask < totalSubsets; subsetMask++) {
      let totalDigitCount = 0

      // Compute total digit occurrences for this subset
      for (let bitIndex = 0; bitIndex < 7; bitIndex++) {
        if ((subsetMask & (1 << bitIndex)) !== 0) {
          totalDigitCount += bitIndex + 1
        }
      }

      // Skip invalid subsets that exceed 7 total digits
      if (totalDigitCount === 0 || totalDigitCount > 7) {
        continue
      }

      // Initialize remaining counts for this subset
      for (let digit = 1; digit <= 7; digit++) {
        remainingDigitCounts[digit] = (subsetMask & (1 << (digit - 1))) !== 0 ? digit : 0
      }

      // Begin recursive generation for this subset
      generateNumbersRecursively(totalDigitCount, 0)
    }
  }

  // Generate all balanced numbers once
  generateAllSubsets()

  // Sort results for binary search compatibility
  allBalancedNumbers.sort((a, b) => a - b)

  // Pack into a Uint32Array for cache efficiency
  const packedArray = new Uint32Array(allBalancedNumbers.length)
  for (let index = 0; index < allBalancedNumbers.length; index++) {
    packedArray[index] = allBalancedNumbers[index]
  }

  return packedArray
})()

/**
 * Find the smallest numerically balanced number strictly greater than n.
 *
 * A number is numerically balanced if, for every digit d in it,
 * the count of digit d is exactly d.
 *
 * Constraints: 0 <= n <= 10^6
 *
 * @param n - The given integer.
 * @returns The smallest numerically balanced number strictly greater than n.
 * @throws RangeError - If no numerically balanced number exists that is strictly greater than n.
 */
function nextBeautifulNumber(n: number): number {
  // Binary search to locate the first precomputed number strictly greater than n
  const foundIndex = upperBound(PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS, n)

  // If not found, signal to the caller that the request is out of the supported range
  if (foundIndex >= PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS.length) {
    throw new RangeError(
      `No numerically balanced number strictly greater than ${n} exists within the precomputed range.`
    )
  }

  // Return the next numerically balanced number
  return PRECOMPUTED_NUMERICALLY_BALANCED_NUMBERS[foundIndex]
}
