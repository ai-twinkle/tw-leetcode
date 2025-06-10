function maxDifference(s: string): number {
  // Pre-allocate once to avoid repeated allocations on every call
  const characterFrequency = new Uint16Array(26);

  // Fast zero-reset
  characterFrequency.fill(0);

  const lengthOfString = s.length;
  // Count frequencies
  for (let position = 0; position < lengthOfString; position++) {
    // charCodeAt is a little faster when you store it in a local
    const letterCode = s.charCodeAt(position) - 97;
    characterFrequency[letterCode]++;
  }

  // Track the largest odd and smallest even
  let highestOddFrequency = -Infinity;
  let lowestEvenFrequency = Infinity;

  // Scan only the 26 letters
  for (let i = 0; i < 26; i++) {
    const count = characterFrequency[i];
    if (count === 0) {
      continue;
    }

    // Bitwise check for even vs. odd is slightly cheaper than % 2
    if ((count & 1) === 0) {
      if (count < lowestEvenFrequency) {
        lowestEvenFrequency = count;
      }
    } else {
      if (count > highestOddFrequency) {
        highestOddFrequency = count;
      }
    }
  }

  return highestOddFrequency - lowestEvenFrequency;
}
