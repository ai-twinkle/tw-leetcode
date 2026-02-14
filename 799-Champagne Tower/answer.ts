function champagneTower(poured: number, queryRow: number, queryGlass: number): number {
  // Reuse two fixed-size typed arrays to avoid per-row allocations and reduce GC overhead.
  const maxRowIndexInclusive = queryRow;
  const rowBufferSize = maxRowIndexInclusive + 2;

  let currentRow = new Float64Array(rowBufferSize);
  let nextRow = new Float64Array(rowBufferSize);

  currentRow[0] = poured;

  for (let rowIndex = 0; rowIndex < maxRowIndexInclusive; rowIndex++) {
    // Clear only the portion that will be written this iteration (indices 0...rowIndex+1).
    for (let clearIndex = 0; clearIndex <= rowIndex + 1; clearIndex++) {
      nextRow[clearIndex] = 0;
    }

    // Propagate only positive overflow; each glass holds 1 cup.
    for (let glassIndex = 0; glassIndex <= rowIndex; glassIndex++) {
      const amountInGlass = currentRow[glassIndex];
      if (amountInGlass > 1) {
        const overflowShare = (amountInGlass - 1) * 0.5;
        nextRow[glassIndex] += overflowShare;
        nextRow[glassIndex + 1] += overflowShare;
      }
    }

    // Swap buffers for the next iteration.
    const temp = currentRow;
    currentRow = nextRow;
    nextRow = temp;
  }

  const result = currentRow[queryGlass];
  if (result >= 1) {
    return 1;
  }
  if (result <= 0) {
    return 0;
  }
  return result;
}
