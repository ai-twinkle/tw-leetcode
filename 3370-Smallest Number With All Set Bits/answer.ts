function smallestNumber(n: number): number {
  // Start from the smallest all-ones candidate: 1 (binary 1)
  let allOnesCandidate = 1;

  // Maintain the all-ones pattern by doubling and adding 1 until it reaches or exceeds n
  while (allOnesCandidate < n) {
    allOnesCandidate = allOnesCandidate * 2 + 1;
  }

  // Return the first all-ones number that is ≥ n
  return allOnesCandidate;
}
