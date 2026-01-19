# 1292. Maximum Side Length of a Square with Sum Less than or Equal to Threshold

Given a `m x n` matrix `mat` and an integer `threshold`, 
return the maximum side-length of a square with a sum less than or equal to `threshold` or return `0` 
if there is no such square.

**Constraints:**

- `m == mat.length`
- `n == mat[i].length`
- `1 <= m, n <= 300`
- `0 <= mat[i][j] <= 10^4`
- `0 <= threshold <= 10^5`

## 基礎思路

本題要在 `m x n` 矩陣中找出一個邊長最大的正方形，使其元素總和 `<= threshold`，若不存在則回傳 0。

在思考解法時，需要注意：

* **正方形總和查詢需要很快**：若對每個正方形都逐格加總，會造成巨大時間成本（邊長越大越慢）。
* **正方形邊長具有單調性**：若存在某個邊長 `L` 的合法正方形（總和 `<= threshold`），那麼邊長更小的正方形也必然有機會合法；反之若邊長 `L` 完全不存在合法正方形，則更大的邊長也不可能合法。這讓我們能用**二分搜尋**找最大可行邊長。
* **用前綴和加速區域總和**：透過 2D 前綴和，可以把任意矩形（包含正方形）的總和查詢降為常數時間，讓「檢查某個邊長是否存在合法正方形」能夠在掃描所有起點時依然維持可接受的成本。

綜合以上觀察，我們採用：

* 先建 2D 前綴和，使任意正方形總和可 O(1) 取得；
* 對邊長在 `[0, min(m, n)]` 進行二分；
* 對每個候選邊長，掃描所有可能正方形位置，只要找到一個總和 `<= threshold` 即視為可行。

## 解題步驟

### Step 1：初始化尺寸與前綴和容器

先取得矩陣尺寸，並建立 `(m+1) x (n+1)` 的一維壓平前綴和陣列，方便後續做常數時間的矩形總和查詢。

```typescript
const rowCount = mat.length;
const columnCount = mat[0].length;

const prefixWidth = columnCount + 1;
const prefixHeight = rowCount + 1;
const prefix = new Int32Array(prefixWidth * prefixHeight);
```

### Step 2：建立 2D 前綴和

用逐列累加的方式建立前綴和，使得之後任意矩形（包含正方形）總和都能以固定公式 O(1) 取得。

```typescript
// 建立壓平的 2D 前綴和，讓矩形查詢可在 O(1) 完成，且更符合快取存取
for (let row = 1; row <= rowCount; row++) {
  const matRow = mat[row - 1];
  const prefixRowBase = row * prefixWidth;
  const prefixPrevRowBase = (row - 1) * prefixWidth;

  let rowRunningSum = 0;
  for (let col = 1; col <= columnCount; col++) {
    rowRunningSum += matRow[col - 1];
    prefix[prefixRowBase + col] = prefix[prefixPrevRowBase + col] + rowRunningSum;
  }
}
```

### Step 3：輔助函式 `hasValidSquare` — 檢查某邊長是否存在合法正方形

給定候選邊長 `sideLength`，掃描所有可能的左上角位置，利用前綴和在 O(1) 算出該正方形的總和；只要找到任一總和 `<= threshold` 即回傳 `true`。

```typescript
/**
 * 檢查是否存在任意邊長為 sideLength 的正方形，其總和 <= threshold。
 *
 * @param sideLength 候選正方形邊長
 * @returns 若存在合法正方形則回傳 true，否則回傳 false
 */
function hasValidSquare(sideLength: number): boolean {
  const maxRowStart = rowCount - sideLength;
  const maxColStart = columnCount - sideLength;

  const localPrefix = prefix;
  const localPrefixWidth = prefixWidth;

  for (let rowStart = 0; rowStart <= maxRowStart; rowStart++) {
    const topBase = rowStart * localPrefixWidth;
    const bottomBase = (rowStart + sideLength) * localPrefixWidth;

    // 同步滑動 (left,right)，避免每次迴圈重算 colStart + sideLength
    let left = 0;
    let right = sideLength;

    for (let colStart = 0; colStart <= maxColStart; colStart++) {
      const sum = localPrefix[bottomBase + right] - localPrefix[topBase + right] -
        localPrefix[bottomBase + left] + localPrefix[topBase + left];

      if (sum <= threshold) {
        return true;
      }

      left++;
      right++;
    }
  }

  return false;
}
```

### Step 4：二分搜尋最大可行邊長

邊長的搜尋範圍為 `[0, min(m, n)]`。透過二分，每次用 `hasValidSquare(middle)` 判斷可行性，並往更大或更小邊長收斂。

```typescript
let low = 0;
let high = rowCount < columnCount ? rowCount : columnCount;

// 二分搜尋最大可行邊長
while (low < high) {
  const middle = (low + high + 1) >> 1;

  if (hasValidSquare(middle)) {
    low = middle;
  } else {
    high = middle - 1;
  }
}
```

### Step 5：回傳答案

二分結束時，`low` 即為最大可行邊長。

```typescript
return low;
```

## 時間複雜度

* 建立 2D 前綴和需要掃過整個矩陣一次，為 $O(mn)$。

- `hasValidSquare(L)` 會枚舉所有正方形左上角位置，數量為 $(m - L + 1)(n - L + 1)$，每個位置用前綴和做 $O(1)$ 查詢，因此為 $O((m - L + 1)(n - L + 1))$。
- 二分搜尋的邊長範圍大小為 $k + 1$，其中 $k = \min(m, n)$，迴圈次數為 $\lceil \log_2(k + 1) \rceil$。
- 最壞情況下，每次二分檢查的成本都被上界 $m \times n$ 所涵蓋，因此總檢查成本為 $O(m \times n \times \lceil \log_2(k + 1) \rceil)$。
- 總時間複雜度為 $O(m \times n \times \lceil \log_2(\min(m, n) + 1) \rceil)$。

> $O(m \times n \times \lceil \log_2(\min(m, n) + 1) \rceil)$

## 空間複雜度

- 前綴和陣列大小為 $(m + 1)(n + 1)$，因此空間為 $O(m \times n)$。
- 其餘變數為常數級。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$

