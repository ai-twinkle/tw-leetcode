# 1411. Number of Ways to Paint N × 3 Grid

You have a `grid` of size `n x 3` and you want to paint each cell of the grid with exactly one of the three colors: 
Red, Yellow, or Green while making sure that no two adjacent cells have the same color 
(i.e., no two cells that share vertical or horizontal sides have the same color).

Given `n` the number of rows of the grid, return the number of ways you can paint this `grid`. 
As the answer may grow large, the answer must be computed modulo `10^9 + 7`.

**Constraints:**

- `n == grid.length`
- `1 <= n <= 5000`

## 基礎思路

本題要計算 `n x 3` 網格的上色方式數量，顏色只有三種（紅、黃、綠），且任兩個**水平或垂直相鄰**格子不能同色。答案需對 `10^9 + 7` 取模。

關鍵在於每一列只有 3 格，因此單列合法塗法種類很有限，而且「下一列」只會受到「上一列」的影響，適合用動態規劃逐列累積。

對單列而言，合法排列可分成兩大類（以三格顏色型態分類）：

* **兩色型（ABA）**：第一格與第三格同色，第二格不同色。
  例如：紅黃紅、綠紅綠。
* **三色型（ABC）**：三格顏色都不同。
  例如：紅黃綠、黃綠紅。

因為列內已保證相鄰不同色，跨列只需要再確保「同一欄上下不同色」。可以推導出：
每一列的「ABA 數量」與「ABC 數量」只依賴上一列的 ABA/ABC 數量，形成固定的線性轉移，因此可以用兩個狀態一路推到第 `n` 列。

另外，題目允許多次呼叫函式，本解法把已算過的列數與結果存入表格中，下一次查詢若 `n` 不超過已計算範圍即可 $O(1)$ 直接回傳；若更大則只補算缺的列數。

## 解題步驟

### Step 1：常數、快取表與全域狀態宣告

建立模數常數、最大列數上限、答案快取表，以及「目前已計算到第幾列」與兩種型態的計數狀態。

```typescript
const MODULUS = 1_000_000_007;
const MAXIMUM_ROW_COUNT = 5000;

/**
 * totalWaysByRow[row] = n x 3 網格（n=row）時的合法塗法數量。
 */
const totalWaysByRow = new Int32Array(MAXIMUM_ROW_COUNT + 1);

let computedRowCount = 0;
let computedTwoColorPatternCount = 0;   // 「ABA」型：第一格=第三格，中間不同
let computedThreeColorPatternCount = 0; // 「ABC」型：三格皆不同
```

### Step 2：初始化第 1 列的基底狀態

第一次呼叫時，建立第 1 列的基底：
ABA 型共有 6 種、ABC 型共有 6 種，因此總數是 12。

```typescript
if (computedRowCount === 0) {
  // 初始化第 1 列：6 種「ABA」型 + 6 種「ABC」型
  computedRowCount = 1;
  computedTwoColorPatternCount = 6;
  computedThreeColorPatternCount = 6;
  totalWaysByRow[1] = 12;
}
```

### Step 3：若 n 已經計算過，直接回傳快取

若 `n` 小於等於目前已計算的最大列數，就可直接回傳快取表結果。

```typescript
if (n <= computedRowCount) {
  return totalWaysByRow[n];
}
```

### Step 4：準備模數與兩種型態的狀態變數

先把模數與目前已計算的兩種型態數量取出成區域變數，避免後續迴圈中反覆存取全域狀態。

```typescript
const modulus = MODULUS;
let twoColorPatternCount = computedTwoColorPatternCount;
let threeColorPatternCount = computedThreeColorPatternCount;
```

### Step 5：在主迴圈中計算下一列的三色型數量（ABC）

從 `computedRowCount + 1` 推進到 `n`，每一列先計算 `A + B` 並用條件減法維持在模數範圍內，接著推得下一列的三色型數量 `9`。

```typescript
for (let rowIndex = computedRowCount + 1; rowIndex <= n; rowIndex++) {
  // 使用推導後的轉移式，避免在熱迴圈中頻繁使用 % 運算
  let sumOfPatterns = twoColorPatternCount + threeColorPatternCount;
  if (sumOfPatterns >= modulus) {
    sumOfPatterns -= modulus;
  }

  let nextThreeColorPatternCount = sumOfPatterns + sumOfPatterns; // 2 * (A + B)
  if (nextThreeColorPatternCount >= modulus) {
    nextThreeColorPatternCount -= modulus;
  }

  // ...
}
```

### Step 6：在主迴圈中計算下一列的兩色型數量（ABA），並更新狀態

由已算出的 `nextThreeColorPatternCount` 推得 `nextTwoColorPatternCount`，再把兩個狀態更新成「下一列」版本。

```typescript
for (let rowIndex = computedRowCount + 1; rowIndex <= n; rowIndex++) {
  // Step 5：計算下一列的三色型數量（ABC）

  let nextTwoColorPatternCount = twoColorPatternCount + nextThreeColorPatternCount; // A + 2*(A+B)
  if (nextTwoColorPatternCount >= modulus) {
    nextTwoColorPatternCount -= modulus;
  }

  twoColorPatternCount = nextTwoColorPatternCount;
  threeColorPatternCount = nextThreeColorPatternCount;

  // ...
}
```

### Step 7：在主迴圈中寫入本列總答案到快取表

本列總數為兩型態相加，寫入 `totalWaysByRow[rowIndex]` 供未來 O(1) 查詢。

```typescript
for (let rowIndex = computedRowCount + 1; rowIndex <= n; rowIndex++) {
  // Step 5：計算下一列的三色型數量（ABC）

  // Step 6：計算下一列的兩色型數量（ABA），並更新狀態

  let totalWays = nextTwoColorPatternCount + nextThreeColorPatternCount;
  if (totalWays >= modulus) {
    totalWays -= modulus;
  }

  totalWaysByRow[rowIndex] = totalWays;
}
```

### Step 8：回寫全域已計算狀態並回傳答案

把本次推進後的狀態存回全域，最後回傳 `totalWaysByRow[n]`。

```typescript
computedRowCount = n;
computedTwoColorPatternCount = twoColorPatternCount;
computedThreeColorPatternCount = threeColorPatternCount;

return totalWaysByRow[n];
```

## 時間複雜度

- 若 `n <= computedRowCount`，直接查表回傳，時間為 $O(1)$。
- 否則需要從 `computedRowCount + 1` 推進到 `n`，迴圈次數為 `n - computedRowCount`，每次皆為常數操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 `MAXIMUM_ROW_COUNT + 1 = 5001` 的 `Int32Array` 作為快取表，空間為常數上界。
- 其餘僅為固定數量的整數變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
