# 3548. Equal Sum Grid Partition II

You are given an `m x n` matrix grid of positive integers. 
Your task is to determine if it is possible to make either one horizontal or one vertical cut on the grid such that:

- Each of the two resulting sections formed by the cut is non-empty.
- The sum of elements in both sections is equal, or can be made equal by discounting at most one single cell in total (from either section).
- If a cell is discounted, the rest of the section must remain connected.

Return `true` if such a partition exists; otherwise, return `false`.

Note: A section is connected if every cell in it can be reached from any other cell by moving up, down, left, 
or right through other cells in the section.

**Constraints:**

- `1 <= m == grid.length <= 10^5`
- `1 <= n == grid[i].length <= 10^5`
- `2 <= m * n <= 10^5`
- `1 <= grid[i][j] <= 10^5`

## 基礎思路

本題要求判斷能否對矩陣進行一次水平或垂直切割，使得兩個區段的元素總和相等，或在至多移除一個單元格（且移除後該區段仍需保持連通）的條件下使總和相等。

在思考解法時，可掌握以下核心觀察：

- **切割方向相互獨立**：
  水平切割與垂直切割互不干涉，可分別枚舉所有合法切割位置，任一成立即可回傳成功。

- **總和差距決定需移除的目標值**：
  設兩個區段的總和差距為 `d`，若 `d ≠ 0`，則唯一可行的方式是從較重的區段中移除一個值恰好為 `|d|` 的單元格；若不存在這樣的單元格，此切割位置無效。

- **連通性決定哪些單元格可被移除**：
  移除單元格後，該區段必須維持連通。對於一般二維矩形區段，任意非孤立單元格均不會是橋接點，可安全移除；對於僅有一行或一列的帶狀區段，只有兩端的單元格在移除後仍保持連通，內部的單元格移除後會使區段斷開。

- **頻率統計可在 O(1) 內查詢特定值是否存在於某區段**：
  利用累進式地將行（或列）加入前綴計數，搭配全域頻率表做差，可在不重新掃描的情況下得知某值在另一區段中的出現次數。

- **前綴和使切割位置的區段總和可在 O(1) 內取得**：
  預先計算各行與各列的前綴總和，枚舉每個切割位置時可直接讀取兩側的總和，無需重新累加。

依據以上特性，可以採用以下策略：

- **預先計算行前綴和與列前綴和，以及全域值頻率表**，為後續枚舉奠定基礎。
- **枚舉每個水平切割位置時，增量維護上半部的值頻率表**，並依照形狀（一般矩形、單行帶狀、單列帶狀）決定哪些單元格可合法移除。
- **對垂直切割方向套用相同策略**，以左半部的值頻率表與全域頻率表差值推導右半部的頻率資訊。
- **任一切割位置滿足條件即立即回傳 `true`**，全部枚舉完畢仍無解則回傳 `false`。

## 解題步驟

### Step 1：初始化維度常數與輔助陣列

記錄矩陣的行數與列數，並定義單元格值的最大範圍，以便後續直接用值作為索引查詢頻率。
同時配置行總和、列總和與全域頻率表三個輔助陣列。

```typescript
const numRows = grid.length;
const numCols = grid[0].length;

// 值域為 [1, 10^5]；大小設為 100_001 可直接以單元格值作為索引
const MAX_CELL_VALUE = 100_001;

const rowSum = new Float64Array(numRows);
const colSum = new Float64Array(numCols);

// 紀錄整個矩陣中每個值的出現次數
const totalValueFrequency = new Int32Array(MAX_CELL_VALUE);
```

### Step 2：單次掃描建立行總和、列總和與全域頻率表

透過一次完整的二層迴圈，同時累積每行的元素總和、每列的元素總和、整體值頻率，以及矩陣的全域總和。

```typescript
// 一次掃描建立行總和、列總和與全域頻率表
let totalSum = 0;
for (let row = 0; row < numRows; row++) {
  for (let col = 0; col < numCols; col++) {
    const cellValue = grid[row][col];
    rowSum[row] += cellValue;
    colSum[col] += cellValue;
    totalValueFrequency[cellValue]++;
    totalSum += cellValue;
  }
}
```

### Step 3：建立行前綴和與列前綴和

預先計算行前綴和與列前綴和，使得任意切割位置的兩側總和可在常數時間內直接讀取。

```typescript
// prefixRowSum[i] = 第 0...i-1 行的總和；可在 O(1) 取得 topSum = prefixRowSum[cutRow]
const prefixRowSum = new Float64Array(numRows + 1);
for (let row = 0; row < numRows; row++) {
  prefixRowSum[row + 1] = prefixRowSum[row] + rowSum[row];
}

// prefixColSum[j] = 第 0...j-1 列的總和；可在 O(1) 取得 leftSum = prefixColSum[cutCol]
const prefixColSum = new Float64Array(numCols + 1);
for (let col = 0; col < numCols; col++) {
  prefixColSum[col + 1] = prefixColSum[col] + colSum[col];
}
```

### Step 4：枚舉水平切割——增量累積上半部頻率並判斷是否平衡

對每個水平切割位置，先將上一行的元素值加入上半部頻率表，再讀取兩側總和。
若總和已相等，直接回傳成功。

```typescript
// =========================================================
// 水平切割 — 上半部：第 [0, cutRow) 行
//             下半部：第 [cutRow, numRows) 行
// =========================================================

// 僅追蹤上半部的值頻率；隨 cutRow 推進逐行累加。
// 下半部頻率可由：totalValueFrequency - topSectionFrequency 推導
const topSectionFrequency = new Int32Array(MAX_CELL_VALUE);

for (let cutRow = 1; cutRow < numRows; cutRow++) {
  // 在評估此切割位置前，先將第 cutRow-1 行納入上半部
  for (let col = 0; col < numCols; col++) {
    topSectionFrequency[grid[cutRow - 1][col]]++;
  }

  const topSum = prefixRowSum[cutRow];
  const bottomSum = totalSum - topSum;
  const sumDifference = topSum - bottomSum;

  // 兩側已平衡 — 不需折扣即可成立
  if (sumDifference === 0) {
    return true;
  }

  // ...
}
```

### Step 5：水平切割——依區段形狀判斷能否從較重的一側移除目標值單元格

當兩側不平衡時，依 `sumDifference` 的正負判斷需從哪一側移除單元格，再根據區段的形狀（一般矩形、單行帶狀、單列帶狀）決定哪些位置的單元格在移除後仍能保持連通。

```typescript
for (let cutRow = 1; cutRow < numRows; cutRow++) {
  // Step 4：納入上一行並計算總和差距

  const topRowCount = cutRow;
  const bottomRowCount = numRows - cutRow;

  if (sumDifference > 0 && sumDifference < MAX_CELL_VALUE) {
    // 上半部較重；需從中移除一個值恰好為 sumDifference 的單元格
    const targetValue = sumDifference;

    if (topRowCount >= 2 && numCols >= 2) {
      // 二維矩形：任何單元格皆非橋接點，符合值即可折扣
      if (topSectionFrequency[targetValue] > 0) {
        return true;
      }
    } else if (topRowCount === 1 && numCols >= 2) {
      // 水平帶狀：內部單元格為橋接點；僅最左或最右端可安全移除
      if (grid[0][0] === targetValue || grid[0][numCols - 1] === targetValue) {
        return true;
      }
    } else if (topRowCount >= 2 && numCols === 1) {
      // 垂直帶狀：內部單元格為橋接點；僅最上或最下端可安全移除
      if (grid[0][0] === targetValue || grid[topRowCount - 1][0] === targetValue) {
        return true;
      }
    }
    // topRowCount === 1 && numCols === 1：移除唯一單元格會清空區段 — 略過

  } else if (sumDifference < 0 && -sumDifference < MAX_CELL_VALUE) {
    // 下半部較重；需從中移除一個值恰好為 -sumDifference 的單元格
    const targetValue = -sumDifference;

    if (bottomRowCount >= 2 && numCols >= 2) {
      // 以全域頻率減去上半部頻率，O(1) 得出下半部的計數
      if (totalValueFrequency[targetValue] - topSectionFrequency[targetValue] > 0) {
        return true;
      }
    } else if (bottomRowCount === 1 && numCols >= 2) {
      // 下半部為最後單行；僅其兩端非橋接點
      if (grid[numRows - 1][0] === targetValue || grid[numRows - 1][numCols - 1] === targetValue) {
        return true;
      }
    } else if (bottomRowCount >= 2 && numCols === 1) {
      // 下半部為垂直帶狀；僅其頂端（cutRow）或底端可安全移除
      if (grid[cutRow][0] === targetValue || grid[numRows - 1][0] === targetValue) {
        return true;
      }
    }
    // bottomRowCount === 1 && numCols === 1：移除唯一單元格會清空區段 — 略過
  }
}
```

### Step 6：枚舉垂直切割——增量累積左半部頻率並判斷是否平衡

對垂直方向採用與水平切割完全對稱的策略：逐列推進左半部頻率表，並先檢查兩側總和是否已相等。

```typescript
// =========================================================
// 垂直切割 — 左半部：第 [0, cutCol) 列
//             右半部：第 [cutCol, numCols) 列
// =========================================================

// 採用相同的增量頻率方式，改為追蹤左半部的值計數
const leftSectionFrequency = new Int32Array(MAX_CELL_VALUE);

for (let cutCol = 1; cutCol < numCols; cutCol++) {
  // 在評估此切割位置前，先將第 cutCol-1 列納入左半部
  for (let row = 0; row < numRows; row++) {
    leftSectionFrequency[grid[row][cutCol - 1]]++;
  }

  const leftSum = prefixColSum[cutCol];
  const rightSum = totalSum - leftSum;
  const sumDifference = leftSum - rightSum;

  // 兩側已平衡 — 不需折扣即可成立
  if (sumDifference === 0) {
    return true;
  }

  // ...
}
```

### Step 7：垂直切割——依區段形狀判斷能否從較重的一側移除目標值單元格

與水平切割相同，依差距正負及區段形狀判斷左半部或右半部是否存在可合法移除的目標單元格。

```typescript
for (let cutCol = 1; cutCol < numCols; cutCol++) {
  // Step 6：納入上一列並計算總和差距

  const leftColCount = cutCol;
  const rightColCount = numCols - cutCol;

  if (sumDifference > 0 && sumDifference < MAX_CELL_VALUE) {
    // 左半部較重；從中移除一個值恰好為 sumDifference 的單元格
    const targetValue = sumDifference;

    if (numRows >= 2 && leftColCount >= 2) {
      // 二維矩形：任何符合值的單元格均可安全折扣
      if (leftSectionFrequency[targetValue] > 0) {
        return true;
      }
    } else if (numRows === 1 && leftColCount >= 2) {
      // 水平帶狀：僅兩端（最左列或最右列）非橋接點
      if (grid[0][0] === targetValue || grid[0][leftColCount - 1] === targetValue) {
        return true;
      }
    } else if (numRows >= 2 && leftColCount === 1) {
      // 垂直帶狀：僅最上或最下單元格可安全移除
      if (grid[0][0] === targetValue || grid[numRows - 1][0] === targetValue) {
        return true;
      }
    }
    // numRows === 1 && leftColCount === 1：移除唯一單元格會清空區段 — 略過

  } else if (sumDifference < 0 && -sumDifference < MAX_CELL_VALUE) {
    // 右半部較重；從中移除一個值恰好為 -sumDifference 的單元格
    const targetValue = -sumDifference;

    if (numRows >= 2 && rightColCount >= 2) {
      // 以相減方式推導右半部計數，避免額外掃描
      if (totalValueFrequency[targetValue] - leftSectionFrequency[targetValue] > 0) {
        return true;
      }
    } else if (numRows === 1 && rightColCount >= 2) {
      // 右半部為水平帶狀；僅其兩端可安全移除
      if (grid[0][cutCol] === targetValue || grid[0][numCols - 1] === targetValue) {
        return true;
      }
    } else if (numRows >= 2 && rightColCount === 1) {
      // 右半部為最後垂直帶狀；僅其最上或最下單元格可安全移除
      if (grid[0][numCols - 1] === targetValue || grid[numRows - 1][numCols - 1] === targetValue) {
        return true;
      }
    }
    // numRows === 1 && rightColCount === 1：移除唯一單元格會清空區段 — 略過
  }
}
```

### Step 8：所有切割位置均不可行，回傳失敗

若水平與垂直方向的所有切割位置均無法滿足條件，回傳 `false`。

```typescript
return false;
```

以下是修正後的複雜度段落：

## 時間複雜度

- 初始掃描建立行總和、列總和與全域頻率表需 $O(m \times n)$；
- 建立行前綴和需 $O(m)$，建立列前綴和需 $O(n)$；
- 枚舉 $m - 1$ 個水平切割位置，每個位置需 $O(n)$ 將前一行納入頻率表，查詢為 $O(1)$，合計 $O(m \times n)$；
- 枚舉 $n - 1$ 個垂直切割位置，每個位置需 $O(m)$ 將前一列納入頻率表，查詢為 $O(1)$，合計 $O(m \times n)$；
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 行總和與列總和陣列分別佔用 $O(m)$ 與 $O(n)$；
- 行前綴和與列前綴和陣列分別佔用 $O(m)$ 與 $O(n)$；
- 全域頻率表、上半部頻率表與左半部頻率表各佔用 $O(V)$，其中 $V$ 為單元格值域大小（固定為 $10^5$），視為常數；
- 總空間複雜度為 $O(m + n)$。

> $O(m + n)$
