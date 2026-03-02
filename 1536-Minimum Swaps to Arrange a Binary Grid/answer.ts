function minSwaps(grid: number[][]): number {
  const gridSize = grid.length;

  // Precompute each row's trailing-zero count (from the right) into a compact typed array.
  const trailingZeroCountPerRow = new Int16Array(gridSize);

  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    const row = grid[rowIndex];

    // Find the last '1' position by scanning from the end; this minimizes work in sparse rows.
    let lastOneColumnIndex = -1;
    for (let columnIndex = gridSize - 1; columnIndex >= 0; columnIndex--) {
      if (row[columnIndex] === 1) {
        lastOneColumnIndex = columnIndex;
        break;
      }
    }

    if (lastOneColumnIndex === -1) {
      trailingZeroCountPerRow[rowIndex] = gridSize;
    } else {
      trailingZeroCountPerRow[rowIndex] = (gridSize - 1 - lastOneColumnIndex) as number;
    }
  }

  let swapCount = 0;

  for (let targetRowIndex = 0; targetRowIndex < gridSize; targetRowIndex++) {
    const requiredTrailingZeros = gridSize - 1 - targetRowIndex;

    // Greedily pick the first row at/under targetRowIndex that satisfies the requirement.
    let candidateRowIndex = targetRowIndex;
    while (candidateRowIndex < gridSize && trailingZeroCountPerRow[candidateRowIndex] < requiredTrailingZeros) {
      candidateRowIndex++;
    }

    if (candidateRowIndex === gridSize) {
      return -1;
    }

    // Bring the candidate row up by adjacent swaps; count swaps without touching the original grid.
    swapCount += candidateRowIndex - targetRowIndex;

    // Shift the trailing-zero counts down to simulate adjacent row swaps in O(distance).
    const pickedTrailingZeros = trailingZeroCountPerRow[candidateRowIndex];
    while (candidateRowIndex > targetRowIndex) {
      trailingZeroCountPerRow[candidateRowIndex] = trailingZeroCountPerRow[candidateRowIndex - 1];
      candidateRowIndex--;
    }
    trailingZeroCountPerRow[targetRowIndex] = pickedTrailingZeros;
  }

  return swapCount;
}
