# 808. Soup Servings

You have two soups, A and B, each starting with `n` mL. 
On every turn, one of the following four serving operations is chosen at random, each with probability `0.25` independent of all previous turns:

- pour 100 mL from type A and 0 mL from type B
- pour 75 mL from type A and 25 mL from type B
- pour 50 mL from type A and 50 mL from type B
- pour 25 mL from type A and 75 mL from type B

Note:

- There is no operation that pours 0 mL from A and 100 mL from B.
- The amounts from A and B are poured simultaneously during the turn.
- If an operation asks you to pour more than you have left of a soup, pour all that remains of that soup.

The process stops immediately after any turn in which one of the soups is used up.

Return the probability that A is used up before B, plus half the probability that both soups are used up in the same turn. 
Answers within `10^-5` of the actual answer will be accepted.

**Constraints:**

- `0 <= n <= 10^9`

## 基礎思路

這題是經典的動態規劃期望值模型（LeetCode 808 Soup Servings）。
因為每次只會以 25 mL 的倍數消耗湯量，我們可以把容量以「單位 = 25 mL」縮小，令 `scaledUnits = ceil(n / 25)`，把原本連續的毫升數轉成有限的網格 `(i, j)`，分別代表 **A 還剩 i 單位、B 還剩 j 單位** 的狀態。

對任一狀態 `(i, j)`，下一步會平均地（機率皆為 0.25）轉移到四個狀態：

- `(i-4, j)`      對應「倒 A=100, B=0」
- `(i-3, j-1)`    對應「倒 A=75,  B=25」
- `(i-2, j-2)`    對應「倒 A=50,  B=50」
- `(i-1, j-3)`    對應「倒 A=25,  B=75」

索引一律向下截到 0（因為「不夠就全倒」），使轉移總是落在有效邊界內。

**邊界條件：**

* `(0, 0)`：同回合同時倒光 → 回傳 0.5（題目要求 A 先倒光的機率 + 一半同時倒光的機率）。
* `(0, j>0)`：A 先倒光 → 回傳 1.0。
* `(i>0, 0)`：B 先倒光 → 回傳 0.0。

**狀態轉移：**
`dp[i][j] = 0.25 * (dp[i-4][j] + dp[i-3][j-1] + dp[i-2][j-2] + dp[i-1][j-3])`（索引小於 0 時以 0 取代）。

又因為當 `n` 很大時答案迅速趨近 1（A 幾乎必定先倒光或同回合倒光），使用經典安全的剪枝門檻 `n >= 4800` 直接回傳 1，能把時間複雜度壓成常數。

程式採 **自底向上** 的 DP，把整個 `(scaledUnits + 1) × (scaledUnits + 1)` 的表填滿；並以 **一維 `Float64Array` 平鋪** 存儲（row-major），加上 **快取（cache）網格**，可在多次查詢時重複使用不重建。

## 解題步驟

### Step 1：宣告可重用的快取狀態

先準備全域快取，儲存已建好的最大網格邊長與實際的攤平機率表，供多次呼叫直接重用。

```typescript
// 跨次呼叫可重用的狀態（針對重複查詢快速）
let cachedMaximumScaledUnits = 0;              // 已建立的最大縮放單位數
let cachedGridStride = 0;                      // stride = cachedMaximumScaledUnits + 1
let cachedProbabilityGrid: Float64Array | null = null; // 以列優先順序攤平成一維的網格
```

### Step 2：建立／擴充 DP 表 `ensureProbabilityGrid`

若當前快取不足以涵蓋目標縮放大小，則建立到對應規模。先寫入三種基底，再用自底向上依公式填滿整張表（每格等於四個前驅的平均，索引以 0 夾住）。

```typescript
function ensureProbabilityGrid(targetScaledUnits: number): void {
  if (cachedProbabilityGrid && cachedMaximumScaledUnits >= targetScaledUnits) {
    return;
  }

  const scaledUnits = targetScaledUnits;
  const gridStride = scaledUnits + 1;
  const probabilityGrid = new Float64Array(gridStride * gridStride);

  // 基底狀態。
  probabilityGrid[0] = 0.5; // A 與 B 同時為空。
  for (let columnIndex = 1; columnIndex <= scaledUnits; columnIndex++) {
    probabilityGrid[columnIndex] = 1.0; // A 先用盡。
  }
  for (let rowIndex = 1; rowIndex <= scaledUnits; rowIndex++) {
    probabilityGrid[rowIndex * gridStride] = 0.0; // B 先用盡。
  }

  // 自底向上的動態規劃。
  // 每個格子是四種出餐選擇的平均，且索引需夾住避免越界。
  for (let rowIndex = 1; rowIndex <= scaledUnits; rowIndex++) {
    // 預先計算湯 A 的夾住列索引。
    const rowMinusOne = rowIndex - 1 >= 0 ? rowIndex - 1 : 0;
    const rowMinusTwo = rowIndex - 2 >= 0 ? rowIndex - 2 : 0;
    const rowMinusThree = rowIndex - 3 >= 0 ? rowIndex - 3 : 0;
    const rowMinusFour = rowIndex - 4 >= 0 ? rowIndex - 4 : 0;

    for (let columnIndex = 1; columnIndex <= scaledUnits; columnIndex++) {
      // 預先計算湯 B 的夾住欄索引。
      const columnMinusOne = columnIndex - 1 >= 0 ? columnIndex - 1 : 0;
      const columnMinusTwo = columnIndex - 2 >= 0 ? columnIndex - 2 : 0;
      const columnMinusThree = columnIndex - 3 >= 0 ? columnIndex - 3 : 0;

      // 讀取四個前驅狀態。
      const probabilityAOnly = probabilityGrid[rowMinusFour * gridStride + columnIndex];
      const probabilityA75B25 = probabilityGrid[rowMinusThree * gridStride + columnMinusOne];
      const probabilityA50B50 = probabilityGrid[rowMinusTwo * gridStride + columnMinusTwo];
      const probabilityA25B75 = probabilityGrid[rowMinusOne * gridStride + columnMinusThree];

      probabilityGrid[rowIndex * gridStride + columnIndex] =
        0.25 * (probabilityAOnly + probabilityA75B25 + probabilityA50B50 + probabilityA25B75);
    }
  }

  // 發佈新的快取。
  cachedProbabilityGrid = probabilityGrid;
  cachedMaximumScaledUnits = scaledUnits;
  cachedGridStride = gridStride;
}
```

### Step 3：主流程 `soupServings`

先處理大 `n` 的快速返回，再把毫升數縮放成 25 的單位數，確保表格已建立到 `(scaledUnits, scaledUnits)`，最後直接查出答案。

```typescript
function soupServings(n: number): number {
  // 大 n 會快速收斂至 1；此臨界值為標準且安全。
  if (n >= 4800) {
    return 1.0;
  }

  // 以 25 mL 為單位縮放以減少狀態空間。
  const scaledUnits = Math.ceil(n / 25);

  // 建立或重用至 (scaledUnits, scaledUnits) 的機率網格。
  ensureProbabilityGrid(scaledUnits);

  // 直接查表得到答案。
  return (cachedProbabilityGrid as Float64Array)[scaledUnits * cachedGridStride + scaledUnits];
}
```

## 時間複雜度

- 建表時需計算約 `(s+1)^2` 個格子，每格 `O(1)`，`s = ceil(n/25)`。
- 使用快取後，若已建到足夠規模，查詢為 `O(1)`；擴表僅在新需求超過舊上限時發生。
- 總時間複雜度為 $O!\left((\lceil n/25\rceil)^2\right)$。

> $O!\left((\lceil n/25\rceil)^2\right)$

## 空間複雜度

- 機率表大小為 `(s+1) \times (s+1)`，其餘快取欄位為常數級。
- 總空間複雜度為 $O!\left((\lceil n/25\rceil)^2\right)$。

> $O!\left((\lceil n/25\rceil)^2\right)$
