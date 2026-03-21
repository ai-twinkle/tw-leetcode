# 3643. Flip Square Submatrix Vertically

You are given an `m x n` integer matrix `grid`, and three integers `x`, `y`, and `k`.

The integers `x` and `y` represent the row and column indices of the top-left corner of a square submatrix and 
the integer `k` represents the size (side length) of the square submatrix.

Your task is to flip the submatrix by reversing the order of its rows vertically.

Return the updated matrix.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 50`
- `1 <= grid[i][j] <= 100`
- `0 <= x < m`
- `0 <= y < n`
- `1 <= k <= min(m - x, n - y)`

## 基礎思路

本題要求對一個矩陣中指定的正方形子矩陣進行垂直翻轉，即將子矩陣的列順序上下對調，其餘區域保持不變。

在思考解法時，可掌握以下核心觀察：

- **垂直翻轉本質為列對換**：
  對子矩陣做垂直翻轉，等價於將第一列與最後一列對換、第二列與倒數第二列對換，依此類推，直到兩個指標相遇。

- **只需操作子矩陣範圍內的欄位**：
  每一列並非整列互換，而是僅交換落在子矩陣欄範圍內的元素，子矩陣以外的欄位一律不動。

- **雙指標對稱收斂是最直觀的實作方式**：
  使用上下兩個列指標分別從子矩陣頂端與底端向中間推進，每輪交換對應欄位後同時向內移動，直到兩指標交叉為止。

依據以上特性，可以採用以下策略：

- **初始化上下列指標至子矩陣的第一列與最後一列**，以雙指標方式控制迴圈推進。
- **每輪僅交換子矩陣欄範圍內的元素**，確保矩陣其他位置不受影響。
- **指標收斂後即完成翻轉**，直接回傳修改後的矩陣。

此策略僅需線性掃描子矩陣的一半列數，每列進行固定次數的元素交換，整體邏輯清晰且高效。

## 解題步驟

### Step 1：初始化子矩陣的上下列指標與欄邊界

設定上列指標從子矩陣的第一列開始，下列指標從子矩陣的最後一列開始，並預先計算子矩陣的最右欄索引，供後續每輪交換使用。

```typescript
let topRowIndex = x;
let bottomRowIndex = x + k - 1;

// 子矩陣範圍內的最後一欄索引
const endColumnIndex = y + k - 1;
```

### Step 2：以雙指標向內收斂，逐列交換子矩陣欄位內的元素

當上列指標仍在下列指標上方時，取出對應的兩列，並逐欄交換子矩陣範圍內的元素；每輪結束後將兩指標向內推進一步。

```typescript
// 上下列指標向內收斂，逐對交換列內元素
while (topRowIndex < bottomRowIndex) {
  const topRow = grid[topRowIndex];
  const bottomRow = grid[bottomRowIndex];

  // 僅交換落在子矩陣範圍內的欄位，保留列中其餘元素不變
  for (let columnIndex = y; columnIndex <= endColumnIndex; columnIndex++) {
    const temporary = topRow[columnIndex];
    topRow[columnIndex] = bottomRow[columnIndex];
    bottomRow[columnIndex] = temporary;
  }

  topRowIndex++;
  bottomRowIndex--;
}
```

### Step 3：回傳修改後的矩陣

所有列對均已完成交換，直接回傳原矩陣（已就地修改）。

```typescript
return grid;
```

## 時間複雜度

- 雙指標各自推進至多 $k / 2$ 次，每次交換子矩陣內 $k$ 個元素；
- 總交換次數為 $O(k^2)$。
- 總時間複雜度為 $O(k^2)$。

> $O(k^2)$

## 空間複雜度

- 僅使用固定數量的指標與暫存變數；
- 交換為就地進行，不需額外陣列。
- 總空間複雜度為 $O(1)$。

> $O(1)$
