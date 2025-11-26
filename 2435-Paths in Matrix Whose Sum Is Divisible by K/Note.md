# 2435. Paths in Matrix Whose Sum Is Divisible by K

You are given a 0-indexed `m x n` integer matrix `grid` and an integer `k`. 
You are currently at position `(0, 0)` and you want to reach position `(m - 1, n - 1)` moving only down or right.

Return the number of paths where the sum of the elements on the path is divisible by `k`. 
Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 5 * 10^4`
- `1 <= m * n <= 5 * 10^4`
- `0 <= grid[i][j] <= 100`
- `1 <= k <= 50`

## 基礎思路

本題要求計算從左上角 `(0,0)` 移動到右下角 `(m-1,n-1)` 的所有路徑中，**路徑元素總和可被 `k` 整除的路徑數量**；每一步只能向右或向下，因此每條路徑長度固定為 `m+n−1`。
因為 `m*n ≤ 5*10^4`，矩陣可能非常細長，但總格子數不會太大，因此適合使用 DP。

要注意的核心觀察：

- **每條路徑都有固定方向**：只能往右或下，使得每個格子的路徑只來自「上方」與「左方」。
- **我們並非要計算總和，而是總和 mod k**：因此對每個格子，我們必須記錄「到達此格子的所有路徑，其累積總和 mod k 的方式」。
- **DP 狀態設計**：對每一格 `(i,j)` 與每個可能餘數 `r (0 ≤ r < k)`，記錄能到達 `(i,j)` 且累積餘數為 `r` 的路徑數。
- **數量極大需取模**：DP 過程中需持續 `% 1e9+7`。
- **滾動 DP（Row Rolling）優化空間**：因為每格的 DP 只依賴同 row 左邊與上一 row 的同 column，因此只需兩個 row 的 DP 陣列即可，大幅降低記憶體。

整體 DP 轉移設計為：

- 從上方 `(i−1,j)` 的同餘數路徑數
- 從左方 `(i,j−1)` 的同餘數路徑數
- 加上當前格子的數字 `v`，得新餘數 `(r + v) % k`

利用滾動陣列可在線性複雜度中完成整體計算。

## 解題步驟

### Step 1：預處理基本參數

計算矩陣大小、每一列 DP 的狀態數量，並建立一個壓平的一維 `moduloGrid`，
用來儲存每個格子的 `grid[i][j] % k` 結果，以加速後續 DP。

```typescript
const modulusBase = 1_000_000_007;

const rowCount = grid.length;
const columnCount = grid[0].length;

// 每一列的 DP 狀態總數 = columnCount * k
const stateSizePerRow = columnCount * k;

// 將所有格子的 (value % k) 預先壓平成一維陣列，以加速存取
const totalCellCount = rowCount * columnCount;
const moduloGrid = new Uint8Array(totalCellCount);

let writeIndex = 0;
for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
  const row = grid[rowIndex];
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    moduloGrid[writeIndex] = row[columnIndex] % k;
    writeIndex += 1;
  }
}
```

### Step 2：初始化滾動 DP 陣列

使用滾動陣列 `previousRow` 與 `currentRow`，
每一列都需要維護 `columnCount * k` 個餘數狀態。

```typescript
// 滾動 DP 陣列（上一列與當前列）
let previousRow = new Int32Array(stateSizePerRow);
let currentRow = new Int32Array(stateSizePerRow);

// 指向壓平格子的索引
let cellIndex = 0;
```

### Step 3：外層迴圈 — 逐 row 計算 DP

進入每一列時，需先將 `currentRow` 清空，
接著才逐 column 填入 DP 狀態。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
  // 重置當前列的 DP 狀態
  currentRow.fill(0);

  // ...
}
```

### Step 4：內層迴圈 — 處理每個格子 `(rowIndex, columnIndex)`

依序讀取壓平後的 `moduloGrid`，
並計算此格子對應在 DP 陣列中的「餘數區段起點」。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
  // Step 3：外層 row 初始化

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const valueModulo = moduloGrid[cellIndex];
    cellIndex += 1;

    // 每個 column 都對應 k 個餘數狀態，因此 baseIndex 是此格的起點
    const baseIndex = columnIndex * k;

    // ...
  }
}
```

### Step 5：處理起點 `(0,0)`

若目前在第一列第一欄，則起點唯一的餘數為 `valueModulo` 本身，
路徑數量為 1。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
  // Step 3：外層 row 處理

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    // Step 4：讀取 valueModulo

    // 處理起點 (0,0)
    if (rowIndex === 0 && columnIndex === 0) {
      currentRow[valueModulo] = 1;
      continue;
    }

    // ...
  }
}
```

### Step 6：計算來自上方與左方的 DP 來源位置

上方來源永遠存在於 `previousRow` 中，
左方來源僅在 columnIndex > 0 時有效。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
  // Step 3：外層 row 處理
  
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    // Step 4：讀取 valueModulo
    
    // Step 5：處理起點 (0,0)

    // 計算上一列與左邊格子的餘數區段起點
    const fromTopIndex = baseIndex;
    let fromLeftIndex = -1;

    if (columnIndex > 0) {
      fromLeftIndex = (columnIndex - 1) * k;
    }

    // ...
  }
}
```

### Step 7：對每個餘數 `remainder` 進行 DP 狀態轉移

從上方與左方的餘數分別取出可行路徑，
並計算新餘數 `(remainder + valueModulo) % k`，
將結果累加到 `currentRow[targetIndex]`。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
  // Step 3：外層 row 處理
  
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    // Step 4：讀取 valueModulo

    // Step 5：處理起點 (0,0)
    
    // Step 6：計算來自上方與左方的 DP 來源位置

    // 針對每一種餘數進行狀態轉移
    let remainder = 0;
    while (remainder < k) {
      // 將上方與左方的路徑數合併
      let pathCount = previousRow[fromTopIndex + remainder];

      if (fromLeftIndex >= 0) {
        pathCount += currentRow[fromLeftIndex + remainder];
      }

      if (pathCount !== 0) {
        // 計算新餘數（避免使用 % 運算）
        let newRemainder = remainder + valueModulo;
        if (newRemainder >= k) {
          newRemainder -= k;
        }

        const targetIndex = baseIndex + newRemainder;

        // 將路徑數加入目標狀態，並做模處理
        let updatedValue = currentRow[targetIndex] + pathCount;
        if (updatedValue >= modulusBase) {
          updatedValue -= modulusBase;
          if (updatedValue >= modulusBase) {
            updatedValue %= modulusBase;
          }
        }

        currentRow[targetIndex] = updatedValue;
      }

      remainder += 1;
    }
  }
}
```

### Step 8：完成一 row 後進行滾動 DP 陣列交換

下一列計算時，要讓 `currentRow` 成為新的 `previousRow`。

```typescript
// 交換 DP 列，推進到下一列
const tempRow = previousRow;
previousRow = currentRow;
currentRow = tempRow;
```

### Step 9：回傳右下角餘數為 0 的路徑數

右下角位於 columnCount−1，其餘數 0 的狀態即為最終答案。

```typescript
// 回傳右下角餘數為 0 的路徑數
const resultBaseIndex = (columnCount - 1) * k;
return previousRow[resultBaseIndex] % modulusBase;
```

## 時間複雜度

- 每個格子要處理 `k` 種餘數（`k ≤ 50`）
- 總格子數 `m * n ≤ 5*10^4`
- 總時間複雜度為 $O((m \times n) \cdot k)$。

> $O(m \times n \times k)$

## 空間複雜度

- 使用兩個大小為 `columnCount * k` 的 DP 陣列作為滾動 row
- 額外使用 `moduloGrid` 來存取格子的 `value % k`
- 總空間複雜度為 $O(n \times k)$。

> $O(n \times k)$
