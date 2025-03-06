function findMissingAndRepeatedValues(grid: number[][]): number[] {
  const n = grid.length;
  let sum = 0, sumSq = 0;

  // Traverse the grid and compute the sums.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const num = grid[i][j];
      sum += num;
      sumSq += num * num;
    }
  }

  const total = (n * n * (n * n + 1)) / 2;
  const totalSq = (n * n * (n * n + 1) * (2 * n * n + 1)) / 6;

  const diff = sum - total; // a - b
  const sumDiff = sumSq - totalSq; // a^2 - b^2 = (a - b)(a + b)

  // Compute a + b
  const sumAB = sumDiff / diff;

  // Solve for a and b
  const a = (sumAB + diff) / 2;
  const b = (sumAB - diff) / 2;

  return [a, b];
}
