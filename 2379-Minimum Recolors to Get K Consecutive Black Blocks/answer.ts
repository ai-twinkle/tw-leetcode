function minimumRecolors(blocks: string, k: number): number {
  const n = blocks.length;
  let currentRecolors = 0;

  // Compute the recoloring needed for the initial window
  for (let i = 0; i < k; i++) {
    if (blocks[i] === 'W') {
      currentRecolors++;
    }
  }

  let minRecolors = currentRecolors;
  // Early exit if an initial window requires no changes
  if (minRecolors === 0) {
    return 0;
  }

  // Slide the window from index k to the end of the string
  for (let i = k; i < n; i++) {
    if (blocks[i] === 'W') {
      currentRecolors++;
    }
    if (blocks[i - k] === 'W') {
      currentRecolors--;
    }
    minRecolors = Math.min(minRecolors, currentRecolors);

    // Early exit if we reach a window with no white blocks
    if (minRecolors === 0) {
      return 0;
    }
  }

  return minRecolors;
}
