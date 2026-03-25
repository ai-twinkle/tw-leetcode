# 3546. Equal Sum Grid Partition I

You are given an `m x n` matrix `grid` of positive integers. 
Your task is to determine if it is possible to make either one horizontal or one vertical cut on the grid such that:

- Each of the two resulting sections formed by the cut is non-empty.
- The sum of the elements in both sections is equal.

Return true if such a partition exists; otherwise return `false`.

**Constraints:**

- `1 <= m == grid.length <= 10^5`
- `1 <= n == grid[i].length <= 10^5`
- `2 <= m * n <= 10^5`
- `1 <= grid[i][j] <= 10^5`

## 基礎思路

本題要求判斷是否能對矩陣進行一次水平或垂直切割，使兩個區塊的元素總和相等。切割必須使兩側皆非空，且整體元素不重複、不遺漏。

在思考解法時，可掌握以下核心觀察：

- **切割等價於前綴和判斷**：
  無論水平還是垂直切割，都是在某個行或列之後將矩陣分成兩部分；若前綴總和等於整體總和的一半，則兩側相等。

- **避免浮點除法的精確性問題**：
  整體總和不一定為偶數，若直接除以 2 判斷可能引入浮點誤差；改用前綴和乘以 2 與整體總和比較，可完全在整數域內運算。

- **行列方向的對稱性**：
  水平切割對應於逐列累加行總和；垂直切割對應於逐欄累加列總和。兩者邏輯完全對稱，可分別處理。

- **行主序的記憶體存取效率**：
  建立各欄總和時，若以行主序（row-major order）逐列迭代欄位，可提升快取命中率，避免以欄主序存取導致的效能劣化。

依據以上特性，可以採用以下策略：

- **一次掃描同時計算每列總和與全域總和**，以減少不必要的重複遍歷。
- **水平方向**：對列總和逐步累加，在每個合法切割點檢查前綴和是否為整體的一半。
- **垂直方向**：以行主序建立欄總和，再對欄總和逐步累加，同樣在每個合法切割點進行相同檢查。
- **任一方向成立即可提早回傳**，若兩個方向均無合法切割則回傳 `false`。

此策略讓整體只需常數次線性遍歷，無需排序或額外資料結構，效率最優。

## 解題步驟

### Step 1：計算每列總和與全域總和

同時對每一列求和，並在同一個迴圈內累加至全域總和，避免二次遍歷。
每列的局部和存入陣列供後續水平切割使用，全域總和則作為判斷基準。

```typescript
const rowCount = grid.length;
const colCount = grid[0].length;

// 在單次遍歷中累加列總和與全域總和
const rowSums = new Float64Array(rowCount);
let totalSum = 0;

for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const currentRow = grid[rowIndex];
  let rowSum = 0;

  for (let colIndex = 0; colIndex < colCount; colIndex++) {
    rowSum += currentRow[colIndex];
  }

  rowSums[rowIndex] = rowSum;
  totalSum += rowSum;
}
```

### Step 2：逐列累加前綴和以檢查水平切割是否合法

對列總和從上到下累加，在每個合法切割點（最後一列之前）判斷前綴和是否等於全域總和的一半。
以乘以 2 取代除法，確保比較在整數域內進行。

```typescript
// 檢查水平切割：前綴列總和必須恰好等於總和的一半
let prefixSum = 0;
for (let rowIndex = 0; rowIndex < rowCount - 1; rowIndex++) {
  prefixSum += rowSums[rowIndex];

  // 乘以 2 而非對 totalSum 除以 2，以保持整數運算
  if (prefixSum * 2 === totalSum) {
    return true;
  }
}
```

### Step 3：以行主序建立各欄總和

為了檢查垂直切割，需要計算每欄的元素總和。
採用行主序（row-major order）逐列迭代，使記憶體存取連續，提升快取效率。

```typescript
// 以行主序迭代建立欄總和，提升快取效率
const colSums = new Float64Array(colCount);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const currentRow = grid[rowIndex];

  for (let colIndex = 0; colIndex < colCount; colIndex++) {
    colSums[colIndex] += currentRow[colIndex];
  }
}
```

### Step 4：逐欄累加前綴和以檢查垂直切割是否合法

對欄總和從左到右累加，在每個合法切割點（最後一欄之前）以相同的整數比較邏輯判斷是否成立；
若兩個方向均無合法切割，則回傳 `false`。

```typescript
// 檢查垂直切割：前綴欄總和必須恰好等於總和的一半
prefixSum = 0;
for (let colIndex = 0; colIndex < colCount - 1; colIndex++) {
  prefixSum += colSums[colIndex];

  if (prefixSum * 2 === totalSum) {
    return true;
  }
}

return false;
```

## 時間複雜度

- 計算列總和與全域總和需遍歷所有 $m \times n$ 個元素，時間為 $O(m \cdot n)$；
- 水平切割檢查遍歷 $m$ 列，時間為 $O(m)$；
- 建立欄總和同樣遍歷所有 $m \times n$ 個元素，時間為 $O(m \cdot n)$；
- 垂直切割檢查遍歷 $n$ 欄，時間為 $O(n)$；
- 總時間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$

## 空間複雜度

- 使用長度為 $m$ 的陣列儲存列總和；
- 使用長度為 $n$ 的陣列儲存欄總和；
- 總空間複雜度為 $O(m + n)$。

> $O(m + n)$
