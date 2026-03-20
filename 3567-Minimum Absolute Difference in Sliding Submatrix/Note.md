# 3567. Minimum Absolute Difference in Sliding Submatrix

You are given an `m x n` integer matrix `grid` and an integer `k`.

For every contiguous `k x k` submatrix of `grid`, 
compute the minimum absolute difference between any two distinct values within that submatrix.

Return a 2D array `ans` of size `(m - k + 1) x (n - k + 1)`, 
where `ans[i][j]` is the minimum absolute difference in the submatrix whose top-left corner is `(i, j)` in `grid`.

Note: If all elements in the submatrix have the same value, the answer will be 0.

A submatrix `(x1, y1, x2, y2)` is a matrix 
that is formed by choosing all cells `matrix[x][y]` where `x1 <= x <= x2` and `y1 <= y <= y2`.

**Constraints:**

- `1 <= m == grid.length <= 30`
- `1 <= n == grid[i].length <= 30`
- `-10^5 <= grid[i][j] <= 10^5`
- `1 <= k <= min(m, n)`

## 基礎思路

本題要求對一個 `m × n` 矩陣中每個 `k × k` 的子矩陣，計算其中任意兩個不同值之間的最小絕對差，並將結果填入一個 `(m - k + 1) × (n - k + 1)` 的輸出矩陣中。

在思考解法時，可掌握以下核心觀察：

- **最小絕對差由相鄰排序值決定**：
  在一組數字中，任意兩值之間的最小差，必定出現在排序後相鄰的兩個元素之間。因此只需對子矩陣的元素排序後做一次線性掃描即可。

- **k×k 子矩陣是二維滑動視窗**：
  輸出矩陣的每個位置 `(i, j)` 對應一個以 `(i, j)` 為左上角、大小為 `k × k` 的矩形區域，共有 `(m - k + 1) × (n - k + 1)` 個視窗需要處理。

- **可預先攤平矩陣以加速存取**：
  將二維矩陣轉為一維連續陣列後，每次擷取視窗元素時可直接用偏移計算，避免多層索引帶來的效能損耗。

- **排序後可提早終止線性掃描**：
  不同整數之間最小可能的差為 1，一旦找到差值為 1 的相鄰對，即可立即中止掃描，無需繼續比較。

- **全相同值的子矩陣以預填 0 處理**：
  若視窗內所有值均相同，排序後不會更新最小差，最終結果維持預填的 0，符合題意。

依據以上特性，可以採用以下策略：

- **預先將二維矩陣攤平為一維陣列**，減少每次視窗擷取的存取成本。
- **對每個視窗，將其元素複製至固定大小緩衝區後排序**，再以線性掃描求最小相鄰差。
- **利用差值為 1 時提早中止** 進一步降低常數成本。

此策略在矩陣與視窗尺寸皆有上界的約束下，能夠穩定且高效地求解每個子矩陣的最小絕對差。

## 解題步驟

### Step 1：初始化維度與輔助變數

計算輸入矩陣的列數與行數，並由此推算出輸出矩陣的尺寸；同時算出每個視窗內的元素總數，以便後續分配緩衝區。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
const outputRowCount = rowCount - k + 1;
const outputColumnCount = columnCount - k + 1;
const windowSize = k * k;

const windowValues = new Int32Array(windowSize);
```

### Step 2：將二維矩陣攤平為一維陣列

將原始二維矩陣的每一列依序寫入一維的 `flatGrid` 陣列，使得每列在記憶體中連續排列，後續擷取視窗元素時可直接用 `rowOffset + column` 計算位置。

```typescript
// 將二維矩陣展平為一維，使每列在記憶體中連續排列
const flatGrid = new Int32Array(rowCount * columnCount);
for (let row = 0; row < rowCount; row++) {
  const gridRow = grid[row];
  const rowOffset = row * columnCount;
  for (let column = 0; column < columnCount; column++) {
    flatGrid[rowOffset + column] = gridRow[column];
  }
}
```

### Step 3：建立預填為 0 的輸出矩陣

建立大小為 `outputRowCount × outputColumnCount` 的結果矩陣，並預先以 0 填滿；如此一來，當視窗內所有值相同時，不需額外寫入，結果自動為 0。

```typescript
const result: number[][] = Array.from(
  { length: outputRowCount },
  () => new Array(outputColumnCount).fill(0),
);
```

### Step 4：遍歷每個視窗位置並擷取視窗元素

用兩層迴圈枚舉每個合法的視窗左上角 `(rowIndex, columnIndex)`；對每個位置，再用兩層內層迴圈逐列逐行將視窗內的 `k × k` 個元素依序複製到 `windowValues` 緩衝區。

```typescript
for (let rowIndex = 0; rowIndex < outputRowCount; rowIndex++) {
  for (let columnIndex = 0; columnIndex < outputColumnCount; columnIndex++) {
    let writePosition = 0;

    // 將當前 k×k 視窗的所有值快照至平坦緩衝區
    for (let windowRow = rowIndex; windowRow < rowIndex + k; windowRow++) {
      const rowOffset = windowRow * columnCount;
      for (let windowColumn = columnIndex; windowColumn < columnIndex + k; windowColumn++) {
        windowValues[writePosition++] = flatGrid[rowOffset + windowColumn];
      }
    }

    // ...
  }
}
```

### Step 5：對視窗緩衝區排序，使最近的值相鄰

對 `windowValues` 進行排序，排序後相鄰元素之間的差值即為候選的最小絕對差，無需比較所有值對的組合。

```typescript
for (let rowIndex = 0; rowIndex < outputRowCount; rowIndex++) {
  for (let columnIndex = 0; columnIndex < outputColumnCount; columnIndex++) {
    // Step 4：擷取視窗元素

    // 排序使最近的值相鄰，如此一次線性掃描即可找出最小差
    windowValues.sort();

    // ...
  }
}
```

### Step 6：線性掃描排序後相鄰對，求最小差值

初始化 `minimumDifference` 為最大安全整數；掃描排序後的 `windowValues`，對每對相鄰元素計算差值並嘗試更新最小值；若兩值相等則跳過，若差值已達 1 則提前中止。

```typescript
for (let rowIndex = 0; rowIndex < outputRowCount; rowIndex++) {
  for (let columnIndex = 0; columnIndex < outputColumnCount; columnIndex++) {
    // Step 4：擷取視窗元素

    // Step 5：排序視窗緩衝區

    let minimumDifference = Number.MAX_SAFE_INTEGER;

    // 掃描排序後的相鄰對；最小差必定出現在相鄰元素之間
    for (let position = 1; position < windowSize; position++) {
      const currentValue = windowValues[position];
      const previousValue = windowValues[position - 1];

      // 相等的相鄰元素不產生新差值；略過以避免錯誤地得到零
      if (currentValue === previousValue) {
        continue;
      }

      const difference = currentValue - previousValue;
      if (difference < minimumDifference) {
        minimumDifference = difference;
      }

      // 1 是兩個不同整數之間最小可能的差；找到後無須繼續掃描
      if (minimumDifference === 1) {
        break;
      }
    }

    // ...
  }
}
```

### Step 7：將有效的最小差值寫入結果矩陣

若 `minimumDifference` 仍為 `MAX_SAFE_INTEGER`，代表視窗內所有值均相同，此位置維持預填的 0 不變；否則將計算出的最小差值寫入輸出矩陣的對應位置。

```typescript
for (let rowIndex = 0; rowIndex < outputRowCount; rowIndex++) {
  for (let columnIndex = 0; columnIndex < outputColumnCount; columnIndex++) {
    // Step 4：擷取視窗元素

    // Step 5：排序視窗緩衝區

    // Step 6：線性掃描求最小差值

    // 若 minimumDifference 仍為 MAX_SAFE_INTEGER，表示視窗內全部值相同，以預填的 0 表示
    if (minimumDifference !== Number.MAX_SAFE_INTEGER) {
      result[rowIndex][columnIndex] = minimumDifference;
    }
  }
}
```

### Step 8：回傳結果矩陣

所有視窗均處理完畢後，回傳填好的結果矩陣。

```typescript
return result;
```

## 時間複雜度

- 共有 $(m - k + 1) \times (n - k + 1)$ 個視窗，每個視窗擷取 $k^2$ 個元素，擷取成本為 $O(k^2)$；
- 每個視窗排序成本為 $O(k^2 \log k^2) = O(k^2 \log k)$；
- 每個視窗線性掃描成本為 $O(k^2)$；
- 因此每個視窗的總成本為 $O(k^2 \log k)$，乘上視窗數量後，時間複雜度為 $O(m \cdot n \cdot k^2 \log k)$；
- 總時間複雜度為 $O(m \cdot n \cdot k^2 \log k)$。

> $O(m \cdot n \cdot k^2 \log k)$

## 空間複雜度

- `flatGrid` 佔用 $O(m \cdot n)$ 空間；
- `windowValues` 緩衝區固定佔用 $O(k^2)$ 空間；
- 輸出矩陣 `result` 佔用 $O((m - k + 1)(n - k + 1))$，上界為 $O(m \cdot n)$；
- 總空間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$
