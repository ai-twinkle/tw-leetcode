function mirrorDistance(n: number): number {
  // Reverse digits using arithmetic to avoid string allocation
  let reversed = 0;
  let remaining = n;

  while (remaining > 0) {
    // Extract last digit and append to reversed
    reversed = reversed * 10 + (remaining % 10);
    remaining = (remaining / 10) | 0;
  }

  // Compute absolute difference using branchless abs
  const difference = n - reversed;
  return difference < 0 ? -difference : difference;
}
