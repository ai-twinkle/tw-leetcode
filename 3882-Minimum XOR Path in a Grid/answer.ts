function minCost(grid: number[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;

  // A single cell leaves no choice at all.
  if (rowCount === 1 && columnCount === 1) {
    return grid[0][0];
  }

  // Any XOR of a subset is bounded by the OR of every value, which sizes the bitset.
  let valueOr = 0;
  for (let row = 0; row < rowCount; row++) {
    const currentRow = grid[row];

    for (let column = 0; column < columnCount; column++) {
      valueOr |= currentRow[column];
    }
  }

  // Words needed to cover all 2^bitLength candidate XOR values, 32 values per word.
  const bitLength = 32 - Math.clz32(valueOr);
  const wordCount = bitLength > 5 ? 1 << (bitLength - 5) : 1;

  // Rolling row of bitsets: before a cell is written it still holds the row above it.
  const reachable = new Uint32Array(columnCount * wordCount);
  const merged = new Uint32Array(wordCount);

  for (let row = 0; row < rowCount; row++) {
    const currentRow = grid[row];

    for (let column = 0; column < columnCount; column++) {
      const value = currentRow[column];
      const base = column * wordCount;

      // The start cell only ever reaches its own value.
      if (row === 0 && column === 0) {
        reachable[value >>> 5] = 1 << (value & 31);
        continue;
      }

      // Union the incoming sets: the stale entry is from above, the previous column from the left.
      if (row === 0) {
        for (let word = 0; word < wordCount; word++) {
          merged[word] = reachable[base - wordCount + word];
        }
      } else if (column === 0) {
        for (let word = 0; word < wordCount; word++) {
          merged[word] = reachable[base + word];
        }
      } else {
        for (let word = 0; word < wordCount; word++) {
          merged[word] = reachable[base + word] | reachable[base - wordCount + word];
        }
      }

      // High bits of the value permute whole words; low bits permute inside each word.
      const wordSwap = value >>> 5;
      const lowBits = value & 31;
      const swapBy1 = (lowBits & 1) !== 0;
      const swapBy2 = (lowBits & 2) !== 0;
      const swapBy4 = (lowBits & 4) !== 0;
      const swapBy8 = (lowBits & 8) !== 0;
      const swapBy16 = (lowBits & 16) !== 0;

      for (let word = 0; word < wordCount; word++) {
        let bits = merged[word ^ wordSwap];

        // Butterfly (delta) swaps apply "XOR every index by lowBits" to all 32 slots at once.
        if (swapBy1) {
          bits = ((bits & 0x55555555) << 1) | ((bits >>> 1) & 0x55555555);
        }

        if (swapBy2) {
          bits = ((bits & 0x33333333) << 2) | ((bits >>> 2) & 0x33333333);
        }

        if (swapBy4) {
          bits = ((bits & 0x0f0f0f0f) << 4) | ((bits >>> 4) & 0x0f0f0f0f);
        }

        if (swapBy8) {
          bits = ((bits & 0x00ff00ff) << 8) | ((bits >>> 8) & 0x00ff00ff);
        }

        if (swapBy16) {
          bits = (bits << 16) | (bits >>> 16);
        }

        reachable[base + word] = bits;
      }
    }
  }

  // The answer is the lowest value still present in the destination bitset.
  const lastBase = (columnCount - 1) * wordCount;
  for (let word = 0; word < wordCount; word++) {
    const bits = reachable[lastBase + word];

    if (bits !== 0) {
      return (word << 5) + 31 - Math.clz32(bits & -bits);
    }
  }

  return 0;
}
