// Map ASCII code -> vowel index in sorted ASCII order, or -1 if not a vowel.
const VOWEL_INDEX = (() => {
  const vowelIndexTable = new Int8Array(128);
  vowelIndexTable.fill(-1);

  // ASCII-sorted vowel order: 'A','E','I','O','U','a','e','i','o','u'
  vowelIndexTable[65] = 0;   // 'A'
  vowelIndexTable[69] = 1;   // 'E'
  vowelIndexTable[73] = 2;   // 'I'
  vowelIndexTable[79] = 3;   // 'O'
  vowelIndexTable[85] = 4;   // 'U'
  vowelIndexTable[97] = 5;   // 'a'
  vowelIndexTable[101] = 6;  // 'e'
  vowelIndexTable[105] = 7;  // 'i'
  vowelIndexTable[111] = 8;  // 'o'
  vowelIndexTable[117] = 9;  // 'u'

  return vowelIndexTable;
})();

// Vowel characters in nondecreasing ASCII order (parallel to VOWEL_INDEX mapping).
const VOWEL_CHARACTERS = ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'];

function sortVowels(s: string): string {
  const stringLength = s.length;

  if (stringLength <= 1) {
    return s;
  }

  // Count vowels by their ASCII order bucket (10 buckets).
  const vowelCountByIndex = new Uint32Array(10);

  // Mark vowel positions to avoid calling charCodeAt twice on each character.
  const vowelPositionMask = new Uint8Array(stringLength);

  // Pass 1: count vowels and mark positions.
  for (let characterIndex = 0; characterIndex < stringLength; characterIndex++) {
    const characterCode = s.charCodeAt(characterIndex); // ASCII letters only by constraints

    let vowelIndex = -1;
    if (characterCode < 128) {
      vowelIndex = VOWEL_INDEX[characterCode];
    }

    if (vowelIndex >= 0) {
      vowelCountByIndex[vowelIndex]++;
      vowelPositionMask[characterIndex] = 1;
    }
  }

  // Pass 2: rebuild with consonants fixed and vowels in sorted ASCII order.
  const outputCharacters: string[] = new Array(stringLength);
  let vowelBucketPointer = 0; // current vowel bucket pointer

  for (let characterIndex = 0; characterIndex < stringLength; characterIndex++) {
    if (vowelPositionMask[characterIndex]) {
      // Advance to next nonempty vowel bucket (at most 10 steps total across the whole loop).
      while (vowelBucketPointer < 10) {
        if (vowelCountByIndex[vowelBucketPointer] > 0) {
          break;
        }
        vowelBucketPointer++;
      }

      // Place the next vowel from the current bucket.
      outputCharacters[characterIndex] = VOWEL_CHARACTERS[vowelBucketPointer];
      vowelCountByIndex[vowelBucketPointer]--;
    } else {
      // Keep consonants in place.
      outputCharacters[characterIndex] = s[characterIndex];
    }
  }

  return outputCharacters.join('');
}
