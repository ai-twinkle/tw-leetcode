function canBeValid(s: string, locked: string): boolean {
  const n = s.length;

  // Odd length can never be balanced
  if ((n & 1) === 1) {
    return false;
  }

  const charOne = 49; // ASCII code for '1'
  const charLeftBracket = 40; // ASCII code for '('

  let minOpenBalance = 0;  // The lowest possible # of open parens so far
  let maxOpenBalance = 0;  // The highest possible # of open parens so far

  for (let i = 0; i < n; ++i) {
    const lockCode = locked.charCodeAt(i);
    const charCode = s.charCodeAt(i);

    if (lockCode === charOne) {
      // Locked: Must take exactly what s[i] is
      if (charCode === charLeftBracket) {
        ++minOpenBalance;
        ++maxOpenBalance;
      } else {
        --minOpenBalance;
        --maxOpenBalance;
      }
    } else {
      // Unlocked: We could choose '(' (so +1) or ')' (so –1)
      --minOpenBalance;
      ++maxOpenBalance;
    }

    // If even in the best case we have more ')' than '(', fail
    if (maxOpenBalance < 0) {
      return false;
    }

    // We never let our “lowest possible” dip below 0
    if (minOpenBalance < 0) {
      minOpenBalance = 0;
    }
  }

  // Only valid if we can end exactly balanced
  return minOpenBalance === 0;
}
