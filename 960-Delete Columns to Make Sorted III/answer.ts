function minDeletionSize(strs: string[]): number {
  const rowCount = strs.length;
  const columnCount = strs[0].length;

  // If there is only one column, it is always non-decreasing
  if (columnCount <= 1) {
    return 0;
  }

  // Flatten all characters into a typed array to reduce string indexing overhead
  const characterCodeMatrix = new Uint16Array(rowCount * columnCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = strs[rowIndex];
    const rowOffset = rowIndex * columnCount;

    // Convert characters to char codes for fast numeric comparison
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      characterCodeMatrix[rowOffset + columnIndex] = currentRow.charCodeAt(columnIndex);
    }
  }

  // The canPrecedeMatrix[a * columnCount + b] === 1
  // means keeping column a before column b does not break row ordering in any string
  const canPrecedeMatrix = new Uint8Array(columnCount * columnCount);
  for (let leftColumnIndex = 0; leftColumnIndex < columnCount - 1; leftColumnIndex++) {
    for (let rightColumnIndex = leftColumnIndex + 1; rightColumnIndex < columnCount; rightColumnIndex++) {
      let isValid = 1;

      // Validate ordering for every row
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const rowOffset = rowIndex * columnCount;

        // Early exit once any row violates a non-decreasing order
        if (characterCodeMatrix[rowOffset + leftColumnIndex] > characterCodeMatrix[rowOffset + rightColumnIndex]) {
          isValid = 0;
          break;
        }
      }

      // Store feasibility result for later O(1) DP lookup
      canPrecedeMatrix[leftColumnIndex * columnCount + rightColumnIndex] = isValid;
    }
  }

  // The longestChainEndingAt[i] stores the longest valid column sequence ending at column i
  const longestChainEndingAt = new Int16Array(columnCount);
  longestChainEndingAt[0] = 1;

  // Track the maximum number of columns we can keep
  let longestKeptColumnCount = 1;

  for (let rightColumnIndex = 1; rightColumnIndex < columnCount; rightColumnIndex++) {
    // At minimum, the column itself can form a valid chain
    let bestChainLength = 1;

    // Try extending all valid previous column chains
    for (let leftColumnIndex = 0; leftColumnIndex < rightColumnIndex; leftColumnIndex++) {
      if (canPrecedeMatrix[leftColumnIndex * columnCount + rightColumnIndex] !== 0) {
        const candidateChainLength = longestChainEndingAt[leftColumnIndex] + 1;

        // Update the best chain ending at this column
        if (candidateChainLength > bestChainLength) {
          bestChainLength = candidateChainLength;
        }
      }
    }

    // Finalize DP state for this column
    longestChainEndingAt[rightColumnIndex] = bestChainLength;

    // Maintain global maximum chain length
    if (bestChainLength > longestKeptColumnCount) {
      longestKeptColumnCount = bestChainLength;
    }
  }

  // Minimum deletions equals total columns minus maximum kept columns
  return columnCount - longestKeptColumnCount;
}
