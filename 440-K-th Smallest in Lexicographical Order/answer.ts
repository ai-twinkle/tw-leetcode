function findKthNumber(n: number, k: number): number {
  let currentPrefix = 1;      // Current prefix in our lexicographical walk
  let remainingSteps = k - 1; // How many more steps to move (we're already on "1")
  const upperBound = n + 1;   // Cache this so we don’t re-compute n + 1 every loop

  while (remainingSteps > 0) {
    // Count how many numbers lie under currentPrefix's "subtree"
    let countUnderPrefix = 0;
    let first = currentPrefix;
    let next = currentPrefix + 1;

    // Dive one digit deeper at a time (<=10 levels for n <= 10^9)
    while (first < upperBound) {
      // Inline min() is faster than Math.min
      countUnderPrefix += (next < upperBound ? next : upperBound) - first;
      first *= 10;
      next *= 10;
    }

    if (countUnderPrefix <= remainingSteps) {
      // Skip the entire block of size countUnderPrefix
      currentPrefix += 1;
      remainingSteps -= countUnderPrefix;
    } else {
      // Step into the next digit (the "first child")
      currentPrefix *= 10;
      remainingSteps -= 1;
    }
  }

  return currentPrefix;
}
