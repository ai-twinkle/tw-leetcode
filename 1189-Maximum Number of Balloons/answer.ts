function maxNumberOfBalloons(text: string): number {
  // One slot per lowercase letter, indexed by charCode − 97
  const frequencyTable = new Int32Array(26);

  const textLength = text.length;

  // Single pass: accumulate counts for all characters
  for (let index = 0; index < textLength; index++) {
    frequencyTable[text.charCodeAt(index) - 97]++; // 97 = char code of 'a'
  }

  // "balloon" needs l×2 and o×2 — halve those before the minimum comparison
  return Math.min(
    frequencyTable[1],       // b = offset 1
    frequencyTable[0],       // a = offset 0
    frequencyTable[11] >> 1, // l = offset 11, needs 2 per balloon
    frequencyTable[14] >> 1, // o = offset 14, needs 2 per balloon
    frequencyTable[13]       // n = offset 13
  );
}
