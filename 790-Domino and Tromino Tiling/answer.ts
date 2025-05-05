function numTilings(n: number): number {
  const MODULO_CONSTANT = 1_000_000_007;

  // The space constraint is 1 <= n <= 1000
  const dp = new Int32Array(1001);

  dp[0] = 1;  // “empty” board
  dp[1] = 1;  // only a single vertical domino
  dp[2] = 2;  // two verticals or two horizontals

  // Compute dp[3..n] in one pass
  for (let index = 3; index <= n; index++) {
    // multiply by 2 and add the dp from three back
    dp[index] = (2 * dp[index - 1] + dp[index - 3]) % MODULO_CONSTANT;
  }

  return dp[n];
}
