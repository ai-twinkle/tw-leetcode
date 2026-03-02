# 1536. Minimum Swaps to Arrange a Binary Grid

Given an `n x n` binary `grid`, in one step you can choose two adjacent rows of the grid and swap them.

A grid is said to be valid if all the cells above the main diagonal are zeros.

Return the minimum number of steps needed to make the grid valid, or -1 if the grid cannot be valid.

The main diagonal of a grid is the diagonal that starts at cell `(1, 1)` and ends at cell `(n, n)`.

**Constraints:**

- `n == grid.length == grid[i].length`
- `1 <= n <= 200`
- `grid[i][j]` is either `0` or `1`

## 基礎思路

本題允許的操作是「交換相鄰兩列」，目標是讓矩陣主對角線以上的所有位置都為 `0`。換句話說，對於第 `i` 列（從上到下），在主對角線右側允許出現 `1` 的範圍會隨著列數往下而逐步縮小，因此每一列都必須滿足一個「右側必須有足夠多個連續 0」的條件。

在思考解法時，可掌握以下核心觀察：

* **有效條件可化為每列的尾端 0 數量門檻**：
  若要使第 `i` 列在主對角線以上全為 `0`，則該列最右側必須至少有 `n - 1 - i` 個連續 `0`，才能保證所有需要為 `0` 的位置都不會出現 `1`。

* **相鄰列交換等價於「把某列往上搬」的成本**：
  若從下方挑一列搬到目標位置，所需步數就是它需要上移的距離（相鄰交換次數），因此每一步的成本可直接由距離決定。

* **貪婪策略成立：逐列決定最上方可用列**：
  由上到下依序決定每個目標位置，對於當前目標列，只要選擇「從目前位置往下找到第一個能滿足門檻的列」並搬上來，會使當前交換次數最小，且不會破壞後續可行性，因為後續列的門檻只會更寬鬆。

* **只需追蹤每列的尾端 0 數量即可，不必真的交換矩陣**：
  交換列只影響列的相對順序，因此用一個序列模擬列交換即可完成計算，避免操作整個矩陣。

依據以上特性，可以採用以下策略：

* 先為每一列計算其「從右側開始連續 0 的數量」。
* 由上到下遍歷每個目標位置，計算該位置所需的尾端 0 門檻。
* 從目標位置往下找到第一個滿足門檻的候選列，將其以相鄰交換方式搬到目標位置並累加交換次數。
* 若找不到任何候選列，代表無法達成有效矩陣，回傳 `-1`。

此策略能在確保最小交換次數的同時，完整判斷是否可行。

## 解題步驟

### Step 1：建立列數並初始化尾端 0 計數容器

先取得矩陣大小，並建立一個用來保存每列「尾端連續 0 數量」的陣列，之後所有交換行為都只在此序列上模擬。

```typescript
const gridSize = grid.length;

// 預先計算每一列的尾端 0 數量（從右側開始），存入緊湊的 typed array。
const trailingZeroCountPerRow = new Int16Array(gridSize);
```

### Step 2：計算每一列的尾端連續 0 數量

對每一列從右往左找到最後一個 `1` 的位置，若整列皆為 `0` 則尾端 0 為 `n`；否則尾端 0 的數量即為最後一個 `1` 右側剩餘格數。

```typescript
for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
  const row = grid[rowIndex];

  // 從尾端掃描找到最後一個 '1' 的位置；這能在稀疏列中減少掃描成本。
  let lastOneColumnIndex = -1;
  for (let columnIndex = gridSize - 1; columnIndex >= 0; columnIndex--) {
    if (row[columnIndex] === 1) {
      lastOneColumnIndex = columnIndex;
      break;
    }
  }

  if (lastOneColumnIndex === -1) {
    trailingZeroCountPerRow[rowIndex] = gridSize;
  } else {
    trailingZeroCountPerRow[rowIndex] = (gridSize - 1 - lastOneColumnIndex) as number;
  }
}
```

### Step 3：初始化交換次數累積值

使用一個累積變數記錄所有相鄰交換的總次數。

```typescript
let swapCount = 0;
```

### Step 4：逐一決定每個目標列所需的尾端 0 門檻

由上到下處理每個目標位置，先計算該位置為了滿足主對角線以上全為 `0` 所需要的尾端連續 `0` 數量。

```typescript
for (let targetRowIndex = 0; targetRowIndex < gridSize; targetRowIndex++) {
  const requiredTrailingZeros = gridSize - 1 - targetRowIndex;

  // ...
}
```

### Step 5：在目標位置下方尋找第一個可用候選列

從目標位置開始往下找，挑出第一個尾端 0 數量足夠的列作為候選；若一路找不到，代表無論如何交換都無法達成有效矩陣，直接回傳 `-1`。

```typescript
for (let targetRowIndex = 0; targetRowIndex < gridSize; targetRowIndex++) {
  // Step 4：計算目標列所需的尾端 0 門檻

  // 以貪婪策略選擇第一個位於 targetRowIndex 或其下方、且滿足需求的列。
  let candidateRowIndex = targetRowIndex;
  while (candidateRowIndex < gridSize && trailingZeroCountPerRow[candidateRowIndex] < requiredTrailingZeros) {
    candidateRowIndex++;
  }

  if (candidateRowIndex === gridSize) {
    return -1;
  }

  // ...
}
```

### Step 6：累加把候選列搬到目標位置所需的相鄰交換次數

候選列需要向上移動的距離即為交換次數，直接加入總累積即可。

```typescript
for (let targetRowIndex = 0; targetRowIndex < gridSize; targetRowIndex++) {
  // Step 4：計算目標列所需的尾端 0 門檻

  // Step 5：尋找第一個可用候選列

  // 將候選列透過相鄰交換搬到目標位置；不碰原矩陣，僅累加交換次數。
  swapCount += candidateRowIndex - targetRowIndex;

  // ...
}
```

### Step 7：以位移方式模擬相鄰交換後的列順序

為了反映「把候選列搬上來」後的列順序變化，只需在尾端 0 計數序列中進行區間位移：將候選列抽出，並把中間段依序往下挪，最後把抽出的值放回目標位置。

```typescript
for (let targetRowIndex = 0; targetRowIndex < gridSize; targetRowIndex++) {
  // Step 4：計算目標列所需的尾端 0 門檻

  // Step 5：尋找第一個可用候選列

  // Step 6：累加將候選列搬到目標位置所需的交換次數

  // 將尾端 0 計數向下位移，以 O(distance) 模擬相鄰列交換。
  const pickedTrailingZeros = trailingZeroCountPerRow[candidateRowIndex];
  while (candidateRowIndex > targetRowIndex) {
    trailingZeroCountPerRow[candidateRowIndex] = trailingZeroCountPerRow[candidateRowIndex - 1];
    candidateRowIndex--;
  }
  trailingZeroCountPerRow[targetRowIndex] = pickedTrailingZeros;
}
```

### Step 8：所有目標列處理完後回傳最小交換次數

當所有位置都成功放入符合門檻的列後，累積值即為最少相鄰交換次數。

```typescript
return swapCount;
```

## 時間複雜度

- 預先計算每列尾端 0 數量時，最壞情況需掃描整個矩陣，成本為 $O(n^2)$；
- 逐列尋找候選列加上位移模擬，最壞情況下總位移與搜尋仍為 $O(n^2)$；
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用一個長度為 $n$ 的序列保存每列尾端 0 數量；
- 其餘僅為常數額外變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
