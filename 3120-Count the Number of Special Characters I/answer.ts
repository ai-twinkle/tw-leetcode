function numberOfSpecialChars(word: string): number {
  // Bitmasks where bit i represents the i-th letter of the alphabet
  let lowercaseMask = 0;
  let uppercaseMask = 0;
  const length = word.length;

  // Single pass: classify each character by ASCII range and set its bit
  for (let index = 0; index < length; index++) {
    const charCode = word.charCodeAt(index);
    // Lowercase ASCII is 97-122, uppercase ASCII is 65-90
    if (charCode >= 97) {
      lowercaseMask |= 1 << (charCode - 97);
    } else {
      uppercaseMask |= 1 << (charCode - 65);
    }
  }

  // Letters present in both masks are the special ones
  let intersection = lowercaseMask & uppercaseMask;

  // SWAR popcount: count set bits using parallel bit arithmetic in O(1)
  intersection = intersection - ((intersection >> 1) & 0x55555555);
  intersection = (intersection & 0x33333333) + ((intersection >> 2) & 0x33333333);
  return (((intersection + (intersection >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}
