# 1504. Count Submatrices With All Ones

Given an `m x n` binary matrix mat, return the number of submatrices that have all ones.

**Constraints:**

- `1 <= m, n <= 150`
- `mat[i][j]` is either `0` or `1`.

## 基礎思路

題目要求計算在二維二元矩陣中，所有元素皆為 `1` 的子矩形數量。
若我們直接枚舉所有子矩形並檢查，時間複雜度會過高（$O(m^2 n^2)$）。因此需要更高效的方法。

核心策略是將問題轉換為「直方圖」計數問題：

- 把每一列視為直方圖的底部，對於每一欄累積連續的 `1` 數量，形成「高度陣列」。
- 若固定底部在第 $r$ 列，則每一欄 $c$ 的高度表示以 $r$ 為底、往上連續的 `1` 數量。
- 在這樣的直方圖上，我們要計算以每一欄為右邊界的矩形數量，這相當於所有以該欄為結尾的子陣列的最小值總和。

為了高效地計算「最小值總和」，採用**單調遞增棧**：

- 棧內維持高度單調遞增，並用「連續段長度」壓縮。
- 每次處理新高度時，彈出所有比它高或相等的棧頂，並更新貢獻；再把新高度推入棧。
- 在此過程中累加最小值總和，即為當前欄新增的子矩形數。

## 解題步驟

### Step 1：建立可重用緩衝區與輔助函式

我們先宣告三個全域 `Uint8Array` 陣列，用來存放當前高度、單調棧高度、與單調棧段長度。
為了避免多次重新配置記憶體，實作 `nextPow2` 與 `ensureCapacity` 來一次性擴充容量。

```typescript
// 可重用的型別化緩衝區，避免每次呼叫重新配置成本
// （高度與棧資料最大 150，使用 Uint8 安全且更快）
let reusableHeights = new Uint8Array(0);         // 各欄連續 1 的高度
let reusableStackHeights = new Uint8Array(0);    // 單調棧：高度
let reusableStackRunLengths = new Uint8Array(0); // 單調棧：連續段長度

/**
 * 回傳不小於 x 的最小 2 次方。
 * 使用位元抹除最佳化（此題 n ≤ 150 的小型情境）。
 */
function nextPow2(x: number): number {
  let v = x - 1;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  return v + 1;
}

/**
 * 確保可重用緩衝區能容納 `required` 個欄位。
 * 擴充到下一個 2 次方容量以攤還配置成本。
 */
function ensureCapacity(required: number): void {
  if (reusableHeights.length >= required) {
    return;
  }

  const capacity = nextPow2(required);
  reusableHeights = new Uint8Array(capacity);
  reusableStackHeights = new Uint8Array(capacity);
  reusableStackRunLengths = new Uint8Array(capacity);
}
```

### Step 2：初始化主函式與基本檢查

在 `numSubmat` 中，先判斷矩陣是否為空，並確保緩衝區容量足夠。
接著建立區域變數參考三個可重用陣列，並初始化 `heights` 為全 0。

```typescript
const numberOfRows = mat.length;
if (numberOfRows === 0) {
  return 0;
}

const numberOfColumns = mat[0].length;
if (numberOfColumns === 0) {
  return 0;
}

ensureCapacity(numberOfColumns);

// 區域參考（避免在緊密迴圈中重複查找全域屬性）
const heights = reusableHeights;
const stackHeights = reusableStackHeights;
const stackRuns = reusableStackRunLengths;

// 重置本次呼叫會使用到的高度前綴
heights.fill(0, 0, numberOfColumns);

let totalSubmatrices = 0;
```

### Step 3：逐列更新高度並利用單調棧計算子矩形數量

使用外層 `for` 迴圈逐列處理：

1. **更新高度**：若元素為 `1`，高度加一；否則歸零。
2. **單調棧計算**：用內層 `for` 遍歷每一欄，維持高度單調遞增棧，並透過 run-length 合併快速計算新增矩形數量。

```typescript
// 將每一列視為直方圖的「底部」來處理
for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
  const currentRow = mat[rowIndex];

  // 逐欄更新「自上而下連續 1」的高度
  for (let columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
    // 當前列值為 0/1；高度不會超過列數上限 150（適合 Uint8）
    heights[columnIndex] = currentRow[columnIndex] === 1 ? (heights[columnIndex] + 1) : 0;
  }

  // 對高度陣列建立單調遞增棧
  let stackTop = -1;
  let accumulatedMinSum = 0; // 以當前欄為右端點的所有子陣列最小值總和

  for (let columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
    const currentHeight = heights[columnIndex];

    if (currentHeight === 0) {
      // 當高度為 0 時，這裡不可能結束任何矩形；快速重置
      stackTop = -1;
      accumulatedMinSum = 0;
      continue;
    }

    // 追蹤有多少前一段可與當前合併為同一「連續段」
    let runLengthForCurrent = 1;

    // 維持遞增棧；合併段落並調整「最小值總和」
    while (stackTop >= 0 && stackHeights[stackTop] >= currentHeight) {
      accumulatedMinSum -= stackHeights[stackTop] * stackRuns[stackTop];
      runLengthForCurrent += stackRuns[stackTop];
      stackTop--;
    }

    // 將當前柱高與其合併後長度推入棧
    stackTop++;
    stackHeights[stackTop] = currentHeight;
    stackRuns[stackTop] = runLengthForCurrent;

    // 當前柱帶來的新增最小值總和
    accumulatedMinSum += currentHeight * runLengthForCurrent;

    // 以此欄為右端點的所有子陣列皆貢獻矩形數
    totalSubmatrices += accumulatedMinSum;
  }
}
```

### Step 4：回傳最終結果

最後回傳累積的子矩形總數。

```typescript
return totalSubmatrices;
```

## 時間複雜度

- **高度更新**：對於每一列更新高度需 $O(n)$。
- **單調棧處理**：每個元素在每列最多入棧與出棧一次，總成本 $O(n)$。
- **總計**：處理 $m$ 列，因此整體時間複雜度為 $O(m \times n)$。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- **可重用陣列**：`heights`、`stackHeights`、`stackRuns` 需要 $O(n)$。
- **其他變數**：只需常數額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
