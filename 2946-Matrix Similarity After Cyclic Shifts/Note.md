# 2946. Matrix Similarity After Cyclic Shifts

You are given an `m x n` integer matrix `mat` and an integer `k`. 
The matrix rows are 0-indexed.

The following proccess happens `k` times:

- Even-indexed rows (0, 2, 4, ...) are cyclically shifted to the left.

```
[1, 2, 3] -left shift-> [2, 3, 1]
```

- Odd-indexed rows (1, 3, 5, ...) are cyclically shifted to the right.

```
[1, 2, 3] -right shift-> [3, 1, 2]
```

Return `true` if the final modified matrix after `k` steps is identical to the original matrix, and `false` otherwise.

**Constraints:**

- `1 <= mat.length <= 25`
- `1 <= mat[i].length <= 25`
- `1 <= mat[i][j] <= 25`
- `1 <= k <= 50`

## 基礎思路

本題要求對矩陣的每一列執行循環位移 `k` 次後，判斷結果是否與原始矩陣相同。偶數列向左位移，奇數列向右位移，但無論方向為何，位移量相同，因此可以統一分析。

在思考解法時，可掌握以下核心觀察：

- **循環位移具有週期性**：
  對長度為 `n` 的列執行 `n` 次同方向位移，會回到原始狀態。因此實際有效的位移量僅需對 `n` 取餘數。

- **有效位移為零時必定相同**：
  若有效位移量為 0，所有列均未發生任何實質移動，結果必然與原始矩陣相同，可提前回傳。

- **位移後相同的充要條件**：
  一列位移 `s` 格後與原列相同，等價於對任意位置 `j`，元素 `j` 的值等於元素 `(j + s) % n` 的值。

- **不需驗證所有位置**：
  由循環的傳遞性，只需驗證前 `s` 個位置是否滿足上述條件，其餘位置可由此推導而得，無需逐一檢查。

依據以上特性，可以採用以下策略：

- **先計算有效位移量**，以排除多餘的完整週期。
- **對每一列僅檢查前 `s` 個位置**，確認其與位移後對應位置的值是否相等。
- **一旦發現不匹配即提前終止**，若所有列均通過檢查則回傳 `true`。

此策略使整體複雜度遠低於實際模擬位移的暴力解法。

## 解題步驟

### Step 1：計算有效位移量並處理無位移的特殊情況

循環位移 `k` 次後，實際等效的位移量為 `k % columnCount`。
若有效位移為 0，表示每一列都回到原始狀態，可直接回傳 `true`。

```typescript
const columnCount = mat[0].length;
const effectiveShift = k % columnCount;

// 位移量為零代表所有元素都沒有移動
if (effectiveShift === 0) {
  return true;
}
```

### Step 2：逐列檢查位移後是否與原列相同，並驗證前 effectiveShift 個位置

對每一列，只需驗證前 `effectiveShift` 個位置的元素，是否與其位移後對應位置的元素相等。
若任一位置不匹配，則矩陣不可能回到原始狀態，立即回傳 `false`。

```typescript
const rowCount = mat.length;

for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = mat[rowIndex];

  // 只需檢查 effectiveShift 個元素：
  // 若 row[j] === row[(j + effectiveShift) % n] 對 j ∈ [0, effectiveShift) 成立，
  // 其餘位置可由循環週期的傳遞性推導而得
  for (let columnIndex = 0; columnIndex < effectiveShift; columnIndex++) {
    if (row[columnIndex] !== row[(columnIndex + effectiveShift) % columnCount]) {
      return false;
    }
  }
}
```

### Step 3：所有列均通過檢查，回傳 true

若所有列都滿足位移條件，代表矩陣在 `k` 步後與原始矩陣完全相同。

```typescript
return true;
```

## 時間複雜度

- 設矩陣共有 $m$ 列、每列 $n$ 個元素，有效位移量 $s = k \bmod n$；
- 對每一列最多檢查 $s$ 個位置，最壞情況下 $s = n - 1$，故每列最多執行 $O(n)$ 次比較；
- 共有 $m$ 列需要處理。
- 總時間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$

## 空間複雜度

- 僅使用固定數量的輔助變數，未配置任何額外陣列；
- 原始矩陣未被複製或重新配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
