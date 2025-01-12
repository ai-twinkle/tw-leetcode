function canBeValid(s: string, locked: string): boolean {
  if (s.length % 2 !== 0) {
    return false;
  }

  let forwardBalance = 0;
  let backwardBalance = 0;

  for (let i = 0; i < s.length; i++) {
    // Forward-check balance
    forwardBalance += (s[i] === '(' || locked[i] === '0') ? 1 : -1;
    if (forwardBalance < 0) {
      return false;
    }

    // Reverse-check balance
    const reverseIndex = s.length - i - 1;
    backwardBalance += (s[reverseIndex] === ')' || locked[reverseIndex] === '0') ? 1 : -1;
    if (backwardBalance < 0) {
      return false;
    }
  }

  return true;
}
