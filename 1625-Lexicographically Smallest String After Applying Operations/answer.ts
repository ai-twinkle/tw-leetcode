/**
 * Compute the greatest common divisor using Euclidean algorithm.
 *
 * @param valueA First positive integer
 * @param valueB Second positive integer
 * @returns Greatest common divisor of valueA and valueB
 */
function greaterCommonDivisor(valueA: number, valueB: number): number {
  while (valueB !== 0) {
    const remainder = valueA % valueB;
    valueA = valueB;
    valueB = remainder;
  }
  return valueA;
}

function findLexSmallestString(s: string, a: number, b: number): string {
  const stringLength = s.length;
  let smallestString = s;

  // Double the string for rotation without modulo overhead
  const doubledString = s + s;

  // Compute the greatest common divisor of rotation step and length
  const rotationStep = greaterCommonDivisor(b, stringLength);

  // Addition operation cycles every cycleLength times
  const cycleLength = 10 / greaterCommonDivisor(a, 10);

  /**
   * Apply the best possible addition operation to indices of given parity.
   * Finds the minimum digit achievable by trying all valid add cycles,
   * then applies that increment to all indices of the same parity.
   *
   * @param digits Mutable array of digits as characters
   * @param startIndex Starting index (0 for even, 1 for odd)
   */
  function applyBestAddition(digits: string[], startIndex: number) {
    const originalDigit = digits[startIndex].charCodeAt(0) - 48; // '0' -> 48
    let minimumDigit = 10;
    let bestTimes = 0;

    // Determine how many times to add 'a' for minimal result
    for (let times = 0; times < cycleLength; times++) {
      const addedDigit = (originalDigit + (times * a) % 10) % 10;
      if (addedDigit < minimumDigit) {
        minimumDigit = addedDigit;
        bestTimes = times;
      }
    }

    // Apply the best increment to all same-parity indices
    const increment = (bestTimes * a) % 10;
    for (let index = startIndex; index < stringLength; index += 2) {
      const baseDigit = digits[index].charCodeAt(0) - 48;
      digits[index] = String.fromCharCode(48 + ((baseDigit + increment) % 10));
    }
  }

  /**
   * Compare a candidate digits array to the current best string.
   * Performs character-by-character comparison without joining strings.
   *
   * @param candidateDigits Candidate array of digits as characters
   * @param currentBestString Current smallest string
   * @returns True if the candidate is lexicographically smaller
   */
  function isLexicographicallySmaller(candidateDigits: string[], currentBestString: string): boolean {
    for (let index = 0; index < stringLength; index++) {
      const candidateChar = candidateDigits[index].charCodeAt(0);
      const bestChar = currentBestString.charCodeAt(index);

      if (candidateChar < bestChar) {
        return true;
      }
      if (candidateChar > bestChar) {
        return false;
      }
    }
    return false;
  }

  // Explore valid rotations spaced by rotationStep
  for (let rotationIndex = 0; rotationIndex < stringLength; rotationIndex += rotationStep) {
    // Extract substring representing this rotation
    const rotatedDigits = doubledString.slice(rotationIndex, rotationIndex + stringLength).split("");

    // Always can modify odd indices
    applyBestAddition(rotatedDigits, 1);

    // If rotation step is odd, even indices can also become odd after rotations
    if ((b & 1) === 1) {
      applyBestAddition(rotatedDigits, 0);
    }

    // Compare to current best string before joining
    if (isLexicographicallySmaller(rotatedDigits, smallestString)) {
      smallestString = rotatedDigits.join("");
    }
  }

  return smallestString;
}
