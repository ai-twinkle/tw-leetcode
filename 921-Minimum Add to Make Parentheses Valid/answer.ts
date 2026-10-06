function minAddToMakeValid(s: string): number {
  const length = s.length;
  let balance = 0;
  let insertions = 0;

  for (let index = 0; index < length; index++) {
    // '(' (code 40) yields +1 and ')' (code 41) yields -1 without any comparison
    balance += 81 - 2 * s.charCodeAt(index);

    // Sign mask is -1 while balance is negative and 0 otherwise
    const negativeMask = balance >> 31;
    const deficit = balance & negativeMask;

    // Charge the unmatched ')' and reset the balance back to zero
    insertions -= deficit;
    balance -= deficit;
  }

  // Leftover '(' each need one closing parenthesis
  return insertions + balance;
}
