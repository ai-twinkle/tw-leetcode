# 827. Making A Large Island

You are given an `n x n` binary matrix `grid`. 
You are allowed to change at most one `0` to be `1`.

Return the size of the largest island in `grid` after applying this operation.

An island is a 4-directionally connected group of `1`s.

## 基礎思路

我們可以先把所有島嶼找出來，並給他們編號，紀錄每個島嶼的大小。
然後我們遍歷所有的"海洋"，將其變成"陸地"，並把新的島嶼的大小計為 1 加上四周的島嶼大小。
這樣就能有效的找出最大的島嶼。

> Tips:
> - 我們可以用 DFS 或 BFS 來找出島嶼。並給予編號，紀錄大小。
> - 為了進一步減少記憶體使用，我們可以利用 `grid` 來紀錄每個島嶼的編號。由於 `grid` 中的 0 與 1 已經被使用，我們可以用 2 以上的數字來表示島嶼的編號。

## 解題步驟

### Step 1: 初始化起點 id 與 大小 Set

```typescript
// 由於 `grid` 是 n x n 的二維陣列，我們紀錄一個 n 即可
const n = grid.length;

// 島嶼的編號從 2 開始，以區分 1 與 0
let currentIslandId = 2;

// 紀錄每個島嶼的大小
const islandSizes: Record<number, number> = {};
```

### Step 2: 定義 DFS 函數

```typescript
function dfs(row: number, col: number, islandId: number): void {
  // 基礎情況：超出邊界或不是當前島嶼的一部分
  if (row < 0 || col < 0 || row >= n || col >= n || grid[row][col] !== 1) {
    return;
  }

  grid[row][col] = islandId; // 標記當前位置為當前島嶼的一部分
  islandSizes[islandId]++;   // 增加當前島嶼的大小

  // 遞歸檢查四周的位置
  dfs(row - 1, col, islandId);
  dfs(row + 1, col, islandId);
  dfs(row, col - 1, islandId);
  dfs(row, col + 1, islandId);
}
```

### Step 3: 遍歷所有位置，找出島嶼

```typescript
for (let row = 0; row < n; row++) {
  for (let col = 0; col < n; col++) {
    // 跳過水域或已經標記過的島嶼
    if (grid[row][col] !== 1) {
      continue;
    }

    // 初始當前島嶼的大小
    islandSizes[currentIslandId] = 0;

    // 用 DFS 找出當前島嶼的大小並標記方格
    dfs(row, col, currentIslandId);

    // 移動到下一個島嶼 id
    currentIslandId++;
  }
}
```

### Step 4: Helper 函數，計算相鄰島嶼的大小

```typescript
function getConnectedIslandSize(row: number, col: number, visitedIslands: Set<number>): number {
  // 基礎情況：超出邊界或是水域
  if (row < 0 || col < 0 || row >= n || col >= n || grid[row][col] <= 1) {
    return 0;
  }

  // 取得當前位置的島嶼編號
  const islandId = grid[row][col];
  if (visitedIslands.has(islandId)) {
    return 0;
  }

  visitedIslands.add(islandId); // 標記當前島嶼已經被計算過
  return islandSizes[islandId]; // 回傳當前島嶼的大小
}
```

### Step 5: 遍歷所有水域，找出最大島嶼

```typescript
let maxIslandSize = 0;

// 旗標：是否有水域
let haveZeroCell = false;

for (let row = 0; row < n; row++) {
  for (let col = 0; col < n; col++) {
    if (grid[row][col] === 0) {
      // 我們找到了水域，設定旗標
      haveZeroCell = true;

      // 追蹤已經計算過的島嶼
      const visitedIslands = new Set<number>();

      // 計算潛在的島嶼大小
      let potentialSize = 1; // 由於我們將水域變成陸地，所以大小起始為 1

      // 檢查四周的島嶼
      potentialSize += getConnectedIslandSize(row - 1, col, visitedIslands);
      potentialSize += getConnectedIslandSize(row + 1, col, visitedIslands);
      potentialSize += getConnectedIslandSize(row, col - 1, visitedIslands);
      potentialSize += getConnectedIslandSize(row, col + 1, visitedIslands);

      // 更新最大島嶼大小
      maxIslandSize = Math.max(maxIslandSize, potentialSize);
    }
  }
}
```

### Step 6: 判定是否有水域，回傳結果

```typescript
// 如果有水域，回傳最大島嶼大小；否則回傳 n * n (所有方格都是島嶼)
return haveZeroCell ? maxIslandSize : n * n;
```

## 時間複雜度

- 計算島嶼大小會使用 DFS，由於不會重複計算，所以時間複雜度為 $O(n^2)$
- 檢查所有水域的四周島嶼大小，會需要遍歷所有方格，所以時間複雜度為 $O(n^2)$
- 總時間複雜度為 $O(n^2)$

> $O(n^2)$

## 空間複雜度

- 紀錄島嶼大小的 `islandSizes` 在最極端的情況下 (即棋盤狀的島嶼) 會使用有 $\frac{n^2}{2}$ 個島嶼，所以空間複雜度為 $O(n^2)$
- DFS 遞歸會最差情況下使用 $O(n^2)$ 的堆疊空間
- 總空間複雜度為 $O(n^2)$

> $O(n^2)$
