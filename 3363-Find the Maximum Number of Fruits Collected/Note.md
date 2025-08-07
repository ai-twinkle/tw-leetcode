# 3363. Find the Maximum Number of Fruits Collected

There is a game dungeon comprised of `n x n` rooms arranged in a grid.

You are given a 2D array `fruits` of size `n x n`, where `fruits[i][j]` represents the number of fruits in the room `(i, j)`. 
Three children will play in the game dungeon, with initial positions at the corner rooms `(0, 0)`, `(0, n - 1)`, and `(n - 1, 0)`.

The children will make exactly `n - 1` moves according to the following rules to reach the room `(n - 1, n - 1)`:

- The child starting from `(0, 0)` must move from their current room `(i, j)` to one of the rooms `(i + 1, j + 1)`, `(i + 1, j)`, and `(i, j + 1)` if the target room exists.
- The child starting from `(0, n - 1)` must move from their current room `(i, j)` to one of the rooms `(i + 1, j - 1)`, `(i + 1, j)`, and `(i + 1, j + 1)` if the target room exists.
- The child starting from `(n - 1, 0)` must move from their current room `(i, j)` to one of the rooms `(i - 1, j + 1)`, `(i, j + 1)`, and `(i + 1, j + 1)` if the target room exists.

When a child enters a room, they will collect all the fruits there. 
If two or more children enter the same room, only one child will collect the fruits, and the room will be emptied after they leave.

Return the maximum number of fruits the children can collect from the dungeon.

**Constraints:**

- `2 <= n == fruits.length == fruits[i].length <= 1000`
- `0 <= fruits[i][j] <= 1000`

## 基礎思路

本題屬於多源路徑優化問題，核心挑戰在於三位小孩分別從三個不同的起點出發，移動至右下角終點 `(n-1, n-1)`，並希望收集到的果實總數最大化。

由於三人移動路徑會部分重疊（但同一格果實僅能被收集一次），因此必須設計出彼此路徑衝突最小化的分配策略。

因此，我們可以將問題拆解為三個部分：

1. 觀察每位小孩的移動規則與必經路徑，發現 `(0,0)` 的小孩只能走主對角線，這條路徑固定且與其他人可靈活規劃的區域重疊最小，因此直接保留。
2. 剩餘兩位小孩，分別從 `(n-1,0)` 與 `(0,n-1)` 出發，均可利用動態規劃搜尋最大收集路徑，並在選路時避開主對角線已經被收集的格子。
3. 利用空間優化的滾動陣列進行 DP 推進，確保在大規模資料下效能穩定。

## 解題步驟

### Step 1：初始化核心參數與變數

首先計算網格邊長 $n$，以及宣告一個變數用於最終答案統計，同時計算主對角線格子位置，方便後續路徑控制。

```typescript
const gridSize = fruits.length;
let totalFruitsCollected = 0;
const halfPoint = Math.ceil((gridSize - 1) / 2);
```

### Step 2：主對角線路徑直接累加

由於 `(0,0)` 的小孩只能走主對角線，這部分路徑完全不需規劃，直接將主對角線所有格子的果實數量累加。

```typescript
// 1. 從 (0,0) 出發的小孩直接收集主對角線上的所有果實。
for (let index = 0; index < gridSize; index++) {
  totalFruitsCollected += fruits[index][index];
}
```

### Step 3：動態規劃計算從左下角出發最大路徑

對從 `(n-1,0)` 出發的小孩，使用滾動陣列動態規劃，考慮其可向右、右上、右下移動，並於每一格取最大累積值。

```typescript
// 2. 從 (n-1,0) 出發的小孩進行動態規劃。
// 使用滾動陣列降低空間消耗並提升快取效率。
let previousColumn: Uint32Array = new Uint32Array(gridSize);
let currentColumn: Uint32Array = new Uint32Array(gridSize);

// 只初始化起點格子為可達。
previousColumn[gridSize - 1] = fruits[gridSize - 1][0];

// 從第 1 欄遍歷到第 n-2 欄（不經過右上和右下角）。
for (let columnIndex = 1; columnIndex <= gridSize - 2; columnIndex++) {
  currentColumn.fill(0);
  // 控制起始行位置（只遍歷合法路徑）
  const startRowIndex = columnIndex <= halfPoint - 1 ? gridSize - columnIndex - 1 : columnIndex + 1;
  for (let rowIndex = startRowIndex; rowIndex < gridSize; rowIndex++) {
    // 取三個可能來源的最大值
    let maximumFromPrevious = previousColumn[rowIndex]; // 從 (rowIndex, columnIndex-1)
    if (rowIndex > 0 && previousColumn[rowIndex - 1] > maximumFromPrevious) {
      maximumFromPrevious = previousColumn[rowIndex - 1]; // 從 (rowIndex-1, columnIndex-1)
    }
    if (rowIndex + 1 < gridSize && previousColumn[rowIndex + 1] > maximumFromPrevious) {
      maximumFromPrevious = previousColumn[rowIndex + 1]; // 從 (rowIndex+1, columnIndex-1)
    }
    currentColumn[rowIndex] = maximumFromPrevious + fruits[rowIndex][columnIndex];
  }
  // 交換滾動陣列，進行下一欄計算
  [previousColumn, currentColumn] = [currentColumn, previousColumn];
}
// 最終左下到右下倒數第二格的最大路徑和加入總果實量
totalFruitsCollected += previousColumn[gridSize - 1];
```

### Step 4：動態規劃計算從右上角出發最大路徑

同理，針對從 `(0,n-1)` 出發的小孩，依據其可移動方向，進行動態規劃累計最大可收集果實量。

```typescript
// 3. 從 (0,n-1) 出發的小孩進行動態規劃。
previousColumn = new Uint32Array(gridSize);
currentColumn = new Uint32Array(gridSize);

// 只初始化起點格子為可達。
previousColumn[gridSize - 1] = fruits[0][gridSize - 1];

// 從第 1 行遍歷到第 n-2 行。
for (let rowIndex = 1; rowIndex <= gridSize - 2; rowIndex++) {
  currentColumn.fill(0);
  // 控制起始欄位置（只遍歷合法路徑）
  const startColumnIndex = rowIndex <= halfPoint - 1 ? gridSize - rowIndex - 1 : rowIndex + 1;
  for (let columnIndex = startColumnIndex; columnIndex < gridSize; columnIndex++) {
    // 取三個可能來源的最大值
    let maximumFromPrevious = previousColumn[columnIndex]; // 從 (rowIndex-1, columnIndex)
    if (columnIndex > 0 && previousColumn[columnIndex - 1] > maximumFromPrevious) {
      maximumFromPrevious = previousColumn[columnIndex - 1]; // 從 (rowIndex-1, columnIndex-1)
    }
    if (columnIndex + 1 < gridSize && previousColumn[columnIndex + 1] > maximumFromPrevious) {
      maximumFromPrevious = previousColumn[columnIndex + 1]; // 從 (rowIndex-1, columnIndex+1)
    }
    currentColumn[columnIndex] = maximumFromPrevious + fruits[rowIndex][columnIndex];
  }
  // 交換滾動陣列，進行下一行計算
  [previousColumn, currentColumn] = [currentColumn, previousColumn];
}
// 最終右上到右下倒數第二格的最大路徑和加入總果實量
totalFruitsCollected += previousColumn[gridSize - 1];
```

### Step 5：回傳最終答案

將三位小孩各自最大可收集果實量加總後，作為最終結果回傳。

```typescript
return totalFruitsCollected;
```

## 時間複雜度

- 主對角線累加為 $O(n)$。
- 兩次動態規劃各需 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 僅需 $O(n)$ 大小的滾動陣列儲存當前狀態。
- 總空間複雜度為 $O(n)$。

> $O(n)$
