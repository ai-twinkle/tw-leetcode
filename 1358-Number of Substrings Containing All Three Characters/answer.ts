function numberOfSubstrings(s: string): number {
  const n = s.length;

  // Use a typed array to track the last seen positions (1-indexed) for 'a', 'b', and 'c'.
  const lastPositions = new Uint16Array(3);
  let totalSubstrings = 0;

  for (let i = 0; i < n; i++) {
    // Update last seen position for the current character.
    const charIndex = s.charCodeAt(i) - 97; // 'a' is 97 in ASCII
    lastPositions[charIndex] = i + 1;

    // The count of valid substrings ending at i is determined by the minimum
    // last-seen position among 'a', 'b', and 'c'.
    totalSubstrings += Math.min(lastPositions[0], lastPositions[1], lastPositions[2]);
  }

  return totalSubstrings;
}
