const consonantSet = new Set('bcdfghjklmnpqrstvwxyz'.split(''));
const digitSet = new Set('1234567890');
const vowelSet = new Set('aeiou'.split(''));

function isValid(word: string): boolean {
  if (word.length < 3) {
    return false;
  }

  word = word.toLowerCase();

  let hasVowel = false;
  let hasConsonant = false;

  for (const character of word.split('')) {
    if (
      !consonantSet.has(character) &&
      !vowelSet.has(character) &&
      !digitSet.has(character)
    ) {
      return false;
    }
    hasVowel = hasVowel || vowelSet.has(character);
    hasConsonant = hasConsonant || consonantSet.has(character);
  }

  return hasVowel && hasConsonant;
}
