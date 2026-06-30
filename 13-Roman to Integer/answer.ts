// Pre-computed lookup table mapping each Roman symbol's char code to its value,
// stored outside the function for O(1) reuse
const ROMAN_VALUES = new Int16Array(90);
ROMAN_VALUES[73] = 1; // 'I'
ROMAN_VALUES[86] = 5; // 'V'
ROMAN_VALUES[88] = 10; // 'X'
ROMAN_VALUES[76] = 50; // 'L'
ROMAN_VALUES[67] = 100; // 'C'
ROMAN_VALUES[68] = 500; // 'D'
ROMAN_VALUES[77] = 1000; // 'M'

/**
 * Converts a Roman numeral string to its integer value.
 * @param s - A valid Roman numeral string in the range [1, 3999].
 * @returns The integer value represented by the Roman numeral.
 */
function romanToInt(s: string): number {
  const length = s.length;
  let total = 0;
  let previousValue = 0;

  // Traverse right to left so each symbol is added or subtracted based on the symbol to its right
  for (let index = length - 1; index >= 0; index--) {
    const currentValue = ROMAN_VALUES[s.charCodeAt(index)];

    // A smaller symbol before a larger one signals subtraction
    if (currentValue < previousValue) {
      total -= currentValue;
    } else {
      total += currentValue;
    }

    previousValue = currentValue;
  }

  return total;
}
