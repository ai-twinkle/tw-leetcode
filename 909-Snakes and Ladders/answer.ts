function snakesAndLadders(board: number[][]): number {
  const boardSize = board.length;
  const totalSquares = boardSize * boardSize;

  // 1. Flatten the 2D board into a 1D Int16Array in Boustrophedon order
  const flattenedBoard = new Int16Array(totalSquares);
  let writeIndex = 0;
  let leftToRight = true;
  for (let row = boardSize - 1; row >= 0; row--, leftToRight = !leftToRight) {
    if (leftToRight) {
      for (let col = 0; col < boardSize; col++) {
        flattenedBoard[writeIndex++] = board[row][col];
      }
    } else {
      for (let col = boardSize - 1; col >= 0; col--) {
        flattenedBoard[writeIndex++] = board[row][col];
      }
    }
  }

  // 2. Precompute a one‐level jump mapping: if there's a snake/ladder at i, map to (destination−1), else map to i
  const destinationMapping = new Int16Array(totalSquares);
  for (let i = 0; i < totalSquares; i++) {
    const cellValue = flattenedBoard[i];
    destinationMapping[i] = cellValue !== -1 ? (cellValue - 1) : i;
  }

  // 3. Initialize movesToReach array with -1 (unvisited). Use Int16Array for low‐overhead numeric storage.
  const movesToReach = new Int16Array(totalSquares);
  movesToReach.fill(-1);
  movesToReach[0] = 0;

  // 4. Use a fixed‐size Int16Array as a BFS queue (head/tail pointers)
  const bfsQueue = new Int16Array(totalSquares);
  let headPointer = 0;
  let tailPointer = 0;
  bfsQueue[tailPointer++] = 0; // Enqueue start at index 0

  // 5. Standard BFS over the "flattened" board graph
  while (headPointer < tailPointer) {
    const currentIndex = bfsQueue[headPointer++];
    const currentMoves = movesToReach[currentIndex];

    // Try all die rolls from 1..6
    for (let roll = 1; roll <= 6; roll++) {
      const rawNext = currentIndex + roll;
      if (rawNext >= totalSquares) {
        break;
      }

      // Apply one‐level jump if there's a snake or ladder
      const nextIndex = destinationMapping[rawNext];

      // If we've reached the final square, return moves + 1
      if (nextIndex === totalSquares - 1) {
        return currentMoves + 1;
      }

      // Enqueue if not yet visited
      if (movesToReach[nextIndex] === -1) {
        movesToReach[nextIndex] = currentMoves + 1;
        bfsQueue[tailPointer++] = nextIndex;
      }
    }
  }

  return -1;
}
