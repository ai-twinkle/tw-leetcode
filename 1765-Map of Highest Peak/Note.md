# 1765. Map of Highest Peak

You are given an integer matrix `isWater` of size `m x n` that represents a map of land and water cells.

* If `isWater[i][j] == 0`, cell `(i, j)` is a land cell.
* If `isWater[i][j] == 1`, cell `(i, j)` is a water cell.

You must assign each cell a height in a way that follows these rules:

* The height of each cell must be non-negative.
* If the cell is a water cell, its height must be `0`.
* Any two adjacent cells must have an absolute height difference of at most `1`. 
* A cell is adjacent to another cell if the former is directly north, east, south, or west of the latter (i.e., their sides are touching).

Find an assignment of heights such that the maximum height in the matrix is maximized.

Return an integer matrix height of size `m x n` where `height[i][j]` is cell `(i, j)`'s height. 
If there are multiple solutions, return any of them.

It Is nearly the same as [542. 01 Matrix](../542-01%20Matrix/Note.md)

## 基礎思路
這可以視為一個 Multi-Source BFS 問題，由水源開始，逐漸往空白地區擴散，直到所有地區都被填滿。

> Tips 這題很容易超時，或炸記憶體，這邊引入一些小技巧
> 1. 用簡化後 Sliding Window 方向陣列，可以從 4 x 2 大小簡化到 5 x 1 (移動一次取兩位，一樣是4個方向)
> 2. 用 nextQueue 來存放下一次要處理的點，減少使用 `unshift` 所帶來的效能損耗

## 解題步驟

### Step 1: 紀錄地圖大小

```typescript
const m = isWater.length;    // 行數
const n = isWater[0].length; // 列數
```

### Step 2: 初始化地圖與待處理佇列

```typescript
// 初始化地圖，設置所有點的高度為 -1，代表未訪問過
const heights = Array.from({ length: m }, () => Array(n).fill(-1));
let queue: [number, number, number][] = [];
```

### Step 3: 初始化水源

```typescript
// 初始化水源，將所有水源點的高度設為 0，並加入待處理佇列
for (let row = 0; row < m; row++) {
  for (let col = 0; col < n; col++) {
    // 如果是水源，高度設為 0，並加入待處理佇列
    if (isWater[row][col] === 1) {
      heights[row][col] = 0;
      queue.push([row, col, 0]);
    }
  }
}
```

### Step 4: 開始 BFS

```typescript
while (queue.length > 0) {
  // 用來標記下個 BFS level 的點
  const nextQueue: [number, number, number][] = [];
  
  // 遍歷當前 BFS level 的所有點
  for (const [currentRow, currentCol, currentHeight] of queue) {
    for (let i = 0; i < 4; i++) {
      // 利用 Sliding Window 方向陣列，取得下一個點的位置
      const nextRow = currentRow + HIGHEST_PEEK_DIRECTIONS[i];
      const nextCol = currentCol + HIGHEST_PEEK_DIRECTIONS[i + 1];

      // 如果下一個點超出地圖範圍，或已經訪問過，則跳過
      if (
        nextRow < 0 ||
        nextRow >= m ||
        nextCol < 0 ||
        nextCol >= n ||
        heights[nextRow][nextCol] !== -1
      ) {
        continue;
      }

      // 設置旁邊的點的高度，並加入下一次處理的佇列
      heights[nextRow][nextCol] = currentHeight + 1;
      queue.push([nextRow, nextCol, currentHeight + 1]);
    }
  }
  // 移動到下一個 BFS level
  queue = nextQueue;
}
```

## 時間複雜度

- 標記水源：$O(m \times n)$
- BFS 會遍歷所有點，時間複雜度為 $O(m \times n)$
- 總時間複雜度為 $O(m \times n)$

> $O(m \times n)$

## 空間複雜度
- 額外使用了一個二維陣列 `heights` 來記錄每個點的高度，空間複雜度為 $O(m \times n)$
- `queue` 與 `nextQueue` 佇列的空間複雜度為 $O(m \times n)$
- 總空間複雜度為 $O(m \times n)$

> $O(m \times n)$
