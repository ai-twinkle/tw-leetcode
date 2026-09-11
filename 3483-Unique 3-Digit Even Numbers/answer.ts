/** Digits a three-digit even number is allowed to end with. */
const EVEN_UNIT_DIGITS = new Uint8Array([0, 2, 4, 6, 8]);

/**
 * Counts the distinct three-digit even numbers that can be built from the given digits,
 * using each copy of a digit at most once per number and forbidding a leading zero.
 * @param digits - The pool of available digits (length 3..10, values 0..9).
 * @returns The amount of distinct three-digit even numbers.
 */
function totalNumbers(digits: number[]): number {
  // Bucket the multiset once so every availability test later is O(1).
  const digitCounts = new Uint8Array(10);
  const digitsLength = digits.length;
  for (let index = 0; index < digitsLength; index += 1) {
    digitCounts[digits[index]] += 1;
  }

  // The middle position accepts any still-available distinct digit, so the pool size is the base value.
  let distinctDigits = 0;
  for (let digit = 0; digit < 10; digit += 1) {
    if (digitCounts[digit] > 0) {
      distinctDigits += 1;
    }
  }

  let total = 0;
  for (let unitIndex = 0; unitIndex < 5; unitIndex += 1) {
    const unitDigit = EVEN_UNIT_DIGITS[unitIndex];
    const unitCount = digitCounts[unitDigit];
    if (unitCount === 0) {
      continue;
    }

    for (let hundredDigit = 1; hundredDigit < 10; hundredDigit += 1) {
      const hundredCount = digitCounts[hundredDigit];
      if (hundredCount === 0) {
        continue;
      }

      if (hundredDigit === unitDigit) {
        // Both ends consume the same digit, so two copies are mandatory.
        if (hundredCount < 2) {
          continue;
        }
        // Taking two copies can only exhaust this one digit, never any other.
        if (hundredCount === 2) {
          total += distinctDigits - 1;
        } else {
          total += distinctDigits;
        }
        continue;
      }

      // An end digit leaves the middle pool only when the pool held exactly one copy of it.
      let middleChoices = distinctDigits;
      if (hundredCount === 1) {
        middleChoices -= 1;
      }
      if (unitCount === 1) {
        middleChoices -= 1;
      }
      total += middleChoices;
    }
  }

  return total;
}
