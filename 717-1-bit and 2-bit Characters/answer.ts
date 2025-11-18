function isOneBitCharacter(bits: number[]): boolean {
  const length = bits.length;

  // Start from the bit just before the final 0
  let index = length - 2;
  let consecutiveOneCount = 0;

  // Count consecutive 1s immediately before the last 0
  while (index >= 0 && bits[index] === 1) {
    consecutiveOneCount += 1;
    index -= 1;
  }

  // If the number of consecutive 1s before the last 0 is even,
  // the last 0 cannot be part of a 2-bit character and therefore
  // must represent a standalone 1-bit character.
  return (consecutiveOneCount & 1) === 0;
}
