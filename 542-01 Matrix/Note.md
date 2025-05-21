# 542. 01 Matrix

Given an `m x n` binary matrix mat, return the distance of the nearest 0 for each cell.

The distance between two cells sharing a common edge is 1.

**Constraints:**

- `m == mat.length`
- `n == mat[i].length`
- `1 <= m, n <= 10^4`
- `1 <= m * n <= 10^4`
- `mat[i][j]` is either `0` or `1`.
- There is at least one `0` in `mat`.

## 基礎思路

這可以視為一個 Multi-Source BFS 問題，由是 `0` 的格子開始，逐漸往非 `0` 區域擴散，直到所有地區都被計算。

由於這題很容易超時，或炸記憶體，這邊引入一些小技巧

- 用簡化後 Sliding Window 方向陣列，可以從 4 x 2 大小簡化到 5 x 1 (移動一次取兩位，一樣是4個方向)
- 用 nextQueue 來存放下一次要處理的點，減少使用 `unshift` 所帶來的效能損耗

## 解題步驟

### Step 1: 紀錄矩陣大小

```typescript
const m = isWater.length;    // 行數
const n = isWater[0].length; // 列數
```

### Step 2: 初始化計算目標矩陣與待處理佇列

```typescript
// 初始化目標矩陣，設置所有點的距離為 -1，代表未訪問過
const newMatrix = Array.from({ length: m }, () => Array(n).fill(-1));
let queue: [number, number, number][] = [];
```

### Step 3: 初始化針對是 0 的格子處理

```typescript
// 設置矩陣所有是 0 的格子的距離為 0，並加入待處理佇列
for (let row = 0; row < m; row++) {
  for (let col = 0; col < n; col++) {
    // 如果是 0 ，新矩陣設為 0，並加入待處理佇列
    if (mat[row][col] === 0) {
      newMatrix[row][col] = 0;
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
        newMatrix[nextRow][nextCol] !== -1
      ) {
        continue;
      }

      // 設置旁邊的點的距離，並加入下一次處理的佇列
      newMatrix[nextRow][nextCol] = currentHeight + 1;
      queue.push([nextRow, nextCol, currentHeight + 1]);
    }
  }
  // 移動到下一個 BFS level
  queue = nextQueue;
}
```

## 時間複雜度

- 標記為 0 格子：$O(m \times n)$
- BFS 會遍歷所有點，時間複雜度為 $O(m \times n)$
- 總時間複雜度為 $O(m \times n)$

> $O(m \times n)$

## 空間複雜度

- 額外使用了一個二維陣列 `newMatrix` 來記錄每個點的距離，空間複雜度為 $O(m \times n)$
- `queue` 與 `nextQueue` 佇列的空間複雜度為 $O(m \times n)$
- 總空間複雜度為 $O(m \times n)$

> $O(m \times n)$
