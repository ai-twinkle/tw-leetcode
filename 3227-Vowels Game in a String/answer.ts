function doesAliceWin(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 'a' || s[i] === 'e' || s[i] === 'i' || s[i] === 'o' || s[i] === 'u') {
      // If at least one vowel exists: Alice can make the first move and win
      return true;
    }
  }

  // No vowels found: Alice cannot make any valid move, so she loses
  return false;
}
