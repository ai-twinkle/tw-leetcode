# 3418. Maximum Amount of Money Robot Can Earn

You are given an `m x n` grid. 
A robot starts at the top-left corner of the grid `(0, 0)` and wants to reach the bottom-right corner `(m - 1, n - 1)`. 
The robot can move either right or down at any point in time.

The grid contains a value `coins[i][j]` in each cell:

- If `coins[i][j] >= 0`, the robot gains that many coins.
- If `coins[i][j] < 0`, the robot encounters a robber, and the robber steals the absolute value of `coins[i][j]` coins.

The robot has a special ability to neutralize robbers in at most 2 cells on its path, 
preventing them from stealing coins in those cells.

Note: The robot's total coins can be negative.

Return the maximum profit the robot can gain on the route.

**Constraints:**

- `m == coins.length`
- `n == coins[i].length`
- `1 <= m, n <= 500`
- `-1000 <= coins[i][j] <= 1000`

## 基礎思路

本題要求機器人從矩陣左上角走到右下角，只能向右或向下移動，每格有對應的金幣收益或損失，且機器人最多可以對路徑上的 2 格啟動「中和能力」，使該格的負值不造成損失。目標是在使用該能力的最佳時機下，最大化最終金幣總量。

在思考解法時，可掌握以下核心觀察：

- **路徑唯一性決定了狀態維度**：
  機器人只能向右或向下，因此到達任意格的路徑不會重複經過同一格，路徑結構是一個 DAG，適合以動態規劃逐格推進。

- **中和次數是關鍵狀態維度**：
  機器人最多使用 2 次中和能力，且每次決策都會影響後續可用次數；因此需以「已使用次數」作為狀態的第三個維度，分開追蹤三種情況：使用 0 次、1 次、2 次。

- **每格的轉移有兩種來源**：
  當前格可由上方或左方轉移而來，選取兩者中較大的值，再加上當前格的貢獻；若選擇在此格使用中和能力，則該格貢獻視為 0（對負格有利）。

- **中和能力的使用只對負格有意義**：
  對正值格使用中和能力會損失收益，因此最優策略只會在負格考慮升級（從「k 次」跳到「k+1 次」並跳過該格損失）。

- **在每格更新前必須先讀取所有前驅值**：
  由於三個層級共用同一個緩衝區且在同一迴圈中更新，必須在寫入前先讀取所有舊值，才能保留正確的轉移語義。

依據以上特性，可以採用以下策略：

- **以單一攤平的一維緩衝區模擬三層 DP**，每層對應一種中和次數，並於每一列更新時以前一列的舊值作為「上方」前驅。
- **在每格同時考慮「不使用中和」與「使用中和跳過負值」兩條路徑**，更新順序從高層到低層，以舊值作為跨層轉移的來源。
- **最終答案取第 2 層（已使用 2 次中和）在右下角的值**，即為全局最大收益。

此策略在 $O(m \times n)$ 時間與 $O(n)$ 空間內完成所有轉移，兼顧效率與正確性。

## 解題步驟

### Step 1：初始化維度常數與攤平的 DP 緩衝區

矩陣共有三個層級（對應使用 0、1、2 次中和），每層需要 `n + 1` 個位置（含哨兵欄）。
使用單一 `Float64Array` 連續存放三層，並以 `-Infinity` 填充，表示所有狀態初始為不可達。

```typescript
const columnCount = coins[0].length;
const strideLength = columnCount + 1;

// 以單一攤平的 Float64Array 儲存三個 DP 層級，連續排列。
// 排列方式：[k=0 的 0..n 欄 | k=1 的 0..n 欄 | k=2 的 0..n 欄]
const dp = new Float64Array(strideLength * 3).fill(-Infinity);
```

### Step 2：計算三個層級的起始偏移量

為了讓後續存取清晰且不出錯，預先計算三層在緩衝區中的起始偏移量。

```typescript
// 各中和次數層在緩衝區中的起始偏移量。
const levelZeroOffset = 0;
const levelOneOffset = strideLength;
const levelTwoOffset = strideLength * 2;
```

### Step 3：設定入口哨兵值，使第一格能正確轉移

每層的第 1 欄（即 index 1）設為 0，作為機器人尚未踏入任何格時的初始狀態；
第 0 欄保持 `-Infinity`，作為哨兵防止越界轉移影響第一欄。

```typescript
// 第 1 欄為入口起點；第 0 欄（哨兵欄）維持 -Infinity。
dp[levelZeroOffset + 1] = 0;
dp[levelOneOffset + 1] = 0;
dp[levelTwoOffset + 1] = 0;
```

### Step 4：逐列推進，並在每列開始時重置哨兵欄

外層迴圈逐列處理，每列開始時將三層的第 0 欄重新設為 `-Infinity`，
確保每列的第 1 欄只能從上方（前一列同欄）轉移，而非從左方越界轉移。

```typescript
for (let rowIndex = 0; rowIndex < coins.length; rowIndex++) {
  const currentRow = coins[rowIndex];

  dp[levelZeroOffset] = -Infinity;
  dp[levelOneOffset] = -Infinity;
  dp[levelTwoOffset] = -Infinity;

  // ...
}
```

### Step 5：在每格讀取所有前驅值並計算各層最佳前驅

在寫入任何值之前，先一次性讀取來自左方與上方的六個舊值，
再分別取各層的最大值作為「最佳前驅」，以保留正確的轉移語義。

```typescript
for (let rowIndex = 0; rowIndex < coins.length; rowIndex++) {
  // Step 4：重置哨兵欄

  for (let j = 1; j <= columnCount; j++) {
    const cellValue = currentRow[j - 1];

    // 在任何寫入前先讀取所有六個前驅值（保留原始語義）。
    const leftZero  = dp[levelZeroOffset + j - 1];
    const leftOne   = dp[levelOneOffset  + j - 1];
    const leftTwo   = dp[levelTwoOffset  + j - 1];
    const aboveZero = dp[levelZeroOffset + j];
    const aboveOne  = dp[levelOneOffset  + j];
    const aboveTwo  = dp[levelTwoOffset  + j];

    // 各層從左方或上方取最大值作為最佳前驅。
    const bestZero = leftZero > aboveZero ? leftZero : aboveZero;
    const bestOne  = leftOne  > aboveOne  ? leftOne  : aboveOne;
    const bestTwo  = leftTwo  > aboveTwo  ? leftTwo  : aboveTwo;

    // ...
  }
}
```

### Step 6：依序更新三個層級的 DP 值

按照 k=2、k=1、k=0 的順序更新，確保跨層「升級」時讀取的是舊值。
每層有兩個選擇：正常累加當前格的值，或使用中和能力（從低一層的最佳前驅跳入，跳過此格損失）；取兩者較大值。

```typescript
for (let rowIndex = 0; rowIndex < coins.length; rowIndex++) {
  // Step 4：重置哨兵欄

  for (let j = 1; j <= columnCount; j++) {
    // Step 5：讀取前驅值並計算各層最佳前驅

    // 嚴格依照原始更新順序（k=2, k=1, k=0）。
    // 「使用中和」的項目從下一層讀取前一步驟中已讀取的舊值。
    dp[levelTwoOffset + j] = (bestTwo + cellValue) > bestOne ? (bestTwo + cellValue) : bestOne;
    dp[levelOneOffset + j] = (bestOne + cellValue) > bestZero ? (bestOne + cellValue) : bestZero;
    dp[levelZeroOffset + j] = bestZero + cellValue;
  }
}
```

### Step 7：回傳右下角在最高中和層的最大收益

走完所有列後，第 2 層（已使用最多 2 次中和）的右下角即為全局最優解。

```typescript
return dp[levelTwoOffset + columnCount];
```

## 時間複雜度

- 外層迴圈遍歷 $m$ 列，內層遍歷 $n$ 欄，每格執行常數次運算；
- 共三個層級，但每格的運算量仍為常數；
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 使用單一攤平緩衝區儲存三層 DP，大小為 $3(n + 1)$；
- 不需要保留歷史列，每列原地覆寫；
- 總空間複雜度為 $O(n)$。

> $O(n)$
