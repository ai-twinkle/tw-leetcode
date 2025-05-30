function canConstruct(s: string, k: number): boolean {
  const stringLength = s.length;
  // Quick reject: not enough characters to give each palindrome at least one odd center
  if (stringLength < k) {
    return false;
  }

  // Build a 26-bit mask: bit i is 1 if the i-th letter ('a'+i) appears an odd number of times
  const baseCharCode = 97; // 'a'
  let letterParityBitmask = 0;

  for (let i = 0; i < stringLength; ++i) {
    const letterIndex = s.charCodeAt(i) - baseCharCode;
    letterParityBitmask ^= (1 << letterIndex);
  }

  // Count how many bits are set (i.e., how many letters have odd counts).
  // Stop early if we exceed k.
  let oddCharacterCount = 0;
  while (letterParityBitmask !== 0) {
    // Clear lowest set bit
    letterParityBitmask &= (letterParityBitmask - 1);
    ++oddCharacterCount;

    if (oddCharacterCount > k) {
      return false;
    }
  }

  return true;
}
