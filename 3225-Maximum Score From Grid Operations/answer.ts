function maximumScore(grid: number[][]): number {
  const n = grid.length;
  // A single column has no horizontal neighbors, so no white cell can score.
  if (n === 1) {
    return 0;
  }

  // Column-major prefix sums in a flat Float64Array for cache-friendly access.
  // colPrefix[j * stride + k] = sum of grid[0..k-1][j]
  const stride = n + 1;
  const colPrefix = new Float64Array(n * stride);
  for (let j = 0; j < n; j++) {
    const base = j * stride;
    let running = 0;
    for (let i = 0; i < n; i++) {
      running += grid[i][j];
      colPrefix[base + i + 1] = running;
    }
  }

  // dp[a * stride + b] holds the best total score when h[j-1] = a and h[j] = b,
  // with all column contributions for indices < j already finalized.
  let dp = new Float64Array(stride * stride);
  let next = new Float64Array(stride * stride);

  // Seed at j = 1: place h[0] = a, h[1] = b. Column 0 has no left neighbor,
  // so its contribution depends only on h[1] = b: rows i in [a, b-1] when b > a.
  for (let a = 0; a <= n; a++) {
    for (let b = 0; b <= n; b++) {
      let contribution = 0;
      if (b > a) {
        contribution = colPrefix[b] - colPrefix[a];
      }
      dp[a * stride + b] = contribution;
    }
  }

  // Reusable scratch buffers indexed by a (= h[j-1]).
  const prefMaxOverA = new Float64Array(stride);
  const suffMaxBoostedOverA = new Float64Array(stride);

  // Process j = 1 .. n - 2: closing column j with neighbors h[j-1] = a and h[j+1] = c.
  // Column j contribution = colPrefix[j][max(a, c)] - colPrefix[j][b] when max(a, c) > b.
  for (let j = 1; j <= n - 2; j++) {
    const colBaseJ = j * stride;

    // For every b, prebuild two reductions over a so transitions become O(1) per (b, c).
    for (let b = 0; b <= n; b++) {
      // Prefix maximum of dp[a][b] for a in [0, k]
      let runningPrefMax = -Infinity;
      for (let a = 0; a <= n; a++) {
        const value = dp[a * stride + b];
        if (value > runningPrefMax) {
          runningPrefMax = value;
        }
        prefMaxOverA[a] = runningPrefMax;
      }

      // Suffix maximum of (dp[a][b] + colPrefix[j][a]) for a in [k, n]
      let runningSuffMax = -Infinity;
      for (let a = n; a >= 0; a--) {
        const boosted = dp[a * stride + b] + colPrefix[colBaseJ + a];
        if (boosted > runningSuffMax) {
          runningSuffMax = boosted;
        }
        suffMaxBoostedOverA[a] = runningSuffMax;
      }

      const subtractAtB = colPrefix[colBaseJ + b];
      const nextRowBase = b * stride;

      for (let c = 0; c <= n; c++) {
        // Case A (a <= c, max(a,c) = c): contribution depends only on c.
        let caseA = prefMaxOverA[c];
        if (c > b) {
          caseA += colPrefix[colBaseJ + c] - subtractAtB;
        }

        // Case B (a > c, max(a,c) = a): split by whether a > b for the contribution sign.
        let caseB = -Infinity;
        if (c + 1 <= n) {
          if (c >= b) {
            // All a > c also satisfy a > b, so the boosted formula is exact.
            caseB = suffMaxBoostedOverA[c + 1] - subtractAtB;
          } else {
            // a in (c, b]: contribution is 0; a in (b, n]: boosted form applies.
            let lowPart = -Infinity;
            if (b >= c + 1) {
              // Upper bound; if argmax lies in [0,c], case A already covers it.
              lowPart = prefMaxOverA[b];
            }
            let highPart = -Infinity;
            if (b + 1 <= n) {
              highPart = suffMaxBoostedOverA[b + 1] - subtractAtB;
            }
            caseB = lowPart > highPart ? lowPart : highPart;
          }
        }

        next[nextRowBase + c] = caseA > caseB ? caseA : caseB;
      }
    }

    // Roll buffers
    const tmp = dp;
    dp = next;
    next = tmp;
  }

  // Close the last column n-1 using only its left neighbor a = h[n-2].
  let maximumGridScore = 0;
  const colBaseLast = (n - 1) * stride;
  for (let a = 0; a <= n; a++) {
    const rowBase = a * stride;
    const colSumAtA = colPrefix[colBaseLast + a];
    for (let b = 0; b <= n; b++) {
      const stateScore = dp[rowBase + b];
      let contribution = 0;
      if (a > b) {
        contribution = colSumAtA - colPrefix[colBaseLast + b];
      }
      const total = stateScore + contribution;
      if (total > maximumGridScore) {
        maximumGridScore = total;
      }
    }
  }

  return maximumGridScore;
}
