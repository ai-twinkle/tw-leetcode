# 498. Diagonal Traverse

Given an `m x n` matrix mat, return an array of all the elements of the array in a diagonal order.

**Constraints:**

- `m == mat.length`
- `n == mat[i].length`
- `1 <= m, n <= 10^4`
- `1 <= m * n <= 10^4`
- `-10^5 <= mat[i][j] <= 10^5`

## 基礎思路

題目要求將一個 $m \times n$ 的矩陣，按照「對角線順序」輸出成一維陣列。
「對角線順序」定義為依照 `(row + column)` 的和劃分對角線：

* 若對角線編號為偶數，則自右上往左下輸出（row 遞減，往上走）。
* 若對角線編號為奇數，則自左下往右上輸出（row 遞增，往下走）。

因此，我們可以透過以下步驟來實現：

1. 計算矩陣大小與總元素數量，建立結果陣列。
2. 總共有 `rows + cols - 1` 條對角線，逐一處理。
3. 每條對角線計算可行的 row 範圍，透過 `column = diagonalSum - row` 得出對應 column。
4. 根據對角線的奇偶性決定遍歷方向，將元素寫入結果陣列。

## 解題步驟

### Step 1：初始化與結果陣列

這裡 `totalRows` 與 `totalColumns` 表示矩陣大小，`totalElements` 計算總元素數量。
建立 `result` 用來儲存答案，並以 `writeIndex` 追蹤當前寫入位置。

```typescript
const totalRows = mat.length;
const totalColumns = mat[0].length;
const totalElements = totalRows * totalColumns;

const result = new Array(totalElements);
let writeIndex = 0;
```

### Step 2：計算總對角線數量

對角線數量公式為 $rows + cols - 1$。

```typescript
const totalDiagonals = totalRows + totalColumns - 1;
```

### Step 3：遍歷每一條對角線並收集元素

- `rowStart` 與 `rowEnd` 限定 row 的合法範圍，避免超出矩陣邊界。
- `column` 由公式 `diagonalSum - row` 計算。
- 偶數對角線往上遍歷（row 遞減），奇數對角線往下遍歷（row 遞增）。
- 每次將對應的元素寫入 `result`。

```typescript
for (let diagonalSum = 0; diagonalSum < totalDiagonals; diagonalSum++) {
  // 計算當前對角線的 row 範圍
  const rowStart = Math.max(0, diagonalSum - (totalColumns - 1));
  const rowEnd = Math.min(totalRows - 1, diagonalSum);

  if ((diagonalSum & 1) === 0) {
    // 偶數對角線：往上走 (row 遞減)
    for (let row = rowEnd; row >= rowStart; row--) {
      const column = diagonalSum - row;
      result[writeIndex++] = mat[row][column];
    }
  } else {
    // 奇數對角線：往下走 (row 遞增)
    for (let row = rowStart; row <= rowEnd; row++) {
      const column = diagonalSum - row;
      result[writeIndex++] = mat[row][column];
    }
  }
}
```

### Step 4：返回結果

當所有對角線遍歷完成，回傳完整的結果陣列。

```typescript
return result;
```

## 時間複雜度

- 每個元素只會被訪問一次，總共有 $m \times n$ 個元素。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 結果陣列需要 $O(m \times n)$ 的空間。
- 其他輔助變數為常數空間。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
