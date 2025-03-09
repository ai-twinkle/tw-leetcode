function numberOfAlternatingGroups(colors: number[], k: number): number {
  const n = colors.length;

  // If k is 1, every tile forms a valid group.
  if (k === 1) {
    return n;
  }

  // We set the `alternatingCount` start from 1 as the first tile is always included.
  let groupCount = 0;
  let alternatingCount = 1;

  // We traverse from index 1 to index (n + k - 1) to handle wrap-around.
  // We only count windows that start in the original circle (i - k + 1 < n).
  for (let i = 1; i < n + k - 1; i++) {
    // Compare current tile and previous tile (using modulo for circular access)
    if (colors[i % n] !== colors[(i - 1) % n]) {
      alternatingCount++;
    } else {
      // Reset the alternating run if consecutive colors are the same
      alternatingCount = 1;
    }

    // If the current alternating run is at least k,
    // then the subarray ending at index i (of length k) is valid.
    // We also ensure the subarray started within the original array.
    if (alternatingCount >= k && (i - k + 1) < n) {
      groupCount++;
    }
  }

  return groupCount;
}
