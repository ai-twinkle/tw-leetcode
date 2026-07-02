function findSafeWalk(grid: number[][], health: number): boolean {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const cellCount = rowCount * columnCount;

  // Flatten the grid into a typed array for fast, cache-friendly access.
  const flatGrid = new Uint8Array(cellCount);
  for (let row = 0; row < rowCount; row++) {
    const currentRow = grid[row];
    const base = row * columnCount;
    for (let column = 0; column < columnCount; column++) {
      flatGrid[base + column] = currentRow[column];
    }
  }

  // minCost[cell] holds the minimum health spent to arrive at that cell.
  const minCost = new Int32Array(cellCount).fill(0x7fffffff);

  // Deque implemented on a fixed ring buffer sized to hold repeated pushes.
  const capacity = cellCount * 2 + 2;
  const dequeCells = new Int32Array(capacity);
  let head = capacity >> 1;
  let tail = head;

  minCost[0] = flatGrid[0];
  dequeCells[tail++] = 0;

  const lastCell = cellCount - 1;

  while (head < tail) {
    const cell = dequeCells[head++];
    const row = (cell / columnCount) | 0;
    const column = cell - row * columnCount;
    const cost = minCost[cell];

    // Reached the destination with acceptable remaining health.
    if (cell === lastCell) {
      return cost < health;
    }

    // Explore the four orthogonal neighbors.
    for (let direction = 0; direction < 4; direction++) {
      let neighborRow = row;
      let neighborColumn = column;

      if (direction === 0) {
        neighborRow = row - 1;
      } else if (direction === 1) {
        neighborRow = row + 1;
      } else if (direction === 2) {
        neighborColumn = column - 1;
      } else {
        neighborColumn = column + 1;
      }

      // Skip out-of-bounds neighbors.
      if (neighborRow < 0 || neighborRow >= rowCount) {
        continue;
      }
      if (neighborColumn < 0 || neighborColumn >= columnCount) {
        continue;
      }

      const neighborCell = neighborRow * columnCount + neighborColumn;
      const neighborCost = cost + flatGrid[neighborCell];

      // Prune paths that would exhaust health before reaching the neighbor.
      if (neighborCost >= health) {
        continue;
      }

      // Relax the neighbor only when a cheaper cost is found.
      if (neighborCost < minCost[neighborCell]) {
        minCost[neighborCell] = neighborCost;

        // Zero-weight edge goes to the front, weighted edge to the back.
        if (flatGrid[neighborCell] === 0) {
          dequeCells[--head] = neighborCell;
        } else {
          dequeCells[tail++] = neighborCell;
        }
      }
    }
  }

  return false;
}
