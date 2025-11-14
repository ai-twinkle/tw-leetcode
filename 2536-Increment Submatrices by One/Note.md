# 2536. Increment Submatrices by One

You are given a positive integer `n`, indicating that we initially have an `n x n` 0-indexed integer matrix `mat` filled with zeroes.

You are also given a 2D integer array `query`. 
For each `query[i] = [row1_i, col1_i, row2_i, col2_i]`, you should do the following operation:

- Add `1` to every element in the submatrix with the top left corner `(row1_i, col1_i)` and the bottom right corner `(row2_i, col2_i)`. 
  That is, add `1` to `mat[x][y]` for all `row1_i <= x <= row2_i` and `col1_i <= y <= col2_i`.

Return the matrix `mat` after performing every query.

**Constraints:**

- `1 <= n <= 500`
- `1 <= queries.length <= 10^4`
- `0 <= row1_i <= row2_i < n`
- `0 <= col1_i <= col2_i < n`

## 基礎思路

本題要求在一個 `n x n` 全為 0 的矩陣上執行多筆「子矩形 +1」操作。
若直接對每筆查詢逐格加 1，最壞情況可能需進行高達 $10^4 \times 500 \times 500 = 2.5 \times 10^9$ 次操作，速度完全不可接受。

在思考高效作法時，可發現：

- 每次更新影響的是 **完整子矩形區域**，而非單一格子；
- 多筆查詢彼此之間可疊加，最終只需得到全部操作完成後的矩陣，不需中間結果；
- 這種「大量區域加法 + 最後一次性輸出」的情境，正適合使用 **二維差分矩陣（2D Difference Array）**。

二維差分矩陣能以 **O(1)** 的方式處理一筆區域加法，
具體做法是：

- 對子矩形 `(r1, c1)` → `(r2, c2)`
  在差分表四個角落進行 `+1/-1` 標記，使得後續前綴和可自動還原正確區域加法。

為了避免邊界檢查，我們使用 `(n+1) x (n+1)` 差分表。
最終先對差分表做 **橫向前綴和**、再做 **縱向前綴和**，即可恢復所有區域加法的累積結果。

透過此方法，時間複雜度可壓到 $O(n^2 + q)$，能輕鬆通過題目限制。

## 解題步驟

### Step 1：建立差分矩陣

建立 `(n+1) x (n+1)` 的一維壓平差分矩陣，避免邊界檢查，同時計算查詢筆數。

```typescript
// 使用 (n + 1) x (n + 1) 的差分矩陣以避免邊界檢查
const diffDimension = n + 1;
const diffSize = diffDimension * diffDimension;
const diff = new Int32Array(diffSize);

const queriesLength = queries.length;
```

### Step 2：將每筆查詢轉為 2D 差分更新

對每筆查詢 `[row1, col1, row2, col2]`，
利用二維差分原理在四個位置進行 `+1/-1/+1/-1` 標記。

```typescript
// 對每筆查詢套用 2D 差分更新
for (let queryIndex = 0; queryIndex < queriesLength; queryIndex++) {
  const query = queries[queryIndex];
  const row1 = query[0];
  const column1 = query[1];
  const row2 = query[2];
  const column2 = query[3];

  const baseTop = row1 * diffDimension;
  const baseBottom = (row2 + 1) * diffDimension;

  // 在子矩形左上角做 +1（代表開始累加）
  diff[baseTop + column1] += 1;

  // 在下邊界下一列做 -1（抵銷縱向超出部分）
  diff[baseBottom + column1] -= 1;

  // 在右邊界右側做 -1（抵銷橫向超出部分）
  diff[baseTop + (column2 + 1)] -= 1;

  // 在右下角做 +1（抵銷前兩次 -1 的重疊效果）
  diff[baseBottom + (column2 + 1)] += 1;
}
```

### Step 3：進行水平前綴和（推展橫向影響）

對差分表每一列進行左到右累加，使同列上子矩形的效果向右推展。

```typescript
// 進行橫向前綴和以推展行內影響
for (let rowIndex = 0; rowIndex < diffDimension; rowIndex++) {
  const rowBaseIndex = rowIndex * diffDimension;
  let runningSum = 0;

  for (let columnIndex = 0; columnIndex < diffDimension; columnIndex++) {
    const currentIndex = rowBaseIndex + columnIndex;
    runningSum += diff[currentIndex];     // 累加左側影響
    diff[currentIndex] = runningSum;      // 儲存橫向前綴結果
  }
}
```

### Step 4：進行垂直前綴和（推展縱向影響）

再將每一欄自上而下累加，使完整區域加法的效果完全成形。

```typescript
// 進行縱向前綴和以推展欄內影響
for (let columnIndex = 0; columnIndex < diffDimension; columnIndex++) {
  let runningSum = 0;

  for (let rowIndex = 0; rowIndex < diffDimension; rowIndex++) {
    const currentIndex = rowIndex * diffDimension + columnIndex;
    runningSum += diff[currentIndex];     // 累加上方影響
    diff[currentIndex] = runningSum;      // 儲存縱向前綴結果
  }
}
```

### Step 5：擷取前 n x n 區域作為最終結果

差分表多出的額外列與行不屬於原矩陣，因此取左上 `n x n` 即為最後答案。

```typescript
// 從差分矩陣中擷取有效的 n x n 區域作為最終結果
const result: number[][] = new Array(n);

for (let rowIndex = 0; rowIndex < n; rowIndex++) {
  const rowBaseIndex = rowIndex * diffDimension;
  const resultRow: number[] = new Array(n);

  for (let columnIndex = 0; columnIndex < n; columnIndex++) {
    resultRow[columnIndex] = diff[rowBaseIndex + columnIndex]; // 複製產生的最終值
  }

  result[rowIndex] = resultRow;
}

return result;
```

## 時間複雜度

- 每筆查詢以 2D 差分更新：O(1)，共 `q` 筆 → O(q)
- 水平與垂直前綴和：各需 O(n²)
- 擷取結果矩陣：O(n²)
- 總時間複雜度為 $O(n^2 + q)$。

> $O(n^2 + q)$

## 空間複雜度

- 差分矩陣使用 `(n+1)²` 空間 → O(n²)
- 結果矩陣使用 n² 空間 → O(n²)
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
