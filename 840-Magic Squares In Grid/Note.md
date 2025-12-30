# 840. Magic Squares In Grid

A `3 x 3` magic square is a `3 x 3` grid filled with distinct numbers from 1 to 9 such 
that each row, column, and both diagonals all have the same sum.

Given a `row x col` `grid` of integers, how many `3 x 3` magic square subgrids are there?

Note: while a magic square can only contain numbers from 1 to 9, `grid` may contain numbers up to 15.

**Constraints:**

- `row == grid.length`
- `col == grid[i].length`
- `1 <= row, col <= 10`
- `0 <= grid[i][j] <= 15`

## 基礎思路

本題要在一個 `row x col` 的矩陣中，計算有多少個 `3 x 3` 子矩陣是「洛書（Lo Shu）」類型的魔方陣：
必須使用 **1 到 9 且不重複**，並且三列、三行與兩條對角線的總和都相同。

解題時可把問題拆成兩層：

1. **枚舉所有 3x3 視窗**：
   只要遍歷每個可能的左上角 `(topRowIndex, leftColumnIndex)`，就能枚舉所有 `3 x 3` 子矩陣。

2. **對單一 3x3 做快速驗證**：
   對每個視窗，檢查它是否同時滿足：

    * 中心必須是 5（Lo Shu 魔方陣的必要性質，可作為快速剪枝）
    * 九格皆落在 1...9 且互不重複
    * 以第一列作為目標總和，驗證三列與三行都等於該總和

由於每個視窗的檢查成本是常數（固定 3x3），整體時間主要由視窗數量決定，因此能在題目的小尺寸限制下穩定通過。

## 解題步驟

### Step 1：`isMagicSquareAt` — 驗證指定左上角的 3x3 是否為魔方陣

先用中心必須為 5 做剪枝；接著用集合檢查九格是否為 1...9 且不重複；
最後以第一列的總和作為 `targetSum`，逐列逐行驗證是否全部一致。

```typescript
/**
 * 檢查左上角在 (topRowIndex, leftColumnIndex) 的 3x3 子矩陣
 * 是否為使用 1..9 且各不相同的合法 3x3 魔方陣。
 *
 * @param grid - 二維整數矩陣
 * @param topRowIndex - 3x3 子矩陣左上角的列索引
 * @param leftColumnIndex - 3x3 子矩陣左上角的行索引
 * @return 若該 3x3 子矩陣為魔方陣則回傳 True
 */
function isMagicSquareAt(grid: number[][], topRowIndex: number, leftColumnIndex: number): boolean {
  // Lo Shu 3x3 魔方陣的中心必須是 5
  if (grid[topRowIndex + 1][leftColumnIndex + 1] !== 5) {
    return false;
  }

  const seenValues = new Set<number>();

  // 檢查數值必須在 1...9 且全部互不相同
  for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
    for (let columnOffset = 0; columnOffset < 3; columnOffset++) {
      const value = grid[topRowIndex + rowOffset][leftColumnIndex + columnOffset];

      if (value < 1 || value > 9 || seenValues.has(value)) {
        return false;
      }

      seenValues.add(value);
    }
  }

  const targetSum =
    grid[topRowIndex][leftColumnIndex] +
    grid[topRowIndex][leftColumnIndex + 1] +
    grid[topRowIndex][leftColumnIndex + 2];

  // 驗證所有列與行的總和都等於 targetSum
  for (let offset = 0; offset < 3; offset++) {
    const rowSum =
      grid[topRowIndex + offset][leftColumnIndex] +
      grid[topRowIndex + offset][leftColumnIndex + 1] +
      grid[topRowIndex + offset][leftColumnIndex + 2];

    if (rowSum !== targetSum) {
      return false;
    }

    const columnSum =
      grid[topRowIndex][leftColumnIndex + offset] +
      grid[topRowIndex + 1][leftColumnIndex + offset] +
      grid[topRowIndex + 2][leftColumnIndex + offset];

    if (columnSum !== targetSum) {
      return false;
    }
  }

  return true;
}
```

### Step 2：`numMagicSquaresInside` — 滑動 3x3 視窗並統計合格數量

用兩層迴圈枚舉所有 `3x3` 子矩陣的左上角；對每個位置呼叫 `isMagicSquareAt` 檢查，若成立則累加計數。

```typescript
/**
 * 計算給定矩陣中有多少個 3x3 的魔方陣子矩陣。
 *
 * @param grid - 二維整數矩陣
 * @return 3x3 魔方陣子矩陣的數量
 */
function numMagicSquaresInside(grid: number[][]): number {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  let magicSquareCount = 0;

  // 以 3x3 視窗在整個矩陣上滑動
  for (let topRowIndex = 0; topRowIndex <= rowCount - 3; topRowIndex++) {
    for (let leftColumnIndex = 0; leftColumnIndex <= columnCount - 3; leftColumnIndex++) {
      if (isMagicSquareAt(grid, topRowIndex, leftColumnIndex)) {
        magicSquareCount++;
      }
    }
  }

  return magicSquareCount;
}
```

## 時間複雜度

- 設 `row = r`、`col = c`，可枚舉的 `3x3` 子矩陣左上角數量為 `(r - 2)(c - 2)`。
- `isMagicSquareAt` 對固定 `3x3` 做檢查：掃描 9 格、再驗證 3 列與 3 行，皆為常數時間，因此每次呼叫為 $O(1)$。
- 總時間複雜度為 $O(r \times c)$。

> $O(r \times c)$

## 空間複雜度

- `isMagicSquareAt` 使用 `Set` 記錄最多 9 個數字，屬常數額外空間。
- 其餘變數皆為常數級。
- 總空間複雜度為 $O(1)$。

> $O(1)$
