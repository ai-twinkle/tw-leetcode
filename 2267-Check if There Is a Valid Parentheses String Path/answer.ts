function hasValidPath(grid: string[][]): boolean {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const pathLength = rowCount + columnCount - 1;

  // Every path has the same length, and a valid string must be even-length.
  if ((pathLength & 1) === 1) {
    return false;
  }

  // The first character must open and the last one must close.
  if (grid[0][0] === ')') {
    return false;
  }
  if (grid[rowCount - 1][columnCount - 1] === '(') {
    return false;
  }

  // A balance above half the path length can never be closed back to zero.
  const maximumBalance = pathLength >> 1;
  const wordCount = (maximumBalance >> 5) + 1;
  const lastWordIndex = wordCount - 1;
  const topBitIndex = maximumBalance & 31;
  const topWordMask = topBitIndex === 31 ? -1 : ((1 << (topBitIndex + 1)) - 1);

  // One rolling row of bitsets, with a zero-filled padding column at index 0
  // so the "left" neighbour of column 0 and the "above" neighbour of row 0
  // read as empty sets without any boundary branching.
  const balanceSets = new Uint32Array((columnCount + 1) * wordCount);

  // The start cell is known to be '(', so its only reachable balance is 1.
  balanceSets[wordCount] = 2;

  for (let row = 0; row < rowCount; row++) {
    const gridRow = grid[row];
    let aliveBits = 0;
    let startColumn = 0;

    // Row 0 starts at column 1 because the start cell is already seeded.
    if (row === 0) {
      aliveBits = 2;
      startColumn = 1;
    }

    for (let column = startColumn; column < columnCount; column++) {
      const base = (column + 1) * wordCount;
      const leftBase = base - wordCount;

      if (gridRow[column] === ')') {
        // Closing bracket lowers every balance by one; balance 0 simply
        // falls off the bottom of the bitset, which prunes it for free.
        // Walking low word to high keeps the unread words intact.
        for (let word = 0; word <= lastWordIndex; word++) {
          const incoming = balanceSets[base + word] | balanceSets[leftBase + word];
          let higherIncoming = 0;

          if (word < lastWordIndex) {
            higherIncoming = balanceSets[base + word + 1] | balanceSets[leftBase + word + 1];
          }

          const shifted = (incoming >>> 1) | (higherIncoming << 31);

          balanceSets[base + word] = shifted;
          aliveBits |= shifted;
        }

        continue;
      }

      // Opening bracket raises every incoming balance by one, so this
      // direction walks high word to low to keep the unread words intact.
      for (let word = lastWordIndex; word >= 0; word--) {
        const incoming = balanceSets[base + word] | balanceSets[leftBase + word];
        let lowerIncoming = 0;

        if (word > 0) {
          lowerIncoming = balanceSets[base + word - 1] | balanceSets[leftBase + word - 1];
        }

        let shifted = (incoming << 1) | (lowerIncoming >>> 31);

        // Drop balances that can no longer be closed in time.
        if (word === lastWordIndex) {
          shifted &= topWordMask;
        }

        balanceSets[base + word] = shifted;
        aliveBits |= shifted;
      }
    }

    // Every path crosses every row, so an empty row kills all candidates.
    if (aliveBits === 0) {
      return false;
    }
  }

  // The path is valid only if the last cell can be reached with balance 0.
  return (balanceSets[columnCount * wordCount] & 1) === 1;
}
