# 3195. Find the Minimum Area to Cover All Ones I

You are given a 2D binary array `grid`. 
Find a rectangle with horizontal and vertical sides with the smallest area, such that all the 1's in `grid` lie inside this rectangle.

Return the minimum possible area of the rectangle.

**Constraints:**

- `1 <= grid.length, grid[i].length <= 1000`
- `grid[i][j]` is either `0` or `1`.
- The input is generated such that there is at least one 1 in `grid`.

## 基礎思路

題目給我們一個二維矩陣，裡面只有 `0` 和 `1`，並且至少會有一個 `1`。我們要找到一個面積最小的矩形，這個矩形必須完全把所有的 `1` 包含在裡面，而且矩形的邊一定是跟座標軸平行的。

要怎麼找這個矩形呢？其實不用去考慮各種可能的矩形大小，因為一旦決定了**最外層的邊界**，矩形就唯一確定了。換句話說，我們只需要知道：

- 從上往下看，第一個出現 `1` 的那一列是哪一列（最小行索引）
- 從下往上看，最後一個出現 `1` 的那一列是哪一列（最大行索引）
- 從左往右看，第一個出現 `1` 的那一欄是哪一欄（最小列索引）
- 從右往左看，最後一個出現 `1` 的那一欄是哪一欄（最大列索引）

有了這四個邊界之後，矩形的高就是「最大行 − 最小行 + 1」，寬就是「最大列 − 最小列 + 1」，面積自然就算得出來。

這就是為什麼我們只需要關注邊界，而不用去嘗試所有矩形。因為任何包含所有 `1` 的矩形，邊界一定會落在這四個位置上或更外側，而那樣面積只會更大，不會更小。

## 解題步驟

### Step 1: 初始化邊界範圍

先取得矩陣的列數與行數，並設置哨兵值作為初始邊界。

```typescript
const numberOfRows = grid.length;
const numberOfColumns = grid[0].length; // 依約束為矩形

// 選用的哨兵值以避免 Infinity，並可簡化 min/max 更新
let minimumRow = numberOfRows;
let maximumRow = -1;
let minimumColumn = numberOfColumns;
let maximumColumn = -1;
```

### Step 2: 逐列掃描與定位該列 `1` 的範圍

對於每一列：

- 從左邊開始移動指標 `left`，直到遇到第一個 `1`。
- 從右邊開始移動指標 `right`，直到遇到最後一個 `1`。
- 如果該列沒有 `1`，就直接跳過。

```typescript
for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
  const row = grid[rowIndex];

  // 從兩端修剪 0，找到該列第一個與最後一個 '1'
  let left = 0;
  let right = numberOfColumns - 1;

  while (left <= right && row[left] === 0) left++;
  if (left > right) {
    continue; // 此列沒有 '1'
  }
  while (row[right] === 0) {
    right--;
  }

  // ...
}
```

### Step 3: 更新全域邊界

找到該列的 `1` 範圍後，用它來更新上下左右的全域邊界。

```typescript
for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
  // Step 2: 逐列掃描與定位該列 `1` 的範圍

  // 更新全域邊界
  if (rowIndex < minimumRow) {
    minimumRow = rowIndex;
  }
  if (rowIndex > maximumRow) {
    maximumRow = rowIndex;
  }
  if (left < minimumColumn) {
    minimumColumn = left;
  }
  if (right > maximumColumn) {
    maximumColumn = right;
  }

  // ...
}
```

### Step 4: 提早返回的優化

若當前邊界已經等於整張 `grid` 的大小，直接返回整體面積。

```typescript
for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
  // Step 2: 逐列掃描與定位該列 `1` 的範圍

  // Step 3: 更新全域邊界
  
  // 若外框已涵蓋整張 grid，提前返回
  if (
    minimumRow === 0 &&
    maximumRow === numberOfRows - 1 &&
    minimumColumn === 0 &&
    maximumColumn === numberOfColumns - 1
  ) {
    return numberOfRows * numberOfColumns;
  }
}
```

### Step 5: 計算最終面積

遍歷結束後，利用邊界差計算矩形的高與寬，並返回答案。

```typescript
// 題目保證至少存在一個 '1'
return (maximumRow - minimumRow + 1) * (maximumColumn - minimumColumn + 1);
```

## 時間複雜度

- 掃描 $m$ 列，每列用雙指標最多檢查 $n$ 次。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 僅使用少數變數記錄邊界，額外空間為常數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
