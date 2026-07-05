function pathsWithMaxScore(board: string[]): number[] {
  const MOD = 1000000007;
  const size = board.length;

  // Flatten the board into a single Uint8Array of numeric values.
  // Encoding: -1 for obstacle 'X', 0 for 'S'/'E', otherwise digit value.
  const cellValue = new Int8Array(size * size);
  for (let row = 0; row < size; row++) {
    const rowString = board[row];
    const base = row * size;
    for (let col = 0; col < size; col++) {
      const character = rowString.charCodeAt(col);
      if (character === 88) {
        // 'X' obstacle
        cellValue[base + col] = -1;
      } else if (character === 83 || character === 69) {
        // 'S' or 'E' contribute zero
        cellValue[base + col] = 0;
      } else {
        // Numeric character '1'-'9'
        cellValue[base + col] = character - 48;
      }
    }
  }

  // Flat typed arrays for score and count using row-major indexing.
  const score = new Int32Array(size * size).fill(-1);
  const count = new Float64Array(size * size);

  const lastIndex = size * size - 1;
  score[lastIndex] = 0;
  count[lastIndex] = 1;

  // Process cells from bottom-right toward top-left.
  for (let row = size - 1; row >= 0; row--) {
    const base = row * size;
    for (let col = size - 1; col >= 0; col--) {
      const index = base + col;

      // Skip obstacles and unreachable cells.
      if (cellValue[index] === -1) {
        continue;
      }
      const currentCount = count[index];
      if (currentCount === 0) {
        continue;
      }

      const currentScore = score[index];
      const value = cellValue[index];
      const newScore = currentScore + value;

      // Move up.
      if (row > 0) {
        const upIndex = index - size;
        if (cellValue[upIndex] !== -1) {
          const target = score[upIndex];
          if (newScore > target) {
            score[upIndex] = newScore;
            count[upIndex] = currentCount;
          } else if (newScore === target) {
            let combined = count[upIndex] + currentCount;
            if (combined >= MOD) {
              combined -= MOD;
            }
            count[upIndex] = combined;
          }
        }
      }

      // Move left.
      if (col > 0) {
        const leftIndex = index - 1;
        if (cellValue[leftIndex] !== -1) {
          const target = score[leftIndex];
          if (newScore > target) {
            score[leftIndex] = newScore;
            count[leftIndex] = currentCount;
          } else if (newScore === target) {
            let combined = count[leftIndex] + currentCount;
            if (combined >= MOD) {
              combined -= MOD;
            }
            count[leftIndex] = combined;
          }
        }
      }

      // Move up-left diagonally.
      if (row > 0 && col > 0) {
        const diagIndex = index - size - 1;
        if (cellValue[diagIndex] !== -1) {
          const target = score[diagIndex];
          if (newScore > target) {
            score[diagIndex] = newScore;
            count[diagIndex] = currentCount;
          } else if (newScore === target) {
            let combined = count[diagIndex] + currentCount;
            if (combined >= MOD) {
              combined -= MOD;
            }
            count[diagIndex] = combined;
          }
        }
      }
    }
  }

  if (count[0] === 0) {
    return [0, 0];
  }
  return [score[0], count[0]];
}
