# 36. Valid Sudoku

Determine if a `9 x 9` Sudoku board is valid. 
Only the filled cells need to be validated according to the following rules:

1. Each row must contain the digits `1-9` without repetition.
2. Each column must contain the digits `1-9` without repetition.
3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.

Note:

- A Sudoku board (partially filled) could be valid but is not necessarily solvable.
- Only the filled cells need to be validated according to the mentioned rules.

**Constraints:**

- `board.length == 9`
- `board[i].length == 9`
- `board[i][j]` is a digit `1-9` or `'.'`.

## 基礎思路

題目要求判斷一個部分填寫的 `9 x 9` 數獨盤是否**有效**。
有效的定義是：

1. 每一列數字 `1-9` 不可重複。
2. 每一行數字 `1-9` 不可重複。
3. 每一個 `3 x 3` 子盒數字 `1-9` 不可重複。

因為盤面大小固定 (`9 x 9`)，所以我們希望使用一種**高效檢查方法**。傳統做法是用集合（Set）去記錄已出現的數字，但這會有額外空間與建立開銷。

更佳方法是使用**位元遮罩（bitmask）**：

- 把每個數字 `1..9` 對應到一個位元位置。
- 當數字出現時，將對應位元設為 `1`。
- 若該位元已存在（`&` 檢查非零），代表有重複，直接判斷為無效。

透過三個遮罩陣列，分別追蹤每列、每行、每個子盒的使用情況，就能在一次掃描內完成檢查。

## 解題步驟

### Step 1：建立三組遮罩結構

我們需要分別追蹤列、行、與子盒，因此建立三個長度為 9 的位元遮罩陣列。
這些陣列的每個元素是一個 `16` 位元整數，其中第 `digit-1` 位用來表示數字是否已出現。

```typescript
// 位元遮罩陣列：分別追蹤列、行、與 3x3 子盒
const rowMasks = new Uint16Array(9);
const columnMasks = new Uint16Array(9);
const boxMasks = new Uint16Array(9);
```

### Step 2：逐格掃描棋盤

我們用雙層迴圈依序掃描每個格子，跳過空格 `'.'`。
對於非空格的數字：

1. 轉換成數字 `digit`，並計算出對應的位元 `bit`。
2. 根據列與行位置，計算所屬子盒的索引 `boxIndex`。
3. 檢查該列、該行、該子盒是否已經有這個數字。若有重複，直接回傳 `false`。
4. 否則，將該數字標記進三個遮罩中。

```typescript
for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
  const row = board[rowIndex];
  for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
    const cell = row[columnIndex];

    // 若是空格，略過
    if (cell === '.') {
      continue;
    }

    // 計算數字與對應位元
    const digit = cell.charCodeAt(0) - 48;
    const bit = 1 << (digit - 1);

    // 計算所在的子盒索引
    const boxIndex = ((rowIndex / 3) | 0) * 3 + ((columnIndex / 3) | 0);

    // 檢查是否重複出現
    if ((rowMasks[rowIndex] & bit) !== 0) {
      return false;
    }
    if ((columnMasks[columnIndex] & bit) !== 0) {
      return false;
    }
    if ((boxMasks[boxIndex] & bit) !== 0) {
      return false;
    }

    // 若沒有重複，更新三個遮罩
    rowMasks[rowIndex] |= bit;
    columnMasks[columnIndex] |= bit;
    boxMasks[boxIndex] |= bit;
  }
}
```

### Step 3：回傳結果

若整個掃描過程中沒有發現重複數字，則棋盤為有效，回傳 `true`。

```typescript
// 所有檢查皆通過，數獨有效
return true;
```

## 時間複雜度

- 掃描 `9 × 9 = 81` 個格子，每格操作為常數時間。
- 總時間複雜度為 $O(1)$（固定大小，視為常數）。

> $O(1)$

## 空間複雜度

- 僅使用三個固定長度為 9 的遮罩陣列，不隨輸入變化。
- 總空間複雜度為 $O(1)$。

> $O(1)$
