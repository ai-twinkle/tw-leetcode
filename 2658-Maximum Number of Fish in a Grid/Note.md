# 2658. Maximum Number of Fish in a Grid

You are given a 0-indexed 2D matrix grid of size `m x n`, where `(r, c)` represents:

- A land cell if `grid[r][c] = 0`, or
- A water cell containing `grid[r][c]` fish, if `grid[r][c] > 0`.

A fisher can start at any water cell `(r, c)` and can do the following operations any number of times:

- Catch all the fish at cell `(r, c)`, or
- Move to any adjacent water cell.

Return the maximum number of fish the fisher can catch if he chooses his starting cell optimally, or 0 if no water cell exists.

An adjacent cell of the cell `(r, c)`, is one of the cells `(r, c + 1)`, `(r, c - 1)`, `(r + 1, c)` or `(r - 1, c)` if it exists.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 10`
- `0 <= grid[i][j] <= 10`

## 基礎思路

本題的目標是在一個由陸地和水域組成的網格中，找到一塊連通的水域，能夠捕獲最多的魚。
所謂「連通」是指水域之間可透過上下左右四個方向移動，彼此可達。

我們可以將每個水域（值大於 0 的格子）視為可能的起點，從該點出發，探索所有和它相連的水域格子，並將這些格子的魚數量加總。
對於每個水域起點都重複此過程，最終取所有結果中的最大值。

這個探索過程，本質上是尋找每個水域「連通區塊」的總魚量。
可以利用**深度優先搜尋（DFS）**或**廣度優先搜尋（BFS）**，從某一個水域起點開始，探索所有連通且尚未被探索過的水域，將魚數量累加。

本題重點在於：

- 需要遍歷整個網格，找到每一個尚未訪問過的水域，從這裡啟動搜尋。
- 每次搜尋時，記錄當前這塊連通區塊的魚數量。
- 最後返回所有區塊魚數量中的最大值。

由於網格最大只有 $10 \times 10$，暴力遍歷所有水域區塊是可行的。

## 解題步驟

### Step 1: 取得水域的 row 和 col

```typescript
const m = grid.length;    // row
const n = grid[0].length; // col
```

### Step 2: 定義 DFS 函數

```typescript
const dfs = (x: number, y: number): number => {
  // 檢查是否超出邊界與是否為 0 (已訪問過或是陸地)
  if (x < 0 || x >= m || y < 0 || y >= n || grid[x][y] == 0) {
    return 0;
  }

  // 進行捕捉魚，並將該水域設為 0
  let fish = grid[x][y];
  grid[x][y] = 0;

  // 朝四個方向進行 DFS
  return fish + dfs(x - 1, y) + dfs(x + 1, y) + dfs(x, y - 1) + dfs(x, y + 1);
};
```

### Step 3: 遍歷所有的水域

```typescript
// 紀錄最大的魚數
let maxFish = 0;

// 訪問每一個格子，且當前格子為水域時，進行 DFS
for (let i = 0; i < m; i++) {
  for (let j = 0; j < n; j++) {
    // 跳過陸地或是已訪問過的水域
    if (grid[i][j] == 0) {
      continue;
    }

    // 更新最大獲得的魚數
    maxFish = Math.max(maxFish, dfs(i, j))
  }
}
```

## 時間複雜度

- 在最壞情況下，主迴圈會檢查所有 $m\times n$ 個格子，每個格子都會因為是水域而觸發一次 DFS。
- 在這次 DFS 中，整個網格的每個格子只會被「拜訪」一次──第一次拜訪時就把它標記為已訪問（設為 0），之後再也不會重複進入。
- 因此，所有格子的總拜訪次數就是 $m\times n$ 次，演算法整體步數與 $m\times n$ 成正比。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- DFS 的呼叫堆疊深度，在最壞情況下會達到整個連通區塊的大小，也就是所有 $m\times n$ 格子都連通時的深度 $m \times n$。
- 若使用額外的 visited 陣列來保護原始 grid，也需額外 $m \times n$ 的空間。
- 在最壞的情況下，DFS 的遞迴深度為 $m \times n$，所以空間複雜度為 $O(m \times n)$。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
