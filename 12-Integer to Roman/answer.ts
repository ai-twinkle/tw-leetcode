// Pre-computed Roman numeral strings for each decimal place, stored outside the function for O(1) lookup
const THOUSANDS: readonly string[] = ["", "M", "MM", "MMM"];
const HUNDREDS: readonly string[] = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
const TENS: readonly string[] = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
const ONES: readonly string[] = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/**
 * Converts an integer to its Roman numeral representation.
 * @param num - The integer to convert (1 <= num <= 3999)
 * @returns The Roman numeral string
 */
function intToRoman(num: number): string {
  // Decompose by decimal place and concatenate pre-computed parts
  return THOUSANDS[(num / 1000) | 0] + HUNDREDS[((num / 100) | 0) % 10] + TENS[((num / 10) | 0) % 10] + ONES[num % 10];
}
