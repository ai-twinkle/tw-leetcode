function sumGame(num: string): boolean {
  const half = num.length >> 1;

  // Raw character-code difference between the paired halves; the '0' offsets cancel out.
  let rawCodeDifference = 0;
  // Count of '?' in the first half minus the count of '?' in the second half.
  let questionDifference = 0;

  // One pass over half the string, pairing index i with index i + half.
  for (let index = 0; index < half; index++) {
    const leftCode = num.charCodeAt(index);
    const rightCode = num.charCodeAt(index + half);

    rawCodeDifference += leftCode - rightCode;
    questionDifference += (leftCode === 63 ? 1 : 0) - (rightCode === 63 ? 1 : 0); // ASCII code 63 is '?'
  }

  // An odd number of '?' gives Alice the final move, so she can always break the balance.
  if ((questionDifference & 1) !== 0) {
    return true;
  }

  // Each '?' was counted as code 63, i.e. 15 above its true digit contribution, so remove that bias.
  const digitDifference = rawCodeDifference - 15 * questionDifference;

  // Bob mirrors every pair of '?' to a total of 9, so he ties exactly when 2*diff + 9*qDiff == 0.
  return 2 * digitDifference + 9 * questionDifference !== 0;
}
