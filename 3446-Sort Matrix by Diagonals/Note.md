# 3446. Sort Matrix by Diagonals

You are given an `n x n` square matrix of integers `grid`. 
Return the matrix such that:

- The diagonals in the bottom-left triangle (including the middle diagonal) are sorted in non-increasing order.
- The diagonals in the top-right triangle are sorted in non-decreasing order.

**Constraints:**

- `grid.length == grid[i].length == n`
- `1 <= n <= 10`
- `-10^5 <= grid[i][j] <= 10^5`

## 基礎思路

題目要求把方陣按照「對角線」分成兩個區域各自排序：

- **左下三角（含主對角）**：每條對角線需 **非遞增**（大 -> 小）。
- **右上三角**：每條對角線需 **非遞減**（小 -> 大）。

直觀做法是把每一條對角線視為一個獨立的一維陣列來排序。
為了避免頻繁配置臨時陣列造成多餘開銷，程式使用一個可重用的 `Int32Array` 緩衝區來承載「當前對角線」的元素，並透過 `subarray` 取得長度視圖。

排序策略為：

- 左下三角：先 **升冪排序**，再 **反向寫回**，即可得到非遞增順序。
- 右上三角：直接 **升冪排序** 後 **原樣寫回**，即可得到非遞減順序。

這樣每條對角線互不干擾，總體只需 $O(n)$ 額外空間（緩衝區長度為 $n$），時間花在各條對角線的排序上。
使用 `Int32Array` 的 `sort()` 能保證 **數值**升冪（不同於一般 `Array` 的字串排序），也避免比較器開銷。

## 解題步驟

### Step 1：宣告全域緩衝區與容量保證工具

- 以全域 `Int32Array` 作為單一暫存區，避免每條對角線都重新配置新陣列。
- `ensureBufferCapacity` 會在需要時把緩衝區放大到至少 `n`，確保後續 `subarray` 取得的視圖有足夠容量。

```typescript
// 可重用的對角線擷取緩衝區
let diagonalBuffer = new Int32Array(0);

/**
 * 確保可重用的對角線緩衝區至少具有給定容量。
 * 若目前長度小於需求則擴充。
 *
 * @param n - 最小所需容量
 */
function ensureBufferCapacity(n: number): void {
  if (diagonalBuffer.length < n) {
    diagonalBuffer = new Int32Array(n);
  }
}
```

### Step 2：讀取尺寸並確保緩衝容量

- 讀取 `n` 為方陣邊長。
- 先把緩衝區容量確保到 `n`，之後每條對角線最多長度為 `n`，都能用同一塊緩衝。

```typescript
const n = grid.length;
ensureBufferCapacity(n);
```

### Step 3：處理左下三角（含主對角）— 目標非遞增

- **外層索引 `rowStart`** 鎖定每條「左下方向」對角線的起點（位於第 `rowStart` 列、第一欄）。
  - `diagonalLength = n - rowStart`：越往下起點，對角線越短。
  - 以 `subarray(0, diagonalLength)` 取得長度視圖 `view`，不配置新記憶體。
- 內層第一次 `for`：把該對角線元素以座標 `(rowStart + needle, needle)` 逐一複製到 `view`。
  - `view.sort()`：就地升冪排序（`Int32Array` 預設為數值排序）。
- 內層第二次 `for`：以「反向索引」寫回，即可把升冪結果轉為**非遞增**放回 `grid` 原對角線位置。

```typescript
// 處理左下三角（包含主對角線）
for (let rowStart = 0; rowStart < n; rowStart++) {
  const diagonalLength = n - rowStart;
  const view = diagonalBuffer.subarray(0, diagonalLength);

  // 將對角線元素複製到緩衝區
  for (let needle = 0; needle < diagonalLength; needle++) {
    view[needle] = grid[rowStart + needle][needle];
  }

  // 將緩衝區按升冪排序
  view.sort();

  // 反向寫回以得到非遞增順序
  for (let needle = 0; needle < diagonalLength; needle++) {
    grid[rowStart + needle][needle] = view[diagonalLength - 1 - needle];
  }
}
```

### Step 4：處理右上三角（不含主對角）— 目標非遞減

- **外層索引 `colStart`** 鎖定每條「右上方向」對角線的起點（位於第一列、第 `colStart` 欄），從 1 開始以避免重複主對角。
  - `diagonalLength = n - colStart`：越往右起點，對角線越短。
- 內層第一次 `for`：以座標 `(needle, colStart + needle)` 逐一複製對角線元素到 `view`。
  - `view.sort()`：升冪排序。
- 內層第二次 `for`：**原樣**升冪寫回，完成非遞減要求。

```typescript
// 處理右上三角（不包含主對角線）
for (let colStart = 1; colStart < n; colStart++) {
  const diagonalLength = n - colStart;
  const view = diagonalBuffer.subarray(0, diagonalLength);

  // 將對角線元素複製到緩衝區
  for (let needle = 0; needle < diagonalLength; needle++) {
    view[needle] = grid[needle][colStart + needle];
  }

  // 將緩衝區按升冪排序
  view.sort();

  // 直接按升冪寫回（即非遞減）
  for (let needle = 0; needle < diagonalLength; needle++) {
    grid[needle][colStart + needle] = view[needle];
  }
}
```

### Step 5：回傳排序完成的矩陣

- 兩側三角的所有對角線皆已依規則排序，回傳同一個（就地修改的）`grid`。

```typescript
return grid;
```

## 時間複雜度

- 共有約 `2n - 1` 條對角線；對角線長度總和為 $n^2$。
- 每條對角線以排序為主，成本 $\sum \ell_i \log \ell_i = O(n^2 \log n)$。
- 總時間複雜度為 $O(n^2 \log n)$。

> $O(n^2 \log n)$

## 空間複雜度

- 僅使用一個長度至多為 `n` 的可重用 `Int32Array` 緩衝區與其 `subarray` 視圖（不額外配置新陣列）。
- 總空間複雜度為 $O(n)$。

> $O(n)$
