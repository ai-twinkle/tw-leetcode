# 1727. Largest Submatrix With Rearrangements

You are given a binary matrix `matrix` of size `m x n`, and you are allowed to rearrange the columns of the `matrix` in any order.

Return the area of the largest submatrix within `matrix` where every element of the submatrix is `1` after reordering the columns optimally.

**Constraints:**

- `m == matrix.length`
- `n == matrix[i].length`
- `1 <= m * n <= 10^5`
- `matrix[i][j]` is either `0` or `1`.

## 基礎思路

本題要求在可任意重排列順序的前提下，找出只包含 `1` 的最大子矩形面積。由於每一列都能獨立重排，因此欄位原本的左右位置並不重要，真正影響答案的是：在每一列上，每個欄位往上連續延伸了多少個 `1`。

在思考解法時，可掌握以下核心觀察：

* **每一列都可轉化為高度分布問題**：
  對於目前這一列，只要知道每個位置向上連續有多少個 `1`，就能把這些值視為一組高度資訊，進一步判斷可形成哪些全為 `1` 的矩形。

* **允許重排列順序，代表只需關心高度的組合**：
  因為欄位可以任意交換位置，所以不必保留原本欄位順序；只要把較高的欄位集中，就能形成更大的矩形。

* **對固定的一列而言，矩形高度由較短欄位決定**：
  若已選定若干個欄位作為矩形寬度，則這些欄位中最小的高度就是該矩形可行的高度，因此可透過由大到小整理高度資訊來枚舉最佳面積。

* **不同矩陣形狀適合不同統計方式**：
  若列數較小，高度可能值的範圍也較小，適合直接統計各高度出現次數；
  若欄數較小，則直接對每列的高度資訊排序會更直接有效。

依據以上特性，可以採用以下策略：

* **逐列維護每個欄位目前向上連續的高度**。
* **當列數不大時，使用計數法統計各高度的欄數，再由高到低累加寬度並計算面積**。
* **當欄數較小時，將每列高度排序後，從最大高度往下枚舉可形成的矩形**。
* **根據矩陣長寬關係，動態選擇較適合的計算方式**。

此策略能充分利用「可重排列」的特性，並依據輸入形狀選擇更合適的實作方式，以有效求出最大子矩形面積。

## 解題步驟

### Step 1：初始化主流程所需資訊並選擇對應策略

先取得列數與欄數，並建立一個可重複使用的高度緩衝區。
之後依照矩陣形狀判斷：若列數不超過欄數，就使用計數法；否則使用排序法。

```typescript
const rowCount = matrix.length;
const columnCount = matrix[0].length;
const heightByColumn = new Uint32Array(columnCount);

if (rowCount <= columnCount) {
  return getMaximumAreaByCounting(matrix, rowCount, columnCount, heightByColumn);
}

return getMaximumAreaBySorting(matrix, rowCount, columnCount, heightByColumn);
```

### Step 2：建立計數法的輔助陣列與答案變數

在計數法中，需要一個陣列記錄每種高度出現的次數，並用一個變數維護目前找到的最大面積。

```typescript
/**
 * 當列數夠小時，使用高度計數法。
 *
 * @param matrix - 二元矩陣
 * @param rowCount - 總列數
 * @param columnCount - 總欄數
 * @param heightByColumn - 可重複使用的高度緩衝區
 * @returns 最大可能面積
 */
function getMaximumAreaByCounting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  const frequencyByHeight = new Uint32Array(rowCount + 1);
  let maximumArea = 0;

  // ...
}
```

### Step 3：在計數法中逐列更新每個欄位的連續高度

對每一列，先取出目前列，再逐欄更新高度：
若該位置為 `0`，高度歸零；若為 `1`，則在原本高度基礎上加一。

```typescript
/**
 * 當列數夠小時，使用高度計數法。
 *
 * @param matrix - 二元矩陣
 * @param rowCount - 總列數
 * @param columnCount - 總欄數
 * @param heightByColumn - 可重複使用的高度緩衝區
 * @returns 最大可能面積
 */
function getMaximumAreaByCounting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  // Step 2：建立計數法的輔助陣列與答案變數

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = matrix[rowIndex];

    // 更新每一欄的柱狀圖高度
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (currentRow[columnIndex] === 0) {
        heightByColumn[columnIndex] = 0;
      } else {
        heightByColumn[columnIndex] += 1;
      }
    }

    // ...
  }

  return maximumArea;
}
```

### Step 4：在計數法中統計每種高度出現的欄數

更新完這一列的高度後，逐欄讀取目前高度，並把對應高度的出現次數累加到統計陣列中。

```typescript
function getMaximumAreaByCounting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  // Step 2：建立計數法的輔助陣列與答案變數

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    // Step 3：更新每個欄位的連續高度

    // 統計每種高度各有多少欄
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const height = heightByColumn[columnIndex];
      frequencyByHeight[height] += 1;
    }

    // ...
  }

  return maximumArea;
}
```

### Step 5：在計數法中由高到低累加寬度並更新最大面積

由於欄位可以重排，因此只要從較大的高度往下看，逐步把可用欄數累加起來，就能得到該高度下可形成的最大寬度，進而計算面積並更新答案。

```typescript
function getMaximumAreaByCounting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  // Step 2：建立計數法的輔助陣列與答案變數

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    // Step 3：更新每個欄位的連續高度

    // Step 4：統計每種高度出現的欄數

    let width = 0;

    // 在虛擬重排列後，優先嘗試較大的高度
    for (let height = rowIndex + 1; height >= 1; height--) {
      width += frequencyByHeight[height];
      const area = width * height;

      if (area > maximumArea) {
        maximumArea = area;
      }
    }

    // ...
  }

  return maximumArea;
}
```

### Step 6：在計數法中清除本列使用過的高度計數

本列處理完成後，需把這一輪用過的高度計數清回 `0`，以免干擾下一列的統計結果。

```typescript
function getMaximumAreaByCounting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  // Step 2：建立計數法的輔助陣列與答案變數

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    // Step 3：更新每個欄位的連續高度

    // Step 4：統計每種高度出現的欄數

    // Step 5：由高到低累加寬度並更新最大面積

    // 清除本列使用過的計數器，供下一列使用
    for (let height = 0; height <= rowIndex + 1; height++) {
      frequencyByHeight[height] = 0;
    }
  }

  return maximumArea;
}
```

### Step 7：建立排序法的輔助陣列與答案變數

若改用排序法，則需準備一個可重複使用的排序陣列，並同樣使用一個變數維護最大面積。

```typescript
/**
 * 當欄數較小時，使用排序法。
 *
 * @param matrix - 二元矩陣
 * @param rowCount - 總列數
 * @param columnCount - 總欄數
 * @param heightByColumn - 可重複使用的高度緩衝區
 * @returns 最大可能面積
 */
function getMaximumAreaBySorting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  const sortedHeightArray = new Uint32Array(columnCount);
  let maximumArea = 0;

  // ...
}
```

### Step 8：在排序法中逐列更新每個欄位的連續高度

排序法同樣先逐列維護高度資訊，這些高度就是當前列在重排列後可形成矩形的基礎。

```typescript
/**
 * 當欄數較小時，使用排序法。
 *
 * @param matrix - 二元矩陣
 * @param rowCount - 總列數
 * @param columnCount - 總欄數
 * @param heightByColumn - 可重複使用的高度緩衝區
 * @returns 最大可能面積
 */
function getMaximumAreaBySorting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  // Step 7：建立排序法的輔助陣列與答案變數

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const currentRow = matrix[rowIndex];

    // 更新每一欄的柱狀圖高度
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (currentRow[columnIndex] === 0) {
        heightByColumn[columnIndex] = 0;
      } else {
        heightByColumn[columnIndex] += 1;
      }
    }

    // ...
  }

  return maximumArea;
}
```

### Step 9：在排序法中複製並排序當前列的高度資訊

更新完高度後，把目前的高度資料複製到排序陣列中，再進行排序，等同於模擬最佳的欄位重排結果。

```typescript
function getMaximumAreaBySorting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
   // Step 7：建立排序法的輔助陣列與答案變數

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    // Step 8：更新每個欄位的連續高度

    // 重複使用同一個型別陣列進行排序
    sortedHeightArray.set(heightByColumn);
    sortedHeightArray.sort();

    // ...
  }

  return maximumArea;
}
```

### Step 10：在排序法中由大到小枚舉矩形並更新答案

排序後，從最大高度開始往前掃描。
目前掃到的位置可決定可用寬度，而該位置的高度就是這個寬度下的限制高度，因此可直接計算面積並更新答案。
若高度已為 `0`，表示更前面的值也無法形成有效矩形，可立即停止。

```typescript
function getMaximumAreaBySorting(
  matrix: number[][],
  rowCount: number,
  columnCount: number,
  heightByColumn: Uint32Array
): number {
  // Step 7：建立排序法的輔助陣列與答案變數

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    // Step 8：更新每個欄位的連續高度

    // Step 9：複製並排序當前列的高度資訊

    // 從最大高度往最小高度遍歷
    for (let sortedIndex = columnCount - 1; sortedIndex >= 0; sortedIndex--) {
      const height = sortedHeightArray[sortedIndex];

      if (height === 0) {
        break;
      }

      const width = columnCount - sortedIndex;
      const area = height * width;

      if (area > maximumArea) {
        maximumArea = area;
      }
    }
  }

  return maximumArea;
}
```

## 時間複雜度

- 主函式只做常數次初始化與分支判斷。
- 無論進入哪個分支，都需要逐列更新每個欄位的連續高度，這部分成本為 $O(mn)$。
- 若進入計數法分支，對每一列還需做高度統計、由高到低累加，以及清除使用過的計數，額外成本為 $O(m^2)$。
- 若進入排序法分支，對每一列還需排序目前的高度資訊，額外成本為 $O(mn \log n)$。
- 總時間複雜度為 $O(mn + \min(m^2, mn \log n))$。

> $O(mn + \min(m^2, mn \log n))$

## 空間複雜度

- 主流程固定使用一個長度為 $n$ 的高度陣列。
- 若進入計數法分支，額外使用一個長度為 $m + 1$ 的計數陣列。
- 若進入排序法分支，額外使用一個長度為 $n$ 的排序陣列。
- 總空間複雜度為 $O(m + n)$。

> $O(m + n)$
