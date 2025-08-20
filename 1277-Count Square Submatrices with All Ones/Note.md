# 1277. Count Square Submatrices with All Ones

Given a `m * n` matrix of ones and zeros, return how many square submatrices have all ones.

**Constraints:**

- `1 <= arr.length <= 300`
- `1 <= arr[0].length <= 300`
- `0 <= arr[i][j] <= 1`

## 基礎思路

題目要求計算一個 $m \times n$ 的矩陣中，總共有多少個「完全由 $1$ 組成的正方形子矩陣」。

直覺上，我們可以枚舉所有可能的正方形，檢查是否全部為 $1$，但這樣時間複雜度過高。更高效的方法是透過 **動態規劃** 來解決。

我們定義一個狀態：

- `dp[i][j]` 表示「以 $(i, j)$ 為右下角」的最大正方形邊長。

狀態轉移：

- 若 `matrix[i][j] == 1`，則
  $dp[i][j] = 1 + \min(dp[i-1][j],\ dp[i][j-1],\ dp[i-1][j-1])$
- 若 `matrix[i][j] == 0`，則 $dp[i][j] = 0$。

每個 `dp[i][j]` 的值不僅代表最大邊長，也代表有多少個正方形以此為結尾（因為邊長為 $k$，意味著存在邊長 $1, 2, \dots, k$ 的正方形各一個）。因此將所有 `dp[i][j]` 累加即可得到總數。

為了節省空間，程式僅保留當前列與上一列（使用 `Uint16Array`，因最大邊長不超過 300），透過滾動陣列的方式完成計算。

## 解題步驟

### Step 1：輸入防護與矩陣大小

首先處理極端情況：若矩陣為空或第一列長度為 0，直接回傳 0。

```typescript
// 輸入為空的防護（雖然題目限制暗示不會發生）
const rowCount = matrix.length;
if (rowCount === 0) {
  return 0;
}
const columnCount = matrix[0].length;
if (columnCount === 0) {
  return 0;
}
```

### Step 2：初始化 DP 結構

使用兩個一維陣列 `previousRow` 與 `currentRow` 來存放 DP 狀態，並準備一個累加變數 `totalSquares`。

```typescript
// 動態規劃列：dp[j] 表示以 (i, j) 作為右下角的最大正方形邊長
// 使用 16 位元型別化陣列：最大可能值為 300
let previousRow = new Uint16Array(columnCount);
let currentRow = new Uint16Array(columnCount);
let totalSquares = 0;
```

### Step 3：逐列遍歷矩陣

對每一列進行處理，並準備一個變數 `upLeftOfPrevious` 來追蹤左上角的 DP 值，避免多餘查詢。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row: number[] = matrix[rowIndex];
  // 追蹤左上角 DP 值（previousRow[columnIndex-1]），避免多餘查詢
  let upLeftOfPrevious = 0;

  // ...
}
```

### Step 4：逐欄計算 DP 狀態

對於每個元素 `(i, j)`：

1. 取出當前 cell 值並正規化為 0/1。
2. 若為 0，則 `largestSquareSize = 0`。
3. 若為 1，則利用「上、左、左上」三個方向的 DP 值取最小值再加 1。
4. 將結果存入 `currentRow`，並加總到 `totalSquares`。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 3：逐列遍歷矩陣
  
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    // 正規化為 0/1，確保走整數快速路徑
    const cellValue = row[columnIndex] | 0;
    let largestSquareSize = 0;

    if (cellValue !== 0) {
      // 鄰居：
      // 上方 -> previousRow[columnIndex]
      // 左方 -> currentRow[columnIndex - 1]（若 columnIndex==0 則為 0）
      // 對角 -> upLeftOfPrevious（即 previousRow[columnIndex - 1]）
      const up = previousRow[columnIndex];
      let left = 0;
      if (columnIndex > 0) {
        left = currentRow[columnIndex - 1];
      }
      const diagonal = upLeftOfPrevious;

      // 取三者最小值
      let minNeighbor;
      if (up < left) {
        minNeighbor = up;
      } else {
        minNeighbor = left;
      }
      if (diagonal < minNeighbor) {
        minNeighbor = diagonal;
      }

      largestSquareSize = (minNeighbor + 1) | 0;
    }

    // 寫入 DP 陣列並累加答案
    currentRow[columnIndex] = largestSquareSize;
    totalSquares += largestSquareSize;

    // 更新對角追蹤值
    upLeftOfPrevious = previousRow[columnIndex];
  }
  
  // ...
}
```

### Step 5：滾動更新列緩衝

一列處理完成後，交換 `previousRow` 與 `currentRow`，避免重新初始化。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 3：逐列遍歷矩陣
  
  // Step 4：逐欄計算 DP 狀態
  
  // 交換滾動列，避免多餘拷貝
  const tempRow = previousRow;
  previousRow = currentRow;
  currentRow = tempRow;
}
```

### Step 6：回傳答案

最終回傳 `totalSquares`，即為所有正方形子矩陣的數量。

```typescript
return totalSquares;
```

## 時間複雜度

- **矩陣遍歷**：每個元素只被處理一次，計算步驟為常數操作，因此為 $O(m \times n)$。
- 總時間複雜度為 $O(m\times n)$。

> $O(m\times n)$

## 空間複雜度

- **DP 滾動列**：只需兩個長度為 $n$ 的陣列，空間為 $O(n)$。
- 其他輔助變數為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
