function minCost(grid: number[][]): number {
  // 1. Initialization and Constant Definitions
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const totalCells = rowCount * columnCount;

  // Directions: right, left, down, up
  const rowOffsets = new Int8Array([0, 0, 1, -1]);
  const colOffsets = new Int8Array([1, -1, 0, 0]);

  // 2. Preprocessing the grid for fast access (flatten into 1D array)
  const flattenedGrid = new Uint8Array(totalCells);
  for (let row = 0; row < rowCount; row++) {
    const baseIndex = row * columnCount;
    for (let col = 0; col < columnCount; col++) {
      flattenedGrid[baseIndex + col] = grid[row][col];
    }
  }

  // 3. Cost tracking setup using typed array for fast access
  const sentinelCost = totalCells + 1;
  const costGrid = new Uint16Array(totalCells);
  for (let i = 0; i < totalCells; i++) {
    costGrid[i] = sentinelCost;
  }
  costGrid[0] = 0; // Start cell has zero cost

  // 4. Circular-buffer deque for 0–1 BFS (store flattened indices)
  const capacity = totalCells + 1;
  const dequeBuffer = new Uint32Array(capacity);
  let head = 0;
  let tail = 1;
  dequeBuffer[0] = 0; // Start with the top-left cell

  // 5. 0–1 BFS main loop
  while (head !== tail) {
    // Pop front of deque
    const currentIndex = dequeBuffer[head];
    head = head + 1 < capacity ? head + 1 : 0;

    // Compute current position and state
    const currentCost = costGrid[currentIndex];
    const currentRow = (currentIndex / columnCount) | 0;
    const currentCol = currentIndex - currentRow * columnCount;
    const currentSign = flattenedGrid[currentIndex];

    // Try all four directions
    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
      const newRow = currentRow + rowOffsets[directionIndex];
      const newCol = currentCol + colOffsets[directionIndex];

      // Skip if out of grid bounds
      if (newRow < 0 || newRow >= rowCount || newCol < 0 || newCol >= columnCount) {
        continue;
      }
      const neighborIndex = newRow * columnCount + newCol;

      // Cost to move: 0 if sign matches, 1 otherwise (need to modify)
      const additionalCost = (currentSign === directionIndex + 1 ? 0 : 1);
      const newCost = currentCost + additionalCost;

      // Only update if found a cheaper path
      if (newCost < costGrid[neighborIndex]) {
        costGrid[neighborIndex] = newCost;

        // If no modification needed, push to front; else, push to back
        if (additionalCost === 0) {
          head = head - 1 >= 0 ? head - 1 : capacity - 1;
          dequeBuffer[head] = neighborIndex;
        } else {
          dequeBuffer[tail] = neighborIndex;
          tail = tail + 1 < capacity ? tail + 1 : 0;
        }
      }
    }
  }

  // 6. Return the minimal cost to reach the bottom-right cell
  return costGrid[totalCells - 1];
}
