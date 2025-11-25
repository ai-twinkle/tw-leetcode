function smallestRepunitDivByK(k: number): number {
  // If divisible by 2 or 5, repunits cannot be divisible by k
  if (k % 2 === 0 || k % 5 === 0) {
    return -1;
  }

  // Remainder when building repunits mod k
  let remainder = 0;

  // Upper bound of search determined by pigeonhole principle
  for (let length = 1; length <= k; length++) {
    // Update remainder = (remainder * 10 + 1) % k
    remainder = remainder * 10 + 1;

    // This modulo is unavoidable, but keeping it alone inside
    // the loop is the minimal possible cost
    remainder = remainder % k;

    // When remainder hits zero, we found the answer
    if (remainder === 0) {
      return length;
    }
  }

  return -1;
}
