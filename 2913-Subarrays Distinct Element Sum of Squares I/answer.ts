function sumCounts(nums: number[]): number {
  const length = nums.length;

  // Stamp table keyed by value (1..100): holds the start index that last marked it,
  // so membership resets implicitly when the start index advances.
  const lastSeenStart = new Int32Array(101).fill(-1);

  let total = 0;

  for (let start = 0; start < length; start++) {
    // Running distinct count and its square for the window [start, end].
    let distinct = 0;
    let distinctSquared = 0;

    for (let end = start; end < length; end++) {
      const value = nums[end];

      if (lastSeenStart[value] !== start) {
        lastSeenStart[value] = start;

        // (d + 1)^2 = d^2 + 2d + 1, so the square advances without a multiply.
        distinctSquared += distinct + distinct + 1;
        distinct++;
      }

      total += distinctSquared;
    }
  }

  return total;
}
