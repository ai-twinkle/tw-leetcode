const STATE_EMPTY = 0;
const STATE_WALL = 1;
const STATE_GUARD = 2;
const STATE_GUARDED = 3;

function countUnguarded(m: number, n: number, guards: number[][], walls: number[][]): number {
  // Allocate a compact typed array for all cell states to reduce memory overhead
  const totalCells = m * n;
  const state = new Uint8Array(totalCells);

  // Compute how many cells are initially unoccupied (not wall or guard)
  const wallsLength = walls.length;
  const guardsLength = guards.length;
  let unoccupiedCells = totalCells - wallsLength - guardsLength;

  // Mark all wall positions — these block line of sight
  for (let i = 0; i < wallsLength; i += 1) {
    const rowIndex = walls[i][0];
    const columnIndex = walls[i][1];
    const index = rowIndex * n + columnIndex;
    state[index] = STATE_WALL;
  }

  // Mark all guard positions — these emit line of sight
  for (let i = 0; i < guardsLength; i += 1) {
    const rowIndex = guards[i][0];
    const columnIndex = guards[i][1];
    const index = rowIndex * n + columnIndex;
    state[index] = STATE_GUARD;
  }

  // Track how many empty cells become guarded during sweeps
  let guardedEmptyCount = 0;

  // Row Sweeps — Each row is processed twice to handle both left→right and right→left vision
  for (let rowIndex = 0; rowIndex < m; rowIndex += 1) {
    // Sweep left → right: simulate vision extending rightward
    let hasActiveGuard = false; // Whether a guard is currently "seeing" along this direction
    let index = rowIndex * n;

    for (let columnIndex = 0; columnIndex < n; columnIndex += 1) {
      const cell = state[index];

      if (cell === STATE_WALL) {
        hasActiveGuard = false; // Wall blocks the view — reset vision
      } else if (cell === STATE_GUARD) {
        hasActiveGuard = true; // New guard starts emitting vision
      } else if (hasActiveGuard && cell === STATE_EMPTY) {
        // Mark visible empty cell only once
        state[index] = STATE_GUARDED;
        guardedEmptyCount += 1;
      }

      index += 1;
    }

    // Sweep right → left: simulate vision extending leftward
    hasActiveGuard = false;
    index = rowIndex * n + (n - 1);

    for (let columnIndex = n - 1; columnIndex >= 0; columnIndex -= 1) {
      const cell = state[index];

      if (cell === STATE_WALL) {
        hasActiveGuard = false; // Wall stops the backward vision
      } else if (cell === STATE_GUARD) {
        hasActiveGuard = true; // Guard now projects vision to the left
      } else if (hasActiveGuard && cell === STATE_EMPTY) {
        state[index] = STATE_GUARDED;
        guardedEmptyCount += 1;
      }

      index -= 1;
    }
  }

  // Column Sweeps — Each column is processed twice for top→bottom and bottom→top vision
  for (let columnIndex = 0; columnIndex < n; columnIndex += 1) {
    // Sweep top → bottom: simulate downward vision
    let hasActiveGuard = false;
    let index = columnIndex;

    for (let rowIndex = 0; rowIndex < m; rowIndex += 1) {
      const cell = state[index];

      if (cell === STATE_WALL) {
        hasActiveGuard = false; // Wall interrupts downward vision
      } else if (cell === STATE_GUARD) {
        hasActiveGuard = true; // Guard starts projecting vision downward
      } else if (hasActiveGuard && cell === STATE_EMPTY) {
        state[index] = STATE_GUARDED;
        guardedEmptyCount += 1;
      }

      index += n;
    }

    // Sweep bottom → top: simulate upward vision
    hasActiveGuard = false;
    index = (m - 1) * n + columnIndex;

    for (let rowIndex = m - 1; rowIndex >= 0; rowIndex -= 1) {
      const cell = state[index];

      if (cell === STATE_WALL) {
        hasActiveGuard = false; // Wall stops upward vision
      } else if (cell === STATE_GUARD) {
        hasActiveGuard = true; // Guard emits upward vision
      } else if (hasActiveGuard && cell === STATE_EMPTY) {
        state[index] = STATE_GUARDED;
        guardedEmptyCount += 1;
      }

      index -= n;
    }
  }

  // Compute unguarded result — subtract all guarded empties from total unoccupied
  return unoccupiedCells - guardedEmptyCount;
}
