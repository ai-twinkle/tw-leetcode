# 73. Set Matrix Zeroes

Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`'s.

You must do it [in place](https://en.wikipedia.org/wiki/In-place_algorithm).

Constraints:

- `m == matrix.length`
- `n == matrix[0].length`
- `1 <= m, n <= 200`
- `-2^31 <= matrix[i][j] <= 2^31 - 1`

## 基礎思路

本題要求對一個給定的 $m \times n$ 整數矩陣進行就地（in-place）修改，規則是只要矩陣中的某個元素為 `0`，則該元素所處的整個行與整個列均須設置為 `0`。

為了解決此問題，我們需要避免在遍歷矩陣時直接修改，因為這會影響後續判斷。因此，我們使用以下兩階段策略：

1. **標記階段**：

   - 先遍歷整個矩陣，找出所有值為 `0` 的元素，並使用額外的輔助結構來快速標記其所屬的行與列需設為 `0`。
2. **更新階段**：

   - 再次遍歷矩陣，依據標記的行與列進行清零操作。

如此可確保原始的零值位置不會影響到後續的標記操作，並有效地實現就地修改的需求。

## 解題步驟

### Step 1：初始化與輔助結構

首先獲取矩陣的行數 (`rowCount`) 與列數 (`columnCount`)，並確認矩陣非空，避免處理空矩陣的情況。此外，我們將使用兩個 `Uint8Array` 輔助標記哪些行與列必須設置為零：

```typescript
const rowCount = matrix.length;
const columnCount = matrix[0].length;

if (rowCount === 0) {
  return;
}

// 使用 Uint8Array 快速標記需清零的行和列
const rowZeroMarks = new Uint8Array(rowCount);
const columnZeroMarks = new Uint8Array(columnCount);
```

### Step 2：標記包含 `0` 的行列

遍歷整個矩陣，若發現某個元素為 `0`，則記錄該元素所在的行與列到輔助陣列：

```typescript
// 第一次掃描，標記包含 0 的行與列
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const currentRow = matrix[rowIndex];

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    if (currentRow[columnIndex] === 0) {
      rowZeroMarks[rowIndex] = 1;
      columnZeroMarks[columnIndex] = 1;
    }
  }
}
```

### Step 3：依標記更新矩陣元素

根據輔助陣列中記錄的標記，進行第二次矩陣遍歷，將所有標記所在的行和列元素設置為零：

```typescript
// 第二次掃描，根據標記清零元素
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const currentRow = matrix[rowIndex];
  const isRowMarked = rowZeroMarks[rowIndex] === 1;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    if (isRowMarked || columnZeroMarks[columnIndex] === 1) {
      currentRow[columnIndex] = 0;
    }
  }
}
```

## 時間複雜度

* 我們對矩陣進行兩次完整遍歷，每次遍歷中每個元素都僅執行常數時間的操作，因此時間複雜度為 $O(m \times n)$。
* 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

* 我們額外使用了兩個輔助陣列，長度分別為 $m$ 與 $n$，因此額外空間為 $O(m + n)$。
* 總空間複雜度為 $O(m + n)$。

> $O(m + n)$
