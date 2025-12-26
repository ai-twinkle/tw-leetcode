# 37. Sudoku Solver

Write a program to solve a Sudoku puzzle by filling the empty cells.

A sudoku solution must satisfy all of the following rules:

Each of the digits `1-9` must occur exactly once in each row.
Each of the digits `1-9` must occur exactly once in each column.
Each of the digits `1-9` must occur exactly once in each of the 9 `3x3` sub-boxes of the grid.
The `'.'` character indicates empty cells.

**Constraints:**

- `board.length == 9`
- `board[i].length == 9`
- `board[i][j]` is a digit or `'.'`.
- It is guaranteed that the input board has only one solution.

## 基礎思路

數獨的核心限制條件為：每一列、每一行、以及每個 $3 \times 3$ 九宮格中，數字 $1 \sim 9$ 必須且只出現一次。題目要求填滿所有空白格並保證唯一解。

解題策略可以分為三個層次：

1. **狀態表示**：

    - 將整個 $9 \times 9$ 棋盤展平成一維陣列，並以位元遮罩表示候選數字集合。
    - 每個格子的候選集合由該列、該行、以及該九宮格已使用的數字決定。

2. **約束傳播（Constraint Propagation）**：

    - 若某格僅剩一個候選數字，則必須立即填入。
    - 每次填入後，需即時更新所有相關同儕格的候選集合。
    - 持續執行此過程，直到無法再新增確定數字或發生矛盾。

3. **回溯搜尋（Backtracking Search）**：

    - 若仍有空格未填，選擇候選數字最少的格（MRV 策略，Minimum Remaining Value）作為分支點。
    - 逐一嘗試可能的數字，若遇到矛盾則回溯。
    - 因為題目保證唯一解，當填滿棋盤後即可結束。

此方法透過 **預先計算索引與候選快取** 降低重複運算，並結合 **約束傳播＋啟發式回溯**，能大幅縮小搜尋空間。

## 解題步驟

### Step 1：將輸入棋盤轉為扁平陣列，呼叫解算器並將解答回寫

這一步將輸入的 $9 \times 9$ 棋盤轉為一維 `Uint8Array`，方便後續高效處理。

- `'.'` 轉換為 `0`。
- `'1'..'9'` 轉換為對應數字 `1..9`。
- 建立 `Solver` 物件並呼叫 `solve()`。
- 解出後將答案回寫回原始的二維陣列。

```typescript
/**
 * 解出數獨：以填滿空白格的方式直接修改原陣列
 *
 * @param board - 9x9 的字串陣列，數字為 '1'~'9'，'.' 代表空白
 */
function solveSudoku(board: string[][]): void {
  const flatBoard = new Uint8Array(81);
  let flatIndex = 0;

  // 將輸入棋盤轉為扁平 Uint8Array；'.' 以 0 表示
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

  // 將解答回寫至原 9x9 棋盤
  flatIndex = 0;
  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const row = board[rowIndex];
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      row[colIndex] = solver.board[flatIndex++].toString();
    }
  }
}
```

### Step 2：定義常數與快取陣列

建立各種常數與快取陣列，用來加速後續的數獨計算：

- `GRID_SIZE = 9`、`TOTAL_CELLS = 81`、`FULL_MASK = 0x1FF` (9 個 bit 全為 1)。
- `ROW_INDEX_CACHE`、`COLUMN_INDEX_CACHE`、`BLOCK_INDEX_CACHE`：記錄每格的列/行/區塊索引。
- `PEERS`：每格的 20 個同儕格索引。
- `POPCOUNT_CACHE`、`SINGLE_DIGIT_CACHE`、`BIT_TO_DIGIT_CACHE`：候選數相關快取表。

```typescript
/* ---------------------- 預先快取 ---------------------- */

const GRID_SIZE = 9;
const TOTAL_CELLS = 81;
const FULL_MASK = 0x1FF; // 9 個 bit 全為 1

const ROW_INDEX_CACHE = new Uint8Array(TOTAL_CELLS);
const COLUMN_INDEX_CACHE = new Uint8Array(TOTAL_CELLS);
const BLOCK_INDEX_CACHE = new Uint8Array(TOTAL_CELLS);

const PEER_COUNT = 20;
const PEERS = new Uint8Array(TOTAL_CELLS * PEER_COUNT);

const POPCOUNT_CACHE = new Uint8Array(512);
const SINGLE_DIGIT_CACHE = new Uint8Array(512);
const BIT_TO_DIGIT_CACHE = new Uint8Array(1 << GRID_SIZE);
```

### Step 3：預先計算索引、同儕與候選快取

這裡用一個 IIFE（立即執行函式）來一次性完成所有快取：

- 計算每格的列/行/區塊索引。
- 建立每格的 20 個同儕格索引（避免重複）。
- 計算 `popcount`（某個候選集合有多少數字）與「單一候選對應數字」。
- 建立 `bit → digit` 的對應表。

```typescript
/**
 * 預先計算索引、同儕與輔助查表。
 */
(function precomputeCaches(): void {
  // 每格的列、行、區塊索引
  for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
    const rowIndex = Math.floor(cellIndex / GRID_SIZE);
    const colIndex = cellIndex % GRID_SIZE;
    ROW_INDEX_CACHE[cellIndex] = rowIndex;
    COLUMN_INDEX_CACHE[cellIndex] = colIndex;
    BLOCK_INDEX_CACHE[cellIndex] =
      Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3);
  }

  // 建立每格的 20 個同儕
  for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
    const rowIndex = ROW_INDEX_CACHE[cellIndex];
    const colIndex = COLUMN_INDEX_CACHE[cellIndex];
    let writePointer = cellIndex * PEER_COUNT;

    // 同列 8 格
    for (let j = 0; j < GRID_SIZE; j++) {
      if (j !== colIndex) {
        PEERS[writePointer++] = rowIndex * GRID_SIZE + j;
      }
    }

    // 同行 8 格
    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== rowIndex) {
        PEERS[writePointer++] = i * GRID_SIZE + colIndex;
      }
    }

    // 同區塊 4 格（需去掉已在列/行出現的）
    const blockRow = Math.floor(rowIndex / 3);
    const blockCol = Math.floor(colIndex / 3);
    for (let i = blockRow * 3; i < blockRow * 3 + 3; i++) {
      for (let j = blockCol * 3; j < blockCol * 3 + 3; j++) {
        if (i === rowIndex && j === colIndex) continue;
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

  // 計算 popcount 與單一候選表
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

  // bit → 數字
  for (let k = 0; k < GRID_SIZE; k++) {
    BIT_TO_DIGIT_CACHE[1 << k] = k + 1;
  }
})();
```

### Step 4：解算器類別結構

宣告 `Solver` 類別，保存棋盤狀態與輔助結構：

- `rowMask`、`columnMask`、`blockMask`：記錄哪些數字已在該行、列、區塊出現。
- `candidates`：每格的候選集合。
- `emptyCellList`：目前空格清單。
- `queue`：用於約束傳播的佇列。

```typescript
/* --------------------------- 高效解算器 --------------------------- */

/**
 * 使用位元遮罩、型別化陣列與快取的高效數獨解算器
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

  // ...
}
```

### Step 5：建構子 — 初始化遮罩與候選

- 根據已填數字，更新列/行/區塊遮罩。
- 對空格計算候選集合，若為單一候選則放入佇列。
- 建立空格清單，記錄總數。

```typescript
class Solver {
  // Step 4：解算器類別結構
  
  /**
   * 初始化解算器
   *
   * @param board - 扁平化後的 Uint8Array[81]，空格為 0
   */
  constructor(board: Uint8Array) {
    this.board = board;
    this.rowMask = new Int32Array(GRID_SIZE);
    this.columnMask = new Int32Array(GRID_SIZE);
    this.blockMask = new Int32Array(GRID_SIZE);
    this.candidates = new Uint16Array(TOTAL_CELLS);
    this.emptyCellList = new Uint8Array(TOTAL_CELLS);
    this.queue = new Uint8Array(TOTAL_CELLS);

    // 已填數字更新遮罩
    for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
      const digit = board[cellIndex];
      if (digit !== 0) {
        const bitMask = 1 << (digit - 1);
        this.rowMask[ROW_INDEX_CACHE[cellIndex]] |= bitMask;
        this.columnMask[COLUMN_INDEX_CACHE[cellIndex]] |= bitMask;
        this.blockMask[BLOCK_INDEX_CACHE[cellIndex]] |= bitMask;
      }
    }

    // 計算初始候選與空格清單
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

  // ...
}
```

### Step 6：主要解法入口

先進行約束傳播，若無矛盾再進入 DFS。

```typescript
class Solver {
  // Step 4：解算器類別結構

  // Step 5：建構子 — 初始化遮罩與候選

  /**
   * 以約束傳播 + DFS 求解
   *
   * @returns 是否成功解出
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

  // ...
}
```

### Step 7：加入佇列

將某格索引放入傳播佇列。

```typescript
class Solver {
  // Step 4：解算器類別結構

  // Step 5：建構子 — 初始化遮罩與候選

  // Step 6：主要解法入口

  /**
   * 將格子索引加入傳播佇列
   */
  private enqueue(cellIndex: number): void {
    this.queue[this.queueTail++] = cellIndex;
  }
  
  // ...
}
```

### Step 8：落子並更新狀態

設定某格數字後，需：

1. 更新棋盤與遮罩。
2. 從空格清單移除該格。
3. 從所有同儕候選刪除此數字。若某同儕候選變單一則入列；若為空集合則標記矛盾。

```typescript
class Solver {
  // Step 4：解算器類別結構

  // Step 5：建構子 — 初始化遮罩與候選

  // Step 6：主要解法入口

  // Step 7：加入佇列

  /**
   * 在指定格落子並更新所有狀態
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

    // 從空格清單移除
    for (let i = 0; i < this.emptyCellCount; i++) {
      if (this.emptyCellList[i] === cellIndex) {
        this.emptyCellList[i] = this.emptyCellList[--this.emptyCellCount];
        break;
      }
    }

    // 從同儕刪除候選
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
  
  // ...
}
```

### Step 9：約束傳播

處理所有單一候選格，直到沒有新的格子或發現矛盾。

```typescript
class Solver {
  // Step 4：解算器類別結構

  // Step 5：建構子 — 初始化遮罩與候選

  // Step 6：主要解法入口

  // Step 7：加入佇列

  // Step 8：落子並更新狀態

  /**
   * 約束傳播：持續填入單一候選
   */
  private propagate(): boolean {
    while (this.queueHead < this.queueTail) {
      const cellIndex = this.queue[this.queueHead++];
      if (this.board[cellIndex] !== 0) continue;

      const candidateMask = this.candidates[cellIndex];
      const digit = SINGLE_DIGIT_CACHE[candidateMask];
      if (digit === 0) continue;

      this.setDigit(cellIndex, digit);
      if (this.hasContradiction) {
        this.hasContradiction = false;
        return false;
      }
    }
    return true;
  }

  // ...
}
```

### Step 10：回溯搜尋

採用 MRV 策略，選擇候選最少的格，逐一嘗試。
每次嘗試前保存狀態，失敗時回溯。

```typescript
class Solver {
  // Step 4：解算器類別結構

  // Step 5：建構子 — 初始化遮罩與候選

  // Step 6：主要解法入口

  // Step 7：加入佇列

  // Step 8：落子並更新狀態

  // Step 9：約束傳播

  /**
   * 使用最少剩餘值（MRV）的 DFS 回溯
   */
  private depthFirstSearch(): boolean {
    let bestCellIndex = -1;
    let bestCandidateCount = 10;
    let bestCandidateMask = 0;

    // 找候選數最少的格
    for (let i = 0; i < this.emptyCellCount; i++) {
      const cellIndex = this.emptyCellList[i];
      const candidateMask = this.candidates[cellIndex];
      if (candidateMask === 0) return false;

      const candidateCount = POPCOUNT_CACHE[candidateMask];
      if (candidateCount < bestCandidateCount) {
        bestCandidateCount = candidateCount;
        bestCellIndex = cellIndex;
        bestCandidateMask = candidateMask;
        if (candidateCount === 2) break;
      }
    }

    // 逐一嘗試候選數
    let mask = bestCandidateMask;
    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      const digit = BIT_TO_DIGIT_CACHE[bit];

      // 保存當前狀態
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
        if (this.emptyCellCount === 0) return true;
        if (this.depthFirstSearch()) return true;
      }
      this.restoreState(snapshot);
    }
    return false;
  }

  // ...
}
```

### Step 11：還原狀態（回溯）

當 DFS 嘗試失敗時，將狀態還原至快照。

```typescript
class Solver {
  // Step 4：解算器類別結構

  // Step 5：建構子 — 初始化遮罩與候選

  // Step 6：主要解法入口

  // Step 7：加入佇列

  // Step 8：落子並更新狀態

  // Step 9：約束傳播
  
  // Step 10：回溯搜尋
  
  /**
   * 回溯：還原快照狀態
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
```

## 時間複雜度

- 每次更新候選集合需檢查固定數量的同儕（最多 20 格），屬於常數操作。
- 在最壞情況下，回溯需嘗試所有可能數字組合，分支因子最多 $9$，深度最多 $81$。因此最壞時間複雜度為 $O(9^{81})$。
- 但實際上透過約束傳播與 MRV 剪枝，大幅降低嘗試次數，實務上效率遠優於理論上限。
- 總時間複雜度為 $O(9^{n^2})$，其中 $n=9$。

> $O(9^{n^2})$

## 空間複雜度

- 儲存棋盤、遮罩、候選集合等皆與格子數量成正比。
- 在一般化的 $n \times n$ 數獨（$n^2$ 格）下，需要 $O(n^2)$ 的空間。
- 回溯過程需要額外的遞迴堆疊與狀態快照，但仍受限於 $n^2$ 的規模。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
