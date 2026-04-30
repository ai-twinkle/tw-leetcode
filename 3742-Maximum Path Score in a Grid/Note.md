# 3742. Maximum Path Score in a Grid

You are given an `m x n` grid where each cell contains one of the values 0, 1, or 2. 
You are also given an integer `k`.

You start from the top-left corner `(0, 0)` and want to reach the bottom-right corner `(m - 1, n - 1)` by moving only right or down.

Each cell contributes a specific score and incurs an associated cost, according to their cell values:

- 0: adds 0 to your score and costs 0.
- 1: adds 1 to your score and costs 1.
- 2: adds 2 to your score and costs 1. 

Return the maximum score achievable without exceeding a total cost of `k`, or `-1` if no valid path exists.

Note: If you reach the last cell but the total cost exceeds `k`, the path is invalid.

**Constraints:**

- `1 <= m, n <= 200`
- `0 <= k <= 10^3`
- `grid[0][0] == 0`
- `0 <= grid[i][j] <= 2`

## 基礎思路

本題要求在一個 `m × n` 的格子中，從左上角走到右下角（只能向右或向下），在總花費不超過 `k` 的前提下，最大化累積分數。每個格子根據其值貢獻不同分數與花費，需同時追蹤兩個維度：路徑分數與路徑花費。

在思考解法時，可掌握以下核心觀察：

- **雙維度動態規劃**：
  每個狀態不只由位置決定，還必須紀錄當前累計花費，因此需要以「位置 + 花費」為狀態鍵，儲存對應的最大可達分數。

- **花費上界可被壓縮**：
  任何路徑最多經過 `m + n - 1` 個格子，且每格花費至多為 1，因此實際有意義的花費上限為 `m + n - 1`，超過此值的 `k` 可以截斷，避免浪費空間與時間。

- **轉移來源僅有兩個方向**：
  每個格子只能從上方或左方轉移而來，因此只需在處理每一列時維護「上一列」的 DP 結果，不必儲存整張二維 DP 表。

- **花費偏移決定可轉移的範圍**：
  進入一個格子會消耗固定花費，因此只有在花費索引減去該花費後仍合法的位置，才能進行轉移，低於此門檻的花費槽位無法被填入。

- **無效狀態需明確標記**：
  未能到達的狀態應以特殊值（`-1`）表示，避免與分數為 0 的合法狀態混淆，轉移時需過濾這些不可達狀態。

依據以上特性，可以採用以下策略：

- **以滾動陣列壓縮空間**，只保留前一列與當前列的 DP 狀態，每列計算完後即滾動更新。
- **在每次轉移時，從上方與左方取花費偏移後的最大前驅分數**，若兩者皆不可達則維持 `-1`。
- **最終掃描右下角格子的所有花費層**，取其中最大的有效分數作為答案。

此策略確保時間與空間複雜度均受到有效控制，且能正確處理不可達狀態與花費邊界。

## 解題步驟

### Step 1：初始化維度資訊並壓縮有效花費上界

路徑長度固定為 `m + n - 1`，每格花費至多為 1，因此超過此值的 `k` 並不會帶來更多可探索的狀態，可直接截斷為有效花費上界，減少後續計算量。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 任何路徑的最大花費至多為 (rowCount + columnCount - 1)，因為每格花費最多為 1；將 k 截斷以避免無謂運算。
const maxPathCost = rowCount + columnCount - 1;
const effectiveK = k < maxPathCost ? k : maxPathCost;
const costDimension = effectiveK + 1;
```

### Step 2：將二維格子攤平為一維陣列以加速存取

將原始二維格子轉存至一維型別陣列，使熱迴圈中的隨機存取更為連續，降低快取失效的影響。

```typescript
// 將格子攤平為型別陣列，以加快熱迴圈中的存取速度。
const flatGrid = new Uint8Array(rowCount * columnCount);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const sourceRow = grid[rowIndex];
  const baseIndex = rowIndex * columnCount;
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    flatGrid[baseIndex + columnIndex] = sourceRow[columnIndex];
  }
}
```

### Step 3：建立滾動 DP 陣列並初始化起點

建立兩列滾動 DP 陣列，每個格子對應 `costDimension` 個花費槽位，初始皆為 `-1` 表示不可達。
由於題目保證起點格子值為 0，直接將花費為 0 時的分數設為 0。

```typescript
// 兩列滾動 DP；每個項目儲存對應花費下的最佳分數，-1 表示不可達。
// Int16Array 已足夠，因為最大分數不超過 2 * (m + n - 1) <= 798。
const previousRow = new Int16Array(columnCount * costDimension);
const currentRow = new Int16Array(columnCount * costDimension);
previousRow.fill(-1);
currentRow.fill(-1);

// 初始化起點 (0,0)；grid[0][0] 保證為 0。
previousRow[0] = 0;
```

### Step 4：填入第一列的 DP 初始值

第一列的每個格子只能從左方轉移而來，因此對每個格子，從對應花費起始槽位向上掃描，繼承左鄰居在相應花費下的分數。

```typescript
// 向右走完第一列；每格只依賴左方相鄰格子。
for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
  const cellValue = flatGrid[columnIndex];
  const cellCost = cellValue >= 1 ? 1 : 0;
  const baseCurrent = columnIndex * costDimension;
  const baseLeft = (columnIndex - 1) * costDimension;
  // 每個花費層從左鄰居的偏移後花費繼承而來。
  for (let costIndex = cellCost; costIndex < costDimension; costIndex++) {
    const leftScore = previousRow[baseLeft + costIndex - cellCost];
    if (leftScore >= 0) {
      previousRow[baseCurrent + costIndex] = leftScore + cellValue;
    }
  }
}
```

### Step 5：處理第一欄（僅可從上方轉移）

對每一列的第一個格子，只有正上方的格子可以轉移過來；在寫入前先將該欄的花費槽位重置為 `-1`，再從上方繼承有效分數。

```typescript
for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
  const rowBase = rowIndex * columnCount;

  // 處理此列第 0 欄：只有正上方的格子可以轉移至此。
  const firstCellValue = flatGrid[rowBase];
  const firstCellCost = firstCellValue >= 1 ? 1 : 0;
  // 在寫入 currentRow 的第 0 欄之前，先將其重置。
  for (let costIndex = 0; costIndex < costDimension; costIndex++) {
    currentRow[costIndex] = -1;
  }
  for (let costIndex = firstCellCost; costIndex < costDimension; costIndex++) {
    const aboveScore = previousRow[costIndex - firstCellCost];
    if (aboveScore >= 0) {
      currentRow[costIndex] = aboveScore + firstCellValue;
    }
  }

  // ...
}
```

### Step 6：處理其餘欄位（可從上方或左方轉移，取最大值）

對同一列中第 1 欄以後的格子，上方與左方皆為合法前驅；先清除因花費偏移而無法填入的低花費槽位，再對每個有效花費槽位從兩個方向取最大前驅分數。

```typescript
for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
  // Step 5：處理第一欄

  // 處理其餘欄位；上方與左方鄰居皆為合法前驅。
  for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
    const cellValue = flatGrid[rowBase + columnIndex];
    const cellCost = cellValue >= 1 ? 1 : 0;
    const baseCurrent = columnIndex * costDimension;
    const baseAbove = baseCurrent;
    const baseLeft = (columnIndex - 1) * costDimension;

    // 清除因 cellCost 偏移而無法填入的低花費槽位。
    for (let costIndex = 0; costIndex < cellCost; costIndex++) {
      currentRow[baseCurrent + costIndex] = -1;
    }
    for (let costIndex = cellCost; costIndex < costDimension; costIndex++) {
      const sourceCostIndex = costIndex - cellCost;
      const aboveScore = previousRow[baseAbove + sourceCostIndex];
      const leftScore = currentRow[baseLeft + sourceCostIndex];
      // 取兩個前驅分數中較大者；-1 代表不可達。
      const bestPredecessor = aboveScore > leftScore ? aboveScore : leftScore;
      if (bestPredecessor >= 0) {
        currentRow[baseCurrent + costIndex] = bestPredecessor + cellValue;
      } else {
        currentRow[baseCurrent + costIndex] = -1;
      }
    }
  }

  // 將 currentRow 滾動到 previousRow 以供下一列使用。
  previousRow.set(currentRow);
}
```

### Step 7：掃描終點格子的所有花費層，回傳最大分數

所有列處理完畢後，右下角格子的各花費槽位中，取最大的有效分數作為答案；若所有槽位皆為 `-1` 則表示無法到達，回傳 `-1`。

```typescript
// 掃描右下角格子所有花費層，取最大可達分數。
const finalBase = (columnCount - 1) * costDimension;
let bestScore = -1;
for (let costIndex = 0; costIndex < costDimension; costIndex++) {
  const candidate = previousRow[finalBase + costIndex];
  if (candidate > bestScore) {
    bestScore = candidate;
  }
}

return bestScore;
```

## 時間複雜度

- 攤平格子需遍歷所有 `m × n` 個格子，花費 $O(mn)$；
- 初始化第一列需遍歷 `n` 個格子，每格處理 `effectiveK + 1` 個花費層，花費 $O(n \cdot k)$；
- 處理剩餘 `m - 1` 列，每列每格同樣處理 `effectiveK + 1` 個花費層，花費 $O(mn \cdot k)$；
- 由於 `k` 已被截斷為 $O(m + n)$，實際複雜度為 $O(mn(m + n))$，但以輸入參數表示為 $O(mn \cdot k)$。
- 總時間複雜度為 $O(mn \cdot k)$。

> $O(mn \cdot k)$

## 空間複雜度

- 攤平格子使用 $O(mn)$ 的一維陣列；
- 兩列滾動 DP 陣列各為 $O(n \cdot k)$，合計 $O(n \cdot k)$；
- 由於 `k` 已截斷為 $O(m + n)$，滾動陣列實際為 $O(n(m + n))$，但以輸入參數表示為 $O(n \cdot k)$。
- 總空間複雜度為 $O(mn + n \cdot k)$。

> $O(mn + n \cdot k)$
