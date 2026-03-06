function checkOnesSegment(s: string): boolean {
  let hasSeenZero = false;

  for (let index = 1; index < s.length; index++) {
    const currentCharacterCode = s.charCodeAt(index);

    // Once a zero appears, any later one makes the string invalid
    if (currentCharacterCode === 48) {
      hasSeenZero = true;
    } else if (hasSeenZero) {
      return false;
    }
  }

  return true;
}
