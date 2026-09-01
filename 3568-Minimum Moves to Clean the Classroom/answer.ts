/** Bit flag stored in a cell descriptor marking a reset area 'R'. */
const RESET_AREA_FLAG = 1 << 10;

/** Mask isolating the litter bit stored in a cell descriptor. */
const LITTER_BIT_MASK = (1 << 10) - 1;

/** Number of low bits used to pack the remaining energy inside a queue entry. */
const ENERGY_BIT_WIDTH = 6;

/** Mask isolating the remaining energy inside a queue entry. */
const ENERGY_VALUE_MASK = (1 << ENERGY_BIT_WIDTH) - 1;

/** Number of bits used to pack energy plus cell index inside a queue entry. */
const MASK_SHIFT = 15;

/** Mask isolating the cell index inside a queue entry. */
const CELL_VALUE_MASK = (1 << (MASK_SHIFT - ENERGY_BIT_WIDTH)) - 1;

/**
 * Computes the minimum number of moves needed to collect every litter cell.
 *
 * The search is a plain breadth-first search over the state
 * (cell, collected litter mask, remaining energy), but instead of a full
 * three dimensional visited table it keeps, for every (cell, mask) pair, only
 * the best remaining energy ever seen there. Because BFS expands states in
 * non decreasing move order, a state reached later with less or equal energy
 * is strictly dominated and can be discarded, which collapses the search space
 * from cells * masks * energy down to cells * masks.
 *
 * @param classroom Rows of the grid, each character being 'S', 'L', 'R', 'X' or '.'.
 * @param energy Maximum energy capacity of the student.
 * @returns Minimum number of moves to collect all litter, or -1 when impossible.
 */
function minMoves(classroom: string[], energy: number): number {
  const rowCount = classroom.length;
  const columnCount = classroom[0].length;
  const cellCount = rowCount * columnCount;

  const cellInfo = new Int32Array(cellCount);
  const isBlocked = new Uint8Array(cellCount);
  let startCell = 0;
  let litterCount = 0;

  // Flatten the grid once into typed arrays: litter bit, reset flag, obstacle.
  for (let row = 0; row < rowCount; row++) {
    const rowText = classroom[row];
    const rowBase = row * columnCount;
    for (let column = 0; column < columnCount; column++) {
      const characterCode = rowText.charCodeAt(column);
      const cell = rowBase + column;
      if (characterCode === 76) {
        // 'L': assign this litter its own bit in the collection mask.
        cellInfo[cell] = 1 << litterCount;
        litterCount++;
      } else if (characterCode === 82) {
        // 'R': arriving here refills the energy to its maximum.
        cellInfo[cell] = RESET_AREA_FLAG;
      } else if (characterCode === 88) {
        // 'X': impassable obstacle.
        isBlocked[cell] = 1;
      } else if (characterCode === 83) {
        startCell = cell;
      }
    }
  }

  if (litterCount === 0) {
    return 0;
  }

  // Adjacency is precomputed with a fixed stride of four so the inner search
  // loop never repeats a bounds check or an obstacle test.
  const neighborList = new Int16Array(cellCount << 2);
  const neighborCount = new Uint8Array(cellCount);
  for (let row = 0; row < rowCount; row++) {
    const rowBase = row * columnCount;
    for (let column = 0; column < columnCount; column++) {
      const cell = rowBase + column;
      if (isBlocked[cell] === 1) {
        continue;
      }
      const writeBase = cell << 2;
      let count = 0;
      if (row > 0 && isBlocked[cell - columnCount] === 0) {
        neighborList[writeBase + count] = cell - columnCount;
        count++;
      }
      if (row + 1 < rowCount && isBlocked[cell + columnCount] === 0) {
        neighborList[writeBase + count] = cell + columnCount;
        count++;
      }
      if (column > 0 && isBlocked[cell - 1] === 0) {
        neighborList[writeBase + count] = cell - 1;
        count++;
      }
      if (column + 1 < columnCount && isBlocked[cell + 1] === 0) {
        neighborList[writeBase + count] = cell + 1;
        count++;
      }
      neighborCount[cell] = count;
    }
  }

  const maskCount = 1 << litterCount;
  const fullMask = maskCount - 1;
  const maximumEnergy = energy;

  // bestEnergy[mask * cellCount + cell] is the highest energy seen in that
  // state so far; zero doubles as "never visited" because states with no
  // energy left are never enqueued.
  const bestEnergy = new Uint8Array(cellCount * maskCount);

  // The queue starts small and doubles on demand, so easy inputs never pay
  // for a buffer sized after the whole state space.
  let queue = new Int32Array(1 << 13);
  let head = 0;
  let tail = 0;
  bestEnergy[startCell] = maximumEnergy;
  queue[tail] = (startCell << ENERGY_BIT_WIDTH) | maximumEnergy;
  tail++;

  let moves = 0;
  while (head < tail) {
    const levelEnd = tail;
    moves++;
    while (head < levelEnd) {
      const entry = queue[head];
      head++;
      const remainingEnergy = entry & ENERGY_VALUE_MASK;
      const cell = (entry >> ENERGY_BIT_WIDTH) & CELL_VALUE_MASK;
      const mask = entry >> MASK_SHIFT;
      const maskBase = mask * cellCount;

      // Drop entries already superseded by a richer visit of the same state.
      if (bestEnergy[maskBase + cell] > remainingEnergy) {
        continue;
      }

      const energyAfterMove = remainingEnergy - 1;
      const readBase = cell << 2;
      const degree = neighborCount[cell];
      for (let index = 0; index < degree; index++) {
        const nextCell = neighborList[readBase + index];
        const info = cellInfo[nextCell];
        const litterBit = info & LITTER_BIT_MASK;
        let nextMask = mask;
        let nextBase = maskBase;
        if (litterBit !== 0 && (mask & litterBit) === 0) {
          nextMask = mask | litterBit;
          if (nextMask === fullMask) {
            return moves;
          }
          nextBase = nextMask * cellCount;
        }

        const nextEnergy = (info & RESET_AREA_FLAG) !== 0 ? maximumEnergy : energyAfterMove;
        // A state without energy on a non reset cell can never move again.
        if (nextEnergy === 0) {
          continue;
        }
        const stateKey = nextBase + nextCell;
        if (bestEnergy[stateKey] >= nextEnergy) {
          continue;
        }
        bestEnergy[stateKey] = nextEnergy;

        if (tail === queue.length) {
          const expandedQueue = new Int32Array(queue.length << 1);
          expandedQueue.set(queue);
          queue = expandedQueue;
        }
        queue[tail] = (nextMask << MASK_SHIFT) | (nextCell << ENERGY_BIT_WIDTH) | nextEnergy;
        tail++;
      }
    }
  }

  return -1;
}
