function distributeCandies(n: number, limit: number): number {
  // Precomputed binomial(3, i) for i = 0..3
  const binom3 = [1, 3, 3, 1];

  let totalNumberOfWays = 0;

  // Loop i = 0..3 in the inclusion–exclusion formula
  for (let i = 0; i <= 3; i++) {
    const remaining = n - i * (limit + 1);
    if (remaining < 0) {
      // If n - i*(limit+1) < 0, that term contributes 0
      continue;
    }

    // Compute C(remaining + 2, 2) = ((remaining + 2)*(remaining + 1)) / 2
    const waysToSum = ((remaining + 2) * (remaining + 1)) / 2;

    // Sign is +1 if i is even, -1 if i is odd
    const sign = (i % 2 === 0) ? 1 : -1;

    totalNumberOfWays += sign * binom3[i] * waysToSum;
  }

  return totalNumberOfWays;
}
