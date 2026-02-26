function numSteps(s: string): number {
  const length = s.length;

  // Single-bit "1" is already reduced.
  if (length === 1) {
    return 0;
  }

  let steps = 0;
  let carry = 0;

  // Process from least-significant bit down to index 1 (stop before the leading '1').
  for (let index = length - 1; index >= 1; index--) {
    // Convert current bit to 0/1 without parseInt overhead.
    const bit = s.charCodeAt(index) & 1;
    const value = bit ^ carry;

    // Important step: odd -> "+1" then "/2" (2 ops), even -> "/2" (1 op)
    if (value === 0) {
      steps += 1;
    } else {
      steps += 2;
      carry = 1;
    }
  }

  // If carry remains, the leading '1' became '10', requiring one final "/2".
  if (carry !== 0) {
    steps += 1;
  }

  return steps;
}
