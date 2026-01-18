# 1895. Largest Magic Square

A `k x k` magic square is a `k x k` grid filled with integers such that every row sum, every column sum, 
and both diagonal sums are all equal. The integers in the magic square do not have to be distinct. 
Every `1 x 1` grid is trivially a magic square.

Given an `m x n` integer `grid`, return the size (i.e., the side length `k`) of the largest magic square 
that can be found within this grid.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 50`
- `1 <= grid[i][j] <= 10^6`

## 基礎思路

本題要在一個 `m x n` 的整數網格中，找出「最大的魔方陣」邊長 `k`。魔方陣的定義是：在該 `k x k` 子矩陣內，**每一列和、每一行和、兩條對角線和**都必須相等（數字可重複，`1 x 1` 一定成立）。

直接對每個候選子矩陣逐行逐列加總會非常昂貴，因為需要大量重複計算區段和。要有效率地檢查任意子矩陣是否為魔方陣，關鍵在於：

* **快速取得任意連續區段的列和與行和**：讓我們能在常數時間內得到子矩陣某一列（或某一行）的區段總和。
* **快速取得兩條對角線的總和**：同樣希望能在常數時間內得到主對角線與副對角線的總和，做為快速剪枝。
* **由大到小嘗試邊長**：一旦找到某個邊長的魔方陣，就可以立即回傳，因為更大的已經被先嘗試過。

因此整體策略是：先做一次性的前處理，建立可快速查詢的累積和資訊；接著從最大可能邊長開始枚舉所有位置，先用兩條對角線做快速否決，再檢查所有列與行是否都符合基準總和，以確認是否為魔方陣。

## 解題步驟

### Step 1：初始化尺寸與處理最小情況

先取得列數與行數；若任一維度為 1，最大魔方陣只能是 `1 x 1`，直接回傳 1。並準備後續前處理會用到的步幅常數。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 任何單一格子必然是魔方陣
if (rowCount === 1 || columnCount === 1) {
  return 1;
}

const rowStride = columnCount + 1;
const diagonalStride = columnCount + 1;
```

### Step 2：建立每一列的前綴和（支援水平區段 O(1) 查詢）

為每一列建立前綴和，讓任意一列在 `[L, R)` 的區段總和能以常數時間取出。

```typescript
// 列前綴和：支援 O(1) 的水平區段查詢
const rowPrefix = new Int32Array(rowCount * rowStride);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = grid[rowIndex];
  const base = rowIndex * rowStride;
  let sum = 0;
  rowPrefix[base] = 0;
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    sum += row[columnIndex] | 0;
    rowPrefix[base + columnIndex + 1] = sum;
  }
}
```

### Step 3：建立每一行的前綴和（支援垂直區段 O(1) 查詢）

建立垂直方向的前綴和，使任意一行在 `[Top, Bottom)` 的區段總和能常數時間取出。

```typescript
// 行前綴和：支援 O(1) 的垂直區段查詢
const colPrefix = new Int32Array((rowCount + 1) * columnCount);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = grid[rowIndex];
  const topBase = rowIndex * columnCount;
  const bottomBase = (rowIndex + 1) * columnCount;
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    colPrefix[bottomBase + columnIndex] =
      colPrefix[topBase + columnIndex] + (row[columnIndex] | 0);
  }
}
```

### Step 4：建立主對角線（左上到右下）前綴和（支援 O(1) 查詢）

讓任意 `k x k` 子矩陣的主對角線總和可透過差分常數取得。

```typescript
// 右下方向對角線前綴和：支援 O(1) 的主對角線查詢
const diagDownRight = new Int32Array((rowCount + 1) * diagonalStride);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = grid[rowIndex];
  const prevBase = rowIndex * diagonalStride;
  const nextBase = (rowIndex + 1) * diagonalStride;
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    diagDownRight[nextBase + columnIndex + 1] =
      diagDownRight[prevBase + columnIndex] + (row[columnIndex] | 0);
  }
}
```

### Step 5：建立副對角線（右上到左下）前綴和（支援 O(1) 查詢）

同理建立另一方向的對角線前綴和，使副對角線也能常數取得。

```typescript
// 左下方向對角線前綴和：支援 O(1) 的副對角線查詢
const diagDownLeft = new Int32Array((rowCount + 1) * diagonalStride);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = grid[rowIndex];
  const prevBase = rowIndex * diagonalStride;
  const nextBase = (rowIndex + 1) * diagonalStride;
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    diagDownLeft[nextBase + columnIndex] =
      diagDownLeft[prevBase + columnIndex + 1] + (row[columnIndex] | 0);
  }
}
```

### Step 6：由大到小枚舉邊長，準備掃描所有可能位置

先決定最大可能邊長 `min(m, n)`，並從最大邊長往下嘗試；每個邊長再掃描所有左上角位置。

```typescript
const maximumEdgeLength = Math.min(rowCount, columnCount);

// 先嘗試較大的正方形，找到第一個合法的就可提早回傳
for (let edgeLength = maximumEdgeLength; edgeLength >= 2; edgeLength--) {
  const lastTopRowIndex = rowCount - edgeLength;
  const lastLeftColumnIndex = columnCount - edgeLength;

  for (let topRowIndex = 0; topRowIndex <= lastTopRowIndex; topRowIndex++) {
    const topRowBase = topRowIndex * rowStride;
    const topColBase = topRowIndex * columnCount;
    const bottomColBase = (topRowIndex + edgeLength) * columnCount;

    const topDiagBase = topRowIndex * diagonalStride;
    const bottomDiagBase = (topRowIndex + edgeLength) * diagonalStride;

    for (let leftColumnIndex = 0; leftColumnIndex <= lastLeftColumnIndex; leftColumnIndex++) {
      const rightExclusive = leftColumnIndex + edgeLength;

      // ...
    }
  }
}
```

### Step 7：以第一列為基準和，並先用兩條對角線快速否決

在固定的左上角與邊長下，先取得基準總和（第一列區段和），再用兩條對角線的總和做快速剪枝，不符合就直接跳過，避免後續逐列逐行檢查。

```typescript
for (let edgeLength = maximumEdgeLength; edgeLength >= 2; edgeLength--) {
  // Step 6：由大到小枚舉邊長並掃描位置

  for (let topRowIndex = 0; topRowIndex <= lastTopRowIndex; topRowIndex++) {
    for (let leftColumnIndex = 0; leftColumnIndex <= lastLeftColumnIndex; leftColumnIndex++) {
      const rightExclusive = leftColumnIndex + edgeLength;

      // 以第一列作為基準和
      const standardSum =
        rowPrefix[topRowBase + rightExclusive] - rowPrefix[topRowBase + leftColumnIndex];

      // 先用兩條對角線快速否決
      const diagonalSum1 =
        diagDownRight[bottomDiagBase + rightExclusive] -
        diagDownRight[topDiagBase + leftColumnIndex];
      if (diagonalSum1 !== standardSum) {
        continue;
      }

      const diagonalSum2 =
        diagDownLeft[bottomDiagBase + leftColumnIndex] -
        diagDownLeft[topDiagBase + rightExclusive];
      if (diagonalSum2 !== standardSum) {
        continue;
      }

      let isMagic = true;

      // ...
    }
  }
}
```

### Step 8：檢查子矩陣內所有列和是否都等於基準和

若對角線通過，接著檢查從第二列開始到最後一列的區段和是否一致；只要有一列不符即可否決。

```typescript
for (let edgeLength = maximumEdgeLength; edgeLength >= 2; edgeLength--) {
  // Step 6：由大到小枚舉邊長並掃描位置

  for (let topRowIndex = 0; topRowIndex <= lastTopRowIndex; topRowIndex++) {
    for (let leftColumnIndex = 0; leftColumnIndex <= lastLeftColumnIndex; leftColumnIndex++) {
      // Step 7：基準和與對角線快速否決

      // 驗證子矩陣內所有列和
      for (let rowOffset = 1; rowOffset < edgeLength; rowOffset++) {
        const rowBase = (topRowIndex + rowOffset) * rowStride;
        const rowSum =
          rowPrefix[rowBase + rightExclusive] - rowPrefix[rowBase + leftColumnIndex];
        if (rowSum !== standardSum) {
          isMagic = false;
          break;
        }
      }
      if (!isMagic) {
        continue;
      }

      // ...
    }
  }
}
```

### Step 9：檢查子矩陣內所有行和是否都等於基準和，若成立立即回傳

最後檢查每一行的區段和；全部通過則此正方形為魔方陣。因為邊長由大到小嘗試，第一個找到的一定是最大，直接回傳。

```typescript
for (let edgeLength = maximumEdgeLength; edgeLength >= 2; edgeLength--) {
  // Step 6：由大到小枚舉邊長並掃描位置

  for (let topRowIndex = 0; topRowIndex <= lastTopRowIndex; topRowIndex++) {
    for (let leftColumnIndex = 0; leftColumnIndex <= lastLeftColumnIndex; leftColumnIndex++) {
      // Step 7：基準和與對角線快速否決

      // Step 8：驗證子矩陣內所有列和

      // 驗證子矩陣內所有行和
      for (let columnOffset = 0; columnOffset < edgeLength; columnOffset++) {
        const columnIndex = leftColumnIndex + columnOffset;
        const colSum =
          colPrefix[bottomColBase + columnIndex] - colPrefix[topColBase + columnIndex];
        if (colSum !== standardSum) {
          isMagic = false;
          break;
        }
      }

      // 第一個成功即為最大邊長
      if (isMagic) {
        return edgeLength;
      }
    }
  }
}
```

### Step 10：若沒有任何邊長 ≥ 2 的魔方陣，答案為 1

若所有候選都失敗，代表不存在更大的魔方陣，回傳 1（任一單格）。

```typescript
return 1;
```

## 時間複雜度

- 前處理四個前綴表（列、行、兩種對角線）各掃描整個網格一次，時間為 $O(m \times n)$。
- 枚舉邊長 $e$ 從 $k=\min(m,n)$ 下降到 $2$；對每個 $e$，需檢查所有左上角位置 $(m-e+1)(n-e+1)$。
- 對固定的 $(e,\text{位置})$：兩條對角線檢查為 $O(1)$；列和驗證最壞需檢查 $e-1$ 列、行和驗證最壞需檢查 $e$ 行，因此單次檢查最壞為 $O(e)$。
- 因此總檢查成本為

  $$
  \sum_{e=2}^{k} (m-e+1)(n-e+1)\cdot O(e)
  $$

  由於對所有 $e$ 有 $(m-e+1)(n-e+1)\le m \times n$，可得嚴格上界

  $$
  \sum_{e=2}^{k} (m-e+1)(n-e+1)\cdot e \le (m \times n)\sum_{e=2}^{k} e = (m \times n)\cdot\frac{k(k+1)-2}{2}
  $$

  故最壞時間為 $O(m \times n \times k^2)$。
- 總時間複雜度為 $O(m \times n \times \min(m,n)^2)$。

> $O(m \times n \times \min(m,n)^2)$

## 空間複雜度

- 列前綴表大小為 $m(n+1)$，行前綴表大小為 $(m+1)n$，兩個對角線前綴表各為 $(m+1)(n+1)$，皆為 $O(m \times n)$。
- 其餘變數為常數級額外空間。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
