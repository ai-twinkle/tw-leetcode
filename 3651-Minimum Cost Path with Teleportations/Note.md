# 3651. Minimum Cost Path with Teleportations

You are given a `m x n` 2D integer array grid and an integer `k`. 
You start at the top-left cell `(0, 0)` and your goal is to reach the bottom‐right cell `(m - 1, n - 1)`.

There are two types of moves available:

- Normal move: You can move right or down from your current cell `(i, j)`, 
  i.e. you can move to `(i, j + 1)` (right) or `(i + 1, j)` (down). 
  The cost is the value of the destination cell.
- Teleportation: You can teleport from any cell `(i, j)`, to any cell `(x, y)` such that `grid[x][y] <= grid[i][j]`; 
  the cost of this move is 0. 
  You may teleport at most `k` times.

Return the minimum total cost to reach cell `(m - 1, n - 1)` from `(0, 0)`.

**Constraints:**

- `2 <= m, n <= 80`
- `m == grid.length`
- `n == grid[i].length`
- `0 <= grid[i][j] <= 10^4`
- `0 <= k <= 10`

## 基礎思路

本題是在網格上從左上走到右下，移動方式包含：

1. **一般移動（右/下）**：進入目標格需付出該格的成本。
2. **傳送（Teleport）**：可從任意格傳送到任意格，只要目標格數值不大於當前格數值，且花費為 0；最多使用 `k` 次。

要在這種規則下求最小成本，核心在於把「最多使用 `k` 次傳送」視為一個分層的動態規劃：

* **分層 DP（依傳送使用次數）**：每一層代表「最多使用 t 次傳送」時到達每格的最小成本。
* **一般移動轉移**：在同一層內，仍是從上/左轉移並加上進入格的成本。
* **傳送轉移的關鍵加速**：傳送條件只與「格子值的大小關係」有關：能從值較大或相等的格傳到值較小或相等的格。
  因此對於某個目標格值 `v`，傳送到它的最佳成本等價於「上一層中所有值 `>= v` 的格子成本最小值」。
* **用值域做全域最小查詢**：將上一層所有格子的成本依格子值彙整，並自高到低建立「後綴最小值」，即可在 O(1) 查到「值 >= v 的最小成本」。

整體做法是：

* 先算出 **不使用傳送** 的最小路徑成本作為第 0 層；
* 再依序做 `k` 次分層更新：每層先準備「可傳送到每種值的最小成本查表」，再用它與一般移動一起更新整張表。

## 解題步驟

### Step 1：初始化維度、展平網格並記錄最大值

先快取 `m, n` 與總格數，設定不可達的極大值常數。
接著把 2D 網格展平成 1D TypedArray（提升存取局部性），並同時記錄最大格值以便後續建立值域輔助陣列。

```typescript
// 快取網格維度，避免重複存取屬性
const rowCount = grid.length;
const columnCount = grid[0].length;
const cellCount = rowCount * columnCount;

// 使用極大值作為不可達狀態的哨兵值
const INF = 1_000_000_000;

// 將 2D 網格展平成 1D TypedArray，提高快取命中率
let maxValue = 0;
const flattenedValue = new Uint16Array(cellCount);
let index = 0;
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = grid[rowIndex];
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const value = row[columnIndex];
    flattenedValue[index] = value;
    // 記錄最大格值，讓後綴最小陣列能用最小必要大小建立
    if (value > maxValue) {
      maxValue = value;
    }
    index++;
  }
}
```

### Step 2：建立第 0 層 DP（不使用傳送）

`dpPrevious` 表示「目前層」到每格的最小成本；第 0 層只允許右/下移動。
先初始化起點，填第一列，再逐列填其餘位置（每格取上/左較小者再加上格值）。

```typescript
// dpPrevious[cellIndex] 儲存目前到達此格的最小成本
let dpPrevious = new Int32Array(cellCount);

// 起點成本為 0
dpPrevious[0] = 0;

// 僅用向右移動填第一列
for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
  const index = columnIndex;
  dpPrevious[index] = dpPrevious[index - 1] + flattenedValue[index];
}

// 僅用向右與向下移動填其餘列
for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
  const rowBase = rowIndex * columnCount;

  // 第一欄只能從上方到達
  const index = rowBase;
  dpPrevious[index] = dpPrevious[index - columnCount] + flattenedValue[index];

  // 內部格取上方或左方較小路徑
  for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
    const index = rowBase + columnIndex;
    const fromTop = dpPrevious[index - columnCount];
    const fromLeft = dpPrevious[index - 1];
    const bestBefore = fromTop < fromLeft ? fromTop : fromLeft;
    dpPrevious[index] = bestBefore + flattenedValue[index];
  }
}
```

### Step 3：若不允許傳送則直接返回

當 `k = 0`，答案就是第 0 層右下角的成本。

```typescript
// 若不允許傳送，直接提早返回
if (k === 0) {
  return dpPrevious[cellCount - 1];
}
```

### Step 4：建立值域輔助陣列，開始逐層處理傳送次數

`bestCostAtOrAboveValue[v]` 用來表示「上一層中所有值 >= v 的格子成本最小值」。
每一層會先重設它、彙整每個格值的最小成本、再做後綴最小化，讓查詢變成 O(1)。

```typescript
// bestCostAtOrAboveValue[v] 儲存值 >= v 的格子中最小成本
const bestCostAtOrAboveValue = new Int32Array(maxValue + 2);

// 逐層處理每次可用的傳送次數
for (let teleportCount = 1; teleportCount <= k; teleportCount++) {
  // 重設後綴最小輔助陣列
  for (let value = 0; value <= maxValue + 1; value++) {
    bestCostAtOrAboveValue[value] = INF;
  }

  // ...
}
```

### Step 5：在同一層中彙整「每個格值的最小成本」，並建立後綴最小

先掃描所有格子，把上一層 `dpPrevious` 的成本按格值取最小；
再由大到小做後綴最小，使 `bestCostAtOrAboveValue[v]` 代表「值 >= v 的最小成本」。

```typescript
for (let teleportCount = 1; teleportCount <= k; teleportCount++) {
  // Step 4：重設後綴最小輔助陣列

  // 紀錄每個確切格值的最小成本
  for (let index = 0; index < cellCount; index++) {
    const value = flattenedValue[index];
    const cost = dpPrevious[index];
    if (cost < bestCostAtOrAboveValue[value]) {
      bestCostAtOrAboveValue[value] = cost;
    }
  }

  // 建立後綴最小，讓傳送查詢可 O(1) 完成
  for (let value = maxValue - 1; value >= 0; value--) {
    const next = bestCostAtOrAboveValue[value + 1];
    if (next < bestCostAtOrAboveValue[value]) {
      bestCostAtOrAboveValue[value] = next;
    }
  }

  // ...
}
```

### Step 6：建立本層 DP，並填第一列（可選一般移動或傳送）

本層 `dpCurrent` 表示「最多使用 teleportCount 次傳送」到每格的最小成本。
起點固定為 0。第一列每格取「傳送到此格」與「從左邊一般走來」兩者的較小值。

```typescript
for (let teleportCount = 1; teleportCount <= k; teleportCount++) {
  // Step 4：重設後綴最小輔助陣列

  // Step 5：彙整每個格值的最小成本並建立後綴最小

  // 配置本層 DP
  const dpCurrent = new Int32Array(cellCount);

  // 起點不論使用幾次傳送都免費
  dpCurrent[0] = 0;

  // 計算第一列：可選一般移動或傳送
  for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
    const index = columnIndex;
    const value = flattenedValue[index];

    const teleportArriveCost = bestCostAtOrAboveValue[value];
    const normalArriveCost = dpCurrent[index - 1] + value;

    dpCurrent[index] = teleportArriveCost < normalArriveCost
      ? teleportArriveCost
      : normalArriveCost;
  }

  // ...
}
```

### Step 7：填其餘列（同時考慮傳送、從上、從左）

每列第一欄只能從上方走或用傳送；內部格則取三者最小：傳送、從上、從左。

```typescript
for (let teleportCount = 1; teleportCount <= k; teleportCount++) {
  // Step 4：重設後綴最小輔助陣列

  // Step 5：彙整每個格值的最小成本並建立後綴最小

  // Step 6：配置本層 DP 並填第一列

  // 計算其餘列：同時允許傳送與一般移動
  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    const rowBase = rowIndex * columnCount;

    // 第一欄只能從上方或傳送到達
    const index = rowBase;
    const value = flattenedValue[index];

    const teleportArriveCost = bestCostAtOrAboveValue[value];
    const normalArriveCost = dpCurrent[index - columnCount] + value;

    dpCurrent[index] = teleportArriveCost < normalArriveCost
      ? teleportArriveCost
      : normalArriveCost;

    // 內部格考慮：傳送、從上、從左
    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      const index = rowBase + columnIndex;
      const value = flattenedValue[index];

      const teleportArriveCost = bestCostAtOrAboveValue[value];

      const fromTop = dpCurrent[index - columnCount] + value;
      const fromLeft = dpCurrent[index - 1] + value;
      const normalArriveCost = fromTop < fromLeft ? fromTop : fromLeft;

      dpCurrent[index] = teleportArriveCost < normalArriveCost
        ? teleportArriveCost
        : normalArriveCost;
    }
  }

  // ...
}
```

### Step 8：完成本層後更新 dpPrevious，最後回傳答案

每層做完後令 `dpPrevious = dpCurrent`，繼續下一層。
所有層結束後，右下角即為最小成本。

```typescript
for (let teleportCount = 1; teleportCount <= k; teleportCount++) {
  // Step 4：重設後綴最小輔助陣列

  // Step 5：彙整每個格值的最小成本並建立後綴最小

  // Step 6：配置本層 DP 並填第一列

  // Step 7：填其餘列（傳送 / 從上 / 從左）

  // 進入下一層
  dpPrevious = dpCurrent;
}

// 回傳到達右下角的最小成本
return dpPrevious[cellCount - 1];
```

## 時間複雜度

- 設 `m = grid.length`、`n = grid[0].length`，令 `N = m × n` 為格子總數；
- 設 `V = max(grid[i][j]) + 2` 為值域輔助陣列長度；
- 展平網格與第 0 層（不使用傳送）的動態規劃各需 $O(N)$；
- 當 `k > 0` 時，每一層傳送動態規劃包含：
  - 重設值域輔助陣列：$O(V)$；
  - 彙整每個格值的最小成本：$O(N)$；
  - 建立後綴最小：$O(V)$；
  - 計算本層整張 DP 表：$O(N)$；
- 因此每一層為 $O(N + V)$，共進行 `k` 層。
- 總時間複雜度為 $O(N + k(N + V))$。

> $O(N + k(N + V))$

## 空間複雜度

- 展平後的格值陣列 `flattenedValue`：$O(N)$；
- 兩層 DP 陣列 `dpPrevious` 與 `dpCurrent`：合計 $O(N)$；
- 值域後綴最小輔助陣列 `bestCostAtOrAboveValue`：$O(V)$；
- 其餘變數皆為常數空間。
- 總空間複雜度為 $O(N + V)$。

> $O(N + V)$
