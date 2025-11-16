function numSub(s: string): number {
  const MODULO = 1000000007;
  const length = s.length;

  // Total count of valid substrings modulo
  let totalSubstrings = 0;

  // Current length of the consecutive '1' segment
  let consecutiveOnesLength = 0;

  // Iterate over the string using index to avoid iterator overhead
  for (let index = 0; index < length; index++) {
    // Read character code once for better performance
    const characterCode = s.charCodeAt(index);

    // '1' has character code 49
    if (characterCode === 49) {
      // Extend the current block of '1's
      consecutiveOnesLength++;

      // Each new '1' adds `consecutiveOnesLength` substrings ending here
      totalSubstrings += consecutiveOnesLength;

      // Keep the running total within the modulo range
      if (totalSubstrings >= MODULO) {
        totalSubstrings -= MODULO;
      }
    } else {
      // Reset the block length when we encounter '0'
      consecutiveOnesLength = 0;
    }
  }

  return totalSubstrings;
}
