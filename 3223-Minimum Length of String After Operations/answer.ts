function minimumLength(s: string): number {
  if (s.length <= 2) {
    return s.length;
  }

  const charCount = new Array(26).fill(0);

  for (const char of s) {
    charCount[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
  }

  let result = 0;
  for (let i = 0; i < 26; i++) {
    if (charCount[i] === 0) {
      continue;
    }

    if (charCount[i] > 2) {
      result += charCount[i] % 2 === 0 ? 2 : 1;
    } else {
      result += charCount[i];
    }
  }

  return result;
}
