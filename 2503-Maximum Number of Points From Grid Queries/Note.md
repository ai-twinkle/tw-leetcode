# 2503. Maximum Number of Points From Grid Queries

You are given an `m x n` integer matrix `grid` and an array `queries` of size `k`.

Find an array `answer` of size `k` such that for each integer `queries[i]` you start in the top left cell of the matrix and repeat the following process:

- If `queries[i]` is strictly greater than the value of the current cell that you are in, 
  then you get one point if it is your first time visiting this cell, 
  and you can move to any adjacent cell in all `4` directions: up, down, left, and right.
- Otherwise, you do not get any points, and you end this process.

After the process, `answer[i]` is the maximum number of points you can get. 
Note that for each query you are allowed to visit the same cell multiple times.

Return the resulting array `answer`

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `2 <= m, n <= 1000`
- `4 <= m * n <= 10^5`
- `k == queries.length`
- `1 <= k <= 10^4`
- `1 <= grid[i][j], queries[i] <= 10^6`

## 基礎思路

可以把這題想像成從左上角出發玩迷宮遊戲，每個格子有自己的難度值。如果你的「能量值」（即查詢值）**嚴格大於**格子難度，就可以進入這個格子並拿 1 分，然後再往上下左右繼續探索。

因為會有多個不同的查詢值，每次都從頭開始探索效率太低。所以我們採用**累積擴展區域**的方式：

- **從小到大處理查詢值**，每次只需要額外擴展新開放的區域。
- 使用**小根堆**管理「待探索的邊界格子」，每次都挑選最容易通過（數值最小）的格子優先處理。

這樣，每個格子只會被探索一次，大幅降低了重複運算的成本。

## 解題步驟

### Step 1：取得矩陣基本資訊

首先，取得矩陣的行數、列數以及總格子數量，以便後續進行記憶體預分配與邊界判斷。

```typescript
const numRows = grid.length;
const numCols = grid[0].length;
const totalCells = numRows * numCols;
```

### Step 2：建立自定義資料結構（小根堆）與查詢預處理

- **查詢預處理**：利用 `Set` 取得查詢的唯一值後，再從小到大排序，確保每次擴展都是累積進行。

- **自定義小根堆**：使用預先分配的記憶體（`Uint32Array`）來管理邊界上的格子，儲存格子的數值與座標，這有助於以較低成本進行堆操作。

```typescript
// 取得唯一且排序的查詢值
const uniqueSortedQueries = Array.from(new Set(queries)).sort((a, b) => a - b);

// 建立自定義的小根堆，容量為所有格子的數量
const border = new CustomMinHeap(totalCells);
```

### Step 3：初始化探索起點

從起點 (0,0) 開始探索。利用 `expandCell` 函數將起點加入小根堆，同時標記該格子為已拜訪（設定為 0）。

```typescript
function expandCell(row: number, col: number): void {
  if (grid[row][col] === 0) return;
  border.add(grid[row][col], row, col);
  grid[row][col] = 0;
}

expandCell(0, 0);
```

### Step 4：動態處理每個查詢

對於每個查詢值，重複以下步驟：

- **區域擴展**：當小根堆中最小的格子數值小於當前查詢值時，不斷從堆中取出該格子，同時計數並將其四個方向（上、左、下、右）的相鄰格子進行擴展（呼叫 `expandCell`）。

- **記錄結果**：每次查詢結束時，將從起點能夠到達的總格子數記錄下來，並映射到該查詢值上。

```typescript
let totalVisitedCells = 0;
const lastRow = numRows - 1, lastCol = numCols - 1;
const queryResults = new Map<number, number>();

for (const queryThreshold of uniqueSortedQueries) {
  // 當邊界上最小的格子數值小於查詢值時，持續擴展
  while (border.top() !== undefined && queryThreshold > border.top()!) {
    const [row, col] = border.pop();
    totalVisitedCells++;
    // 向四個方向探索相鄰格子
    if (row > 0) {
      expandCell(row - 1, col);
    }
    if (col > 0) {
      expandCell(row, col - 1);
    }
    if (row < lastRow) {
      expandCell(row + 1, col);
    }
    if (col < lastCol) {
      expandCell(row, col + 1);
    }
  }
  queryResults.set(queryThreshold, totalVisitedCells);
}
```

### Step 5：將查詢結果映射回原始順序

由於查詢在預處理時被排序過，最後需要依據原始查詢的順序來產生最終答案。

```typescript
const output: number[] = new Array(queries.length);
for (let i = 0; i < queries.length; i++) {
  output[i] = queryResults.get(queries[i])!;
}
return output;
```

### Step 6：最小堆的實作

我們需要一個小根堆來管理邊界格子，這裡使用 `Uint32Array` 來儲存格子的數值與座標。

以下是小根堆的實作：

```typescript
/**
 * CustomMinHeap is a specialized min‑heap implementation optimized for grid expansion.
 * It uses pre‑allocated typed arrays (Uint32Array) for storing cell values and their coordinates.
 */
class CustomMinHeap {
  private last: number;
  private readonly values: Uint32Array;
  private readonly rows: Uint32Array;
  private readonly cols: Uint32Array;

  /**
   * Creates an instance of CustomMinHeap with the given capacity.
   *
   * @param capacity Maximum number of elements that can be stored (typically m*n).
   */
  constructor(capacity: number) {
    this.last = -1;
    this.values = new Uint32Array(capacity);
    this.rows = new Uint32Array(capacity);
    this.cols = new Uint32Array(capacity);
  }

  /**
   * Returns the smallest cell value in the heap or undefined if the heap is empty.
   *
   * @returns The smallest cell value, or undefined.
   */
  public top(): number | undefined {
    return this.last < 0 ? undefined : this.values[0];
  }

  /**
   * Adds a new cell to the heap.
   *
   * @param cellValue The value of the cell.
   * @param row The row coordinate.
   * @param col The column coordinate.
   */
  public add(cellValue: number, row: number, col: number): void {
    this.last++;
    this.values[this.last] = cellValue;
    this.rows[this.last] = row;
    this.cols[this.last] = col;
    this.bubbleUp(this.last);
  }

  /**
   * Removes and returns the coordinates [row, col] of the cell with the smallest value.
   *
   * @returns A tuple [row, col] of the popped cell.
   */
  public pop(): [number, number] {
    const retRow = this.rows[0];
    const retCol = this.cols[0];
    this.swap(0, this.last);
    this.last--;
    this.bubbleDown(0);
    return [retRow, retCol];
  }

  /**
   * Swaps the elements at indices i and j in all arrays.
   *
   * @param i The first index.
   * @param j The second index.
   */
  private swap(i: number, j: number): void {
    let temp = this.values[i];
    this.values[i] = this.values[j];
    this.values[j] = temp;

    temp = this.rows[i];
    this.rows[i] = this.rows[j];
    this.rows[j] = temp;

    temp = this.cols[i];
    this.cols[i] = this.cols[j];
    this.cols[j] = temp;
  }

  /**
   * Bubbles up the element at index i to maintain the heap invariant.
   *
   * @param i The index of the element to bubble up.
   */
  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.values[i] >= this.values[parent]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  /**
   * Bubbles down the element at index i to maintain the heap invariant.
   *
   * @param i The index of the element to bubble down.
   */
  private bubbleDown(i: number): void {
    while ((i << 1) + 1 <= this.last) {
      let smallest = i;
      const left = (i << 1) + 1;
      const right = left + 1;
      if (left <= this.last && this.values[left] < this.values[smallest]) {
        smallest = left;
      }
      if (right <= this.last && this.values[right] < this.values[smallest]) {
        smallest = right;
      }
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }
}
```

## 時間複雜度

- **區域擴展部分**  
  每個格子最多被加入與彈出小根堆一次，每次堆操作的平均複雜度為 $O(\log(m \times n))$，因此該部分的最壞情況為 $O(m \times n \log(m \times n))$。

- **查詢預處理**  
  去重與排序查詢的時間複雜度為 $O(q \log q)$。

- 總時間複雜度為 $O(m \times n \log(m \times n) + q \log q)$。

> $O(m \times n \log(m \times n) + q \log q)$

## 空間複雜度

- **小根堆空間**  
  預先分配的空間大小為 $O(m \times n)$，用來存儲格子數值與座標。

- **額外查詢映射空間**  
  用於存放查詢結果的映射與最終答案陣列，佔用 $O(q)$ 的空間。

- 總空間複雜度為 $O(m \times n + q)$。

> $O(m \times n + q)$
