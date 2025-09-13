// Bitmask marks which letters are vowels ('a', 'e', 'i', 'o', 'u')
const VOWEL_BITMASK_A_TO_Z =
  (1 << 0) | (1 << 4) | (1 << 8) | (1 << 14) | (1 << 20);

function maxFreqSum(s: string): number {
  // Stores frequency for each letter 'a' to 'z'
  const frequencyByLetter = new Uint32Array(26);

  // Track maximum frequency among vowels and consonants
  let vowelMaximumFrequency = 0;
  let consonantMaximumFrequency = 0;

  // Count characters in the string
  for (let i = 0; i < s.length; i++) {
    // Convert character into index (0 for 'a', 1 for 'b', …, 25 for 'z')
    const index = s.charCodeAt(i) - 97;

    // Increase frequency count for this letter
    const newCount = ++frequencyByLetter[index];

    if ((VOWEL_BITMASK_A_TO_Z >>> index) & 1) {
      // If this letter is a vowel, update vowel maximum
      if (newCount > vowelMaximumFrequency) {
        vowelMaximumFrequency = newCount;
      }
    } else {
      // Otherwise update consonant maximum
      if (newCount > consonantMaximumFrequency) {
        consonantMaximumFrequency = newCount;
      }
    }
  }

  // Return the sum of maximum vowel frequency and maximum consonant frequency
  return vowelMaximumFrequency + consonantMaximumFrequency;
}
