# 3197. Find the Minimum Area to Cover All Ones II

You are given a 2D binary array `grid`. 
You need to find 3 non-overlapping rectangles having non-zero areas with horizontal and vertical sides such that all the 1's in `grid` lie inside these rectangles.

Return the minimum possible sum of the area of these rectangles.

Note that the rectangles are allowed to touch.

**Constraints:**

- `1 <= grid.length, grid[i].length <= 30`
- `grid[i][j]` is either 0 or 1.
- The input is generated such that there are at least three 1's in `grid`.

## 基礎思路

題目要求在一個二維二元矩陣 `grid` 中，用 **3 個互不重疊的矩形**（矩形可以相貼但不能重疊，且面積必須非零）來覆蓋所有的 `1`，並且希望這三個矩形的面積總和最小。

我們可以透過以下幾個關鍵策略來達成：

1. **快速區域查詢**：
   使用前綴和（row prefix、column prefix、2D prefix）來實現 $O(1)$ 查詢，這樣可以快速計算任意子矩形內有多少個 `1`。

2. **最小外接矩形計算**：
   對於給定區域，找到最小能覆蓋所有 `1` 的外接矩形，並計算其面積。這樣每個區域的最小包圍代價就能得到。

3. **兩矩形分割最佳化**：
   在一個區域內若要切成兩個矩形，可以嘗試所有可能的水平與垂直切割，並取兩個子矩形最小外接矩形面積和的最小值。

4. **三矩形分割策略**：
   全域上要分成三個矩形，可分為以下情況：

   - 三個垂直條帶；
   - 三個水平條帶；
   - 一個矩形 + 另一側分成兩個矩形（垂直切割）；
   - 一個矩形 + 另一側分成兩個矩形（水平切割）。

5. **快取與避免重算**：

   - 對於相同輸入的整體答案，用字串編碼作為 key 做快取。
   - 對於子區域的最小外接矩形面積，亦以區域編碼儲存在 Map 中，避免重複計算。

最後，透過前綴和快速查詢 + 分割枚舉，能在題目規模 $30 \times 30$ 的限制下有效計算。

## 解題步驟

### Step 1：全域快取

首先建立全域 Map，儲存相同 `grid` 輸入的最小結果。

```typescript
// 全域快取：避免重複計算相同輸入的最小答案
const minimumSumResultCache = new Map<string, number>();
```

### Step 2：初始化與快取查詢

將 `grid` 編碼為字串作為快取鍵，若已有結果則直接回傳。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 建立快取 key
let cacheKeyBuilder = "";
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  cacheKeyBuilder += grid[rowIndex].join("");
}
const cacheKey = `${rowCount}x${columnCount}:${cacheKeyBuilder}`;
if (minimumSumResultCache.has(cacheKey)) {
  return minimumSumResultCache.get(cacheKey)!;
}
```

### Step 3：轉換為 TypedArray

將輸入矩陣轉換成 `Uint8Array`，方便後續高效存取。

```typescript
// 複製 grid 到 Uint8Array，加速存取
const binaryGrid = new Array<Uint8Array>(rowCount);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const rowArray = new Uint8Array(columnCount);
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    rowArray[columnIndex] = grid[rowIndex][columnIndex] as 0 | 1;
  }
  binaryGrid[rowIndex] = rowArray;
}
```

### Step 4：列前綴和

建立每列的前綴和，用於快速查詢列區段內的 `1` 數量。

```typescript
// 建立 row prefix sum
const rowPrefixSum = new Array<Int32Array>(rowCount);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const prefix = new Int32Array(columnCount + 1);
  let sum = 0;
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    sum += binaryGrid[rowIndex][columnIndex];
    prefix[columnIndex + 1] = sum;
  }
  rowPrefixSum[rowIndex] = prefix;
}
```

### Step 5：行前綴和

建立每行的前綴和，用於快速查詢行區段內的 `1` 數量。

```typescript
// 建立 column prefix sum
const columnPrefixSum = new Array<Int32Array>(columnCount);
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  const prefix = new Int32Array(rowCount + 1);
  let sum = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    sum += binaryGrid[rowIndex][columnIndex];
    prefix[rowIndex + 1] = sum;
  }
  columnPrefixSum[columnIndex] = prefix;
}
```

### Step 6：二維前綴和

計算二維前綴和，讓子矩形查詢在 $O(1)$ 完成。

```typescript
// 建立二維 prefix sum
const stride = columnCount + 1;
const twoDimensionalPrefixSum = new Int32Array((rowCount + 1) * (columnCount + 1));
for (let rowIndex = 1; rowIndex <= rowCount; rowIndex++) {
  let rowSum = 0;
  for (let columnIndex = 1; columnIndex <= columnCount; columnIndex++) {
    rowSum += binaryGrid[rowIndex - 1][columnIndex - 1];
    twoDimensionalPrefixSum[rowIndex * stride + columnIndex] =
      twoDimensionalPrefixSum[(rowIndex - 1) * stride + columnIndex] + rowSum;
  }
}
```

### Step 7：輔助查詢函式

定義查詢子區域、列區段與行區段 `1` 數量的函式。

```typescript
// 計算子矩形內的 1 數量
const countOnesInRegion = (
  rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
): number => {
  const r1 = rowStart;
  const r2 = rowEnd + 1;
  const c1 = columnStart;
  const c2 = columnEnd + 1;
  return (
    twoDimensionalPrefixSum[r2 * stride + c2] -
    twoDimensionalPrefixSum[r1 * stride + c2] -
    twoDimensionalPrefixSum[r2 * stride + c1] +
    twoDimensionalPrefixSum[r1 * stride + c1]
  );
}

// 計算某列區段內的 1 數量
const countOnesInRowRange = (
  rowIndex: number, columnStart: number, columnEnd: number
): number => {
  return rowPrefixSum[rowIndex][columnEnd + 1] - rowPrefixSum[rowIndex][columnStart];
}

// 計算某行區段內的 1 數量
const countOnesInColumnRange = (
  columnIndex: number, rowStart: number, rowEnd: number
): number => {
  return columnPrefixSum[columnIndex][rowEnd + 1] - columnPrefixSum[columnIndex][rowStart];
}
```

### Step 8：區域編碼與快取

為子區域編碼，並建立面積快取避免重算。

```typescript
// 區域面積快取
const singleRegionAreaCache = new Map<number, number>();
const encodeRegion = (
  rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
): number => {
  return (rowStart << 24) | (rowEnd << 16) | (columnStart << 8) | columnEnd;
}
```

### Step 9：計算最小外接矩形面積

找到區域內含有所有 `1` 的最小矩形面積。

```typescript
const computeTightBoundingArea = (
  rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
): number => {
  const code = encodeRegion(rowStart, rowEnd, columnStart, columnEnd);
  if (singleRegionAreaCache.has(code)) {
    return singleRegionAreaCache.get(code)!;
  }

  if (countOnesInRegion(rowStart, rowEnd, columnStart, columnEnd) === 0) {
    singleRegionAreaCache.set(code, -1);
    return -1;
  }

  // 找到上下界
  let minRow = -1, maxRow = -1;
  for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex++) {
    if (countOnesInRowRange(rowIndex, columnStart, columnEnd) > 0) {
      minRow = rowIndex;
      break;
    }
  }
  for (let rowIndex = rowEnd; rowIndex >= rowStart; rowIndex--) {
    if (countOnesInRowRange(rowIndex, columnStart, columnEnd) > 0) {
      maxRow = rowIndex;
      break;
    }
  }

  // 找到左右界
  let minColumn = -1, maxColumn = -1;
  for (let columnIndex = columnStart; columnIndex <= columnEnd; columnIndex++) {
    if (countOnesInColumnRange(columnIndex, rowStart, rowEnd) > 0) {
      minColumn = columnIndex;
      break;
    }
  }
  for (let columnIndex = columnEnd; columnIndex >= columnStart; columnIndex--) {
    if (countOnesInColumnRange(columnIndex, rowStart, rowEnd) > 0) {
      maxColumn = columnIndex;
      break;
    }
  }

  const area = (maxRow - minRow + 1) * (maxColumn - minColumn + 1);
  singleRegionAreaCache.set(code, area);
  return area;
}
```

### Step 10：兩矩形最佳分割

嘗試所有水平或垂直切割，求兩矩形面積和的最小值。

```typescript
const computeBestTwoRectangles = (
  rowStart: number, rowEnd: number, columnStart: number, columnEnd: number
): number => {
  let best = Number.POSITIVE_INFINITY;

  // 垂直切割
  for (let splitColumn = columnStart; splitColumn < columnEnd; splitColumn++) {
    const leftArea = computeTightBoundingArea(rowStart, rowEnd, columnStart, splitColumn);
    const rightArea = computeTightBoundingArea(rowStart, rowEnd, splitColumn + 1, columnEnd);
    if (leftArea !== -1 && rightArea !== -1) {
      best = Math.min(best, leftArea + rightArea);
    }
  }

  // 水平切割
  for (let splitRow = rowStart; splitRow < rowEnd; splitRow++) {
    const topArea = computeTightBoundingArea(rowStart, splitRow, columnStart, columnEnd);
    const bottomArea = computeTightBoundingArea(splitRow + 1, rowEnd, columnStart, columnEnd);
    if (topArea !== -1 && bottomArea !== -1) {
      best = Math.min(best, topArea + bottomArea);
    }
  }

  return best;
}
```

### Step 11：枚舉三矩形策略

遍歷四種策略並更新最小答案。

```typescript
let minimumAnswer = Number.POSITIVE_INFINITY;

// 三個垂直條帶
for (let firstCut = 0; firstCut <= columnCount - 3; firstCut++) {
  for (let secondCut = firstCut + 1; secondCut <= columnCount - 2; secondCut++) {
    const area1 = computeTightBoundingArea(0, rowCount - 1, 0, firstCut);
    const area2 = computeTightBoundingArea(0, rowCount - 1, firstCut + 1, secondCut);
    const area3 = computeTightBoundingArea(0, rowCount - 1, secondCut + 1, columnCount - 1);
    if (area1 !== -1 && area2 !== -1 && area3 !== -1) {
      minimumAnswer = Math.min(minimumAnswer, area1 + area2 + area3);
    }
  }
}

// 三個水平條帶
for (let firstCut = 0; firstCut <= rowCount - 3; firstCut++) {
  for (let secondCut = firstCut + 1; secondCut <= rowCount - 2; secondCut++) {
    const area1 = computeTightBoundingArea(0, firstCut, 0, columnCount - 1);
    const area2 = computeTightBoundingArea(firstCut + 1, secondCut, 0, columnCount - 1);
    const area3 = computeTightBoundingArea(secondCut + 1, rowCount - 1, 0, columnCount - 1);
    if (area1 !== -1 && area2 !== -1 && area3 !== -1) {
      minimumAnswer = Math.min(minimumAnswer, area1 + area2 + area3);
    }
  }
}

// 一塊 + 兩塊（垂直切割）
for (let cutColumn = 0; cutColumn < columnCount - 1; cutColumn++) {
  const leftArea = computeTightBoundingArea(0, rowCount - 1, 0, cutColumn);
  const rightArea = computeTightBoundingArea(0, rowCount - 1, cutColumn + 1, columnCount - 1);

  if (leftArea !== -1) {
    const bestRight = computeBestTwoRectangles(0, rowCount - 1, cutColumn + 1, columnCount - 1);
    if (bestRight < Number.POSITIVE_INFINITY) {
      minimumAnswer = Math.min(minimumAnswer, leftArea + bestRight);
    }
  }
  if (rightArea !== -1) {
    const bestLeft = computeBestTwoRectangles(0, rowCount - 1, 0, cutColumn);
    if (bestLeft < Number.POSITIVE_INFINITY) {
      minimumAnswer = Math.min(minimumAnswer, rightArea + bestLeft);
    }
  }
}

// 一塊 + 兩塊（水平切割）
for (let cutRow = 0; cutRow < rowCount - 1; cutRow++) {
  const topArea = computeTightBoundingArea(0, cutRow, 0, columnCount - 1);
  const bottomArea = computeTightBoundingArea(cutRow + 1, rowCount - 1, 0, columnCount - 1);

  if (topArea !== -1) {
    const bestBottom = computeBestTwoRectangles(cutRow + 1, rowCount - 1, 0, columnCount - 1);
    if (bestBottom < Number.POSITIVE_INFINITY) {
      minimumAnswer = Math.min(minimumAnswer, topArea + bestBottom);
    }
  }
  if (bottomArea !== -1) {
    const bestTop = computeBestTwoRectangles(0, cutRow, 0, columnCount - 1);
    if (bestTop < Number.POSITIVE_INFINITY) {
      minimumAnswer = Math.min(minimumAnswer, bottomArea + bestTop);
    }
  }
}
```

### Step 12：快取與回傳

將結果存入全域快取並回傳。

```typescript
// 寫入快取並回傳最小答案
minimumSumResultCache.set(cacheKey, minimumAnswer);
return minimumAnswer;
```

## 時間複雜度

- 前綴和建構：$O(n \times m)$。
- 三矩形枚舉：最多 $O(n^2 + m^2)$ 種切割，每次查詢 $O(1)$。
- 總時間複雜度：$O(n \times m + n^2 + m^2)$。

> $O(n \times m + n^2 + m^2)$

## 空間複雜度

- 前綴和儲存：$O(n \times m)$。
- 快取 Map：最多 $O(n^2 m^2)$ 區域，但實際遠小於此。
- 總空間複雜度：$O(n \times m)$。

> $O(n \times m)$
