# 417. Pacific Atlantic Water Flow

There is an `m x n` rectangular island that borders both the Pacific Ocean and Atlantic Ocean. 
The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.

The island is partitioned into a grid of square cells. 
You are given an `m x n` integer matrix `heights` where `heights[r][c]` represents the height above sea level of the cell at coordinate `(r, c)`.

The island receives a lot of rain, and the rain water can flow to neighboring cells directly north, south, east, and west if the neighboring cell's height is less than or equal to the current cell's height. Water can flow from any cell adjacent to an ocean into the ocean.

Return a 2D list of grid coordinates `result` where `result[i] = [r_i, c_i]` denotes 
that rain water can flow from cell `(r_i, c_i)` to both the Pacific and Atlantic oceans.

**Constraints:**

- `m == heights.length`
- `n == heights[r].length`
- `1 <= m, n <= 200`
- `0 <= heights[r][c] <= 10^5`

以下是完全遵照你規範的題解，包括：**基礎思路**（含問題分析與策略）、**解題步驟**（逐步拆解、程式碼含中文註解）、**時間與空間複雜度分析（使用 $n$ 為總格子數）**。

---

## 基礎思路

本題要求找出所有可以**同時流向太平洋與大西洋的格子**，水流條件如下：

- 水可以從當前格子流向上下左右四個方向；
- **只能往等高或更低的鄰格流動**；
- 太平洋位於島的**左側與上方**，大西洋位於島的**右側與下方**；
- 若水能從某格流到某海洋，表示該格的水最終可到達該邊界。

這題的直觀做法是對每個格子進行兩次搜尋（一次對太平洋，一次對大西洋），但這會導致 $O(m \times n^2)$ 的時間複雜度，不符合 $200×200$ 的資料上限需求。

為了解決這個問題，我們可以採用以下策略：

- **反向思考**：與其從每個格子出發，判斷能否流向海洋，我們可以反過來，從**海洋邊界出發往內推**，找出哪些格子水能流回來；
- **雙重 DFS**：分別從太平洋與大西洋的邊界出發，對每個海洋做 DFS，將所有可以到達的格子標記起來；
- **交集計算**：最後將兩個海洋都能到達的格子挑出來，即為同時可流向兩個海洋的解。

此方法能在 $O(m \times n)$ 時間內完成所有處理，效率符合題目需求。

## 解題步驟

### Step 1：初始化尺寸與記憶結構

取得行列數並建立兩個 `Uint8Array` 陣列，分別記錄能到達太平洋與大西洋的格子。

```typescript
// 取得行數與列數
const numberOfRows = heights.length;
const numberOfColumns = heights[0].length;
const totalCells = numberOfRows * numberOfColumns;

// 建立兩個記憶陣列：0 表未拜訪，1 表已拜訪
const pacificVisited = new Uint8Array(totalCells);
const atlanticVisited = new Uint8Array(totalCells);
```

### Step 2：定義深度優先搜尋函式

從起始點開始遞迴探索，只走向「等高或更低」的鄰格，並避免重複拜訪。

```typescript
/**
 * 深度優先搜尋：從當前格子出發，探索所有可達格子
 *
 * @param row 當前行
 * @param column 當前列
 * @param previousHeight 前一格高度（限制水流方向）
 * @param visited 記錄哪些格子已拜訪（太平洋或大西洋）
 */
function depthFirstSearch(
  row: number,
  column: number,
  previousHeight: number,
  visited: Uint8Array
): void {
  // 邊界檢查：超出地圖則結束
  if (row < 0 || column < 0 || row >= numberOfRows || column >= numberOfColumns) {
    return;
  }

  const linearIndex = row * numberOfColumns + column;

  // 若已拜訪過，直接跳過
  if (visited[linearIndex] === 1) {
    return;
  }

  const currentHeight = heights[row][column];

  // 若無法從前一格流入此格（即高度上升），跳過
  if (previousHeight > currentHeight) {
    return;
  }

  // 標記當前格子為已拜訪
  visited[linearIndex] = 1;

  // 向上探索
  depthFirstSearch(row - 1, column, currentHeight, visited);

  // 向下探索
  depthFirstSearch(row + 1, column, currentHeight, visited);

  // 向左探索
  depthFirstSearch(row, column - 1, currentHeight, visited);

  // 向右探索
  depthFirstSearch(row, column + 1, currentHeight, visited);
}
```

### Step 3：從太平洋邊界啟動 DFS

太平洋靠近**左邊界與上邊界**，對這些格子啟動 DFS。

```typescript
// 從太平洋的左邊界（每列的第 0 欄）開始 DFS
for (let row = 0; row < numberOfRows; row++) {
  depthFirstSearch(row, 0, 0, pacificVisited);
}

// 從太平洋的上邊界（第 0 列的每欄）開始 DFS
for (let column = 0; column < numberOfColumns; column++) {
  depthFirstSearch(0, column, 0, pacificVisited);
}
```

### Step 4：從大西洋邊界啟動 DFS

大西洋靠近**右邊界與下邊界**，對這些格子啟動 DFS。

```typescript
// 計算最右列與最下行
const lastRow = numberOfRows - 1;
const lastColumn = numberOfColumns - 1;

// 從大西洋的右邊界（每列的最後一欄）開始 DFS
for (let row = 0; row < numberOfRows; row++) {
  depthFirstSearch(row, lastColumn, 0, atlanticVisited);
}

// 從大西洋的下邊界（最後一列的每欄）開始 DFS
for (let column = 0; column < numberOfColumns; column++) {
  depthFirstSearch(lastRow, column, 0, atlanticVisited);
}
```

### Step 5：收集同時能流向兩海洋的格子

只要某格在兩個 `visited` 陣列中皆為 `1`，即為結果。

```typescript
// 收集同時能流向太平洋與大西洋的格子
const result: number[][] = [];

for (let row = 0; row < numberOfRows; row++) {
  const baseIndex = row * numberOfColumns;

  for (let column = 0; column < numberOfColumns; column++) {
    const index = baseIndex + column;

    if (pacificVisited[index] === 1 && atlanticVisited[index] === 1) {
      result.push([row, column]);
    }
  }
}

return result;
```

## 時間複雜度

- 每個格子最多只被訪問兩次（分別由太平洋與大西洋邊界啟動 DFS），每次 DFS 為 $O(1)$。
- 最終結果掃描與比較每格一次。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 使用兩個 `Uint8Array` 來標記拜訪狀態，各為 $O(m \times n)$。
- 使用遞迴堆疊（若不計堆疊則為常數額外空間）。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
