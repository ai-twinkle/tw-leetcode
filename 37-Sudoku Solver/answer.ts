/**
 * Solve Sudoku puzzle by filling the empty cells.
 * Modifies the board in place.
 *
 * @param board - A 9x9 string array with digits '1'-'9' or '.' for empty cells
 */
function solveSudoku(board: string[][]): void {
  const flatBoard = new Uint8Array(81);
  let flatIndex = 0;

  // Convert input board to flat Uint8Array with 0 for '.'
  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const row = board[rowIndex];
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      const cell = row[colIndex];
      if (cell === ".") {
        flatBoard[flatIndex++] = 0;
      } else {
        flatBoard[flatIndex++] = cell.charCodeAt(0) - 48; // '1'..'9' → 1..9
      }
    }
  }

  const solver = new Solver(flatBoard);
  solver.solve();

  // Write solution back to original board
  flatIndex = 0;
  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const row = board[rowIndex];
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      row[colIndex] = solver.board[flatIndex++].toString();
    }
  }
}

/* ---------------------- Precomputed caches ---------------------- */

const GRID_SIZE = 9;
const TOTAL_CELLS = 81;
const FULL_MASK = 0x1FF; // 9 bits set

const ROW_INDEX_CACHE = new Uint8Array(TOTAL_CELLS);
const COLUMN_INDEX_CACHE = new Uint8Array(TOTAL_CELLS);
const BLOCK_INDEX_CACHE = new Uint8Array(TOTAL_CELLS);

const PEER_COUNT = 20;
const PEERS = new Uint8Array(TOTAL_CELLS * PEER_COUNT);

const POPCOUNT_CACHE = new Uint8Array(512);
const SINGLE_DIGIT_CACHE = new Uint8Array(512);
const BIT_TO_DIGIT_CACHE = new Uint8Array(1 << GRID_SIZE);

/**
 * Precompute indexes, peers, and helper lookup tables.
 */
(function precomputeCaches(): void {
  // Precompute row, column, block index for each cell
  for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
    const rowIndex = Math.floor(cellIndex / GRID_SIZE);
    const colIndex = cellIndex % GRID_SIZE;
    ROW_INDEX_CACHE[cellIndex] = rowIndex;
    COLUMN_INDEX_CACHE[cellIndex] = colIndex;
    BLOCK_INDEX_CACHE[cellIndex] =
      Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3);
  }

  // Precompute peers for each position
  for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
    const rowIndex = ROW_INDEX_CACHE[cellIndex];
    const colIndex = COLUMN_INDEX_CACHE[cellIndex];
    let writePointer = cellIndex * PEER_COUNT;

    // Row peers (8 others)
    for (let j = 0; j < GRID_SIZE; j++) {
      if (j !== colIndex) {
        PEERS[writePointer++] = rowIndex * GRID_SIZE + j;
      }
    }

    // Column peers (8 others)
    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== rowIndex) {
        PEERS[writePointer++] = i * GRID_SIZE + colIndex;
      }
    }

    // Block peers (4 unique remaining)
    const blockRow = Math.floor(rowIndex / 3);
    const blockCol = Math.floor(colIndex / 3);
    for (let i = blockRow * 3; i < blockRow * 3 + 3; i++) {
      for (let j = blockCol * 3; j < blockCol * 3 + 3; j++) {
        if (i === rowIndex && j === colIndex) {
          continue;
        }
        const peerCandidate = i * GRID_SIZE + j;
        let isDuplicate = false;
        for (
          let k = cellIndex * PEER_COUNT;
          k < cellIndex * PEER_COUNT + 16;
          k++
        ) {
          if (PEERS[k] === peerCandidate) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          PEERS[writePointer++] = peerCandidate;
        }
      }
    }
  }

  // Precompute popcount and single-digit lookup
  for (let mask = 0; mask < 512; mask++) {
    let value = mask;
    let bitCount = 0;
    while (value !== 0) {
      value &= value - 1;
      bitCount++;
    }
    POPCOUNT_CACHE[mask] = bitCount;
    SINGLE_DIGIT_CACHE[mask] = bitCount === 1 ? Math.log2(mask) + 1 : 0;
  }

  // Precompute mapping from bit to digit
  for (let k = 0; k < GRID_SIZE; k++) {
    BIT_TO_DIGIT_CACHE[1 << k] = k + 1;
  }
})();

/* --------------------------- Optimized Solver --------------------------- */

/**
 * Optimized Sudoku solver using bitmasks, typed arrays, and precomputation.
 */
class Solver {
  board: Uint8Array;

  private readonly rowMask: Int32Array;
  private readonly columnMask: Int32Array;
  private readonly blockMask: Int32Array;

  private readonly candidates: Uint16Array;
  private readonly emptyCellList: Uint8Array;
  private emptyCellCount: number;

  private readonly queue: Uint8Array;
  private queueHead: number = 0;
  private queueTail: number = 0;

  private hasContradiction: boolean = false;

  /**
   * Initialize solver with Sudoku board.
   *
   * @param board - Flat Uint8Array[81] with 0 for empty cells
   */
  constructor(board: Uint8Array) {
    this.board = board;
    this.rowMask = new Int32Array(GRID_SIZE);
    this.columnMask = new Int32Array(GRID_SIZE);
    this.blockMask = new Int32Array(GRID_SIZE);
    this.candidates = new Uint16Array(TOTAL_CELLS);
    this.emptyCellList = new Uint8Array(TOTAL_CELLS);
    this.queue = new Uint8Array(TOTAL_CELLS);

    // Fill masks from fixed digits
    for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
      const digit = board[cellIndex];
      if (digit !== 0) {
        const bitMask = 1 << (digit - 1);
        this.rowMask[ROW_INDEX_CACHE[cellIndex]] |= bitMask;
        this.columnMask[COLUMN_INDEX_CACHE[cellIndex]] |= bitMask;
        this.blockMask[BLOCK_INDEX_CACHE[cellIndex]] |= bitMask;
      }
    }

    // Compute initial candidates
    let emptyCounter = 0;
    for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
      if (board[cellIndex] === 0) {
        const usedDigits =
          this.rowMask[ROW_INDEX_CACHE[cellIndex]] |
          this.columnMask[COLUMN_INDEX_CACHE[cellIndex]] |
          this.blockMask[BLOCK_INDEX_CACHE[cellIndex]];
        const candidateMask = (FULL_MASK ^ usedDigits) & FULL_MASK;
        this.candidates[cellIndex] = candidateMask;
        this.emptyCellList[emptyCounter++] = cellIndex;
        if (SINGLE_DIGIT_CACHE[candidateMask] !== 0) {
          this.enqueue(cellIndex);
        }
      } else {
        this.candidates[cellIndex] = 0;
      }
    }
    this.emptyCellCount = emptyCounter;
  }

  /**
   * Solve the puzzle using propagation + DFS.
   *
   * @returns true if solved successfully, false otherwise
   */
  solve(): boolean {
    if (!this.propagate()) {
      return false;
    }
    if (this.emptyCellCount === 0) {
      return true;
    }
    return this.depthFirstSearch();
  }

  /**
   * Add a cell index into the propagation queue.
   *
   * @param cellIndex - The index of the cell (0..80)
   */
  private enqueue(cellIndex: number): void {
    this.queue[this.queueTail++] = cellIndex;
  }

  /**
   * Assign a digit to a cell and update masks and candidates.
   *
   * @param cellIndex - The index of the cell (0..80)
   * @param digit - Digit to assign (1..9)
   */
  private setDigit(cellIndex: number, digit: number): void {
    const bitMask = 1 << (digit - 1);
    this.board[cellIndex] = digit;
    this.candidates[cellIndex] = 0;

    const rowIndex = ROW_INDEX_CACHE[cellIndex];
    const colIndex = COLUMN_INDEX_CACHE[cellIndex];
    const blockIndex = BLOCK_INDEX_CACHE[cellIndex];

    this.rowMask[rowIndex] |= bitMask;
    this.columnMask[colIndex] |= bitMask;
    this.blockMask[blockIndex] |= bitMask;

    // Remove from emptyCellList
    for (let i = 0; i < this.emptyCellCount; i++) {
      if (this.emptyCellList[i] === cellIndex) {
        this.emptyCellList[i] = this.emptyCellList[--this.emptyCellCount];
        break;
      }
    }

    // Eliminate digit from all peers
    const base = cellIndex * PEER_COUNT;
    for (let k = 0; k < PEER_COUNT; k++) {
      const peerIndex = PEERS[base + k];
      const peerCandidates = this.candidates[peerIndex];
      if ((peerCandidates & bitMask) !== 0) {
        const newMask = peerCandidates & ~bitMask;
        if (newMask === 0) {
          this.hasContradiction = true;
          return;
        }
        this.candidates[peerIndex] = newMask;
        if (SINGLE_DIGIT_CACHE[newMask] !== 0) {
          this.enqueue(peerIndex);
        }
      }
    }
  }

  /**
   * Constraint propagation: fill naked singles.
   *
   * @returns true if no contradiction found, false otherwise
   */
  private propagate(): boolean {
    while (this.queueHead < this.queueTail) {
      const cellIndex = this.queue[this.queueHead++];
      if (this.board[cellIndex] !== 0) {
        continue;
      }
      const candidateMask = this.candidates[cellIndex];
      const digit = SINGLE_DIGIT_CACHE[candidateMask];
      if (digit === 0) {
        continue;
      }
      this.setDigit(cellIndex, digit);
      if (this.hasContradiction) {
        this.hasContradiction = false;
        return false;
      }
    }
    return true;
  }

  /**
   * Depth-first search with Minimum Remaining Value heuristic.
   *
   * @returns true if solved successfully, false otherwise
   */
  private depthFirstSearch(): boolean {
    let bestCellIndex = -1;
    let bestCandidateCount = 10;
    let bestCandidateMask = 0;

    // Select cell with fewest candidates
    for (let i = 0; i < this.emptyCellCount; i++) {
      const cellIndex = this.emptyCellList[i];
      const candidateMask = this.candidates[cellIndex];
      if (candidateMask === 0) {
        return false;
      }
      const candidateCount = POPCOUNT_CACHE[candidateMask];
      if (candidateCount < bestCandidateCount) {
        bestCandidateCount = candidateCount;
        bestCellIndex = cellIndex;
        bestCandidateMask = candidateMask;
        if (candidateCount === 2) {
          break;
        }
      }
    }

    // Try each candidate digit
    let mask = bestCandidateMask;
    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      const digit = BIT_TO_DIGIT_CACHE[bit];

      // Save current state
      const snapshot = {
        rowMask: new Int32Array(this.rowMask),
        columnMask: new Int32Array(this.columnMask),
        blockMask: new Int32Array(this.blockMask),
        candidates: new Uint16Array(this.candidates),
        board: new Uint8Array(this.board),
        emptyCellList: new Uint8Array(this.emptyCellList),
        emptyCellCount: this.emptyCellCount,
      };

      this.setDigit(bestCellIndex, digit);
      if (this.hasContradiction) {
        this.hasContradiction = false;
        this.restoreState(snapshot);
        continue;
      }
      if (this.propagate()) {
        if (this.emptyCellCount === 0) {
          return true;
        }
        if (this.depthFirstSearch()) {
          return true;
        }
      }
      this.restoreState(snapshot);
    }
    return false;
  }

  /**
   * Restore saved state for backtracking.
   *
   * @param state - Object containing all solver state snapshots
   */
  private restoreState(state: {
    rowMask: Int32Array;
    columnMask: Int32Array;
    blockMask: Int32Array;
    candidates: Uint16Array;
    board: Uint8Array;
    emptyCellList: Uint8Array;
    emptyCellCount: number;
  }): void {
    this.rowMask.set(state.rowMask);
    this.columnMask.set(state.columnMask);
    this.blockMask.set(state.blockMask);
    this.candidates.set(state.candidates);
    this.board.set(state.board);
    this.emptyCellList.set(state.emptyCellList);
    this.emptyCellCount = state.emptyCellCount;
    this.queueHead = 0;
    this.queueTail = 0;
    this.hasContradiction = false;
  }
}
