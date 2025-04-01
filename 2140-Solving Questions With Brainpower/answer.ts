function mostPoints(questions: number[][]): number {
  const n = questions.length;
  // Use Float64Array to handle large sums.
  const dp = new Float64Array(n + 1).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    // Calculate index after skipping brainpower questions.
    const nextIndex = i + questions[i][1] + 1;
    // Choose max of skipping or solving current question.
    dp[i] = Math.max(dp[i + 1], questions[i][0] + dp[Math.min(nextIndex, n)]);
  }

  return dp[0];
}
