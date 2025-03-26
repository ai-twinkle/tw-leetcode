function minOperations(grid: number[][], x: number): number {
  const n = grid.length;
  const m = grid[0].length;
  const total = n * m;

  // Use a fixed-size Uint16Array as a frequency counter.
  // Assuming grid values are at most 10^4, the normalized value (value / x) will be within 0..10000.
  const freq = new Uint16Array(10001);

  // The remainder for the first cell; all cells must have the same remainder modulo x.
  const remainder = grid[0][0] % x;

  // Build frequency counts for normalized values (i.e. floor(value / x)).
  for (let i = 0; i < n; ++i) {
    const row = grid[i];
    for (let j = 0; j < m; ++j) {
      const val = row[j];
      if (val % x !== remainder) {
        return -1; // Not possible to equalize if remainders differ.
      }
      // Normalize value by dividing by x (using bitwise OR 0 for integer conversion)
      const norm = (val / x) >> 0;
      freq[norm]++;
    }
  }

  // Find the median (normalized) using cumulative frequency.
  // The median minimizes the total absolute deviation.
  const medianIndex = (total + 1) >> 1;
  let cumCount = 0;
  let medianNorm = 0;
  for (let i = 0; i < freq.length; i++) {
    cumCount += freq[i];
    if (cumCount >= medianIndex) {
      medianNorm = i;
      break;
    }
  }

  // Compute the total operations needed by summing the absolute difference from the median.
  let operations = 0;
  for (let i = 0; i < freq.length; i++) {
    if (freq[i] > 0) {
      operations += freq[i] * Math.abs(i - medianNorm);
    }
  }

  return operations;
}
