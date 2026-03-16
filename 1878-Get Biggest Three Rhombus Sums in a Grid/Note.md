# 1878. Get Biggest Three Rhombus Sums in a Grid

You are given an `m x n` integer matrix `grid`.

A rhombus sum is the sum of the elements that form the border of a regular rhombus shape in `grid`. 
The rhombus must have the shape of a square rotated 45 degrees with each of the corners centered in a grid cell. 
Below is an example of four valid rhombus shapes with the corresponding colored cells that should be included in each rhombus sum:

```
|  |  |  |  |  |  |  |  |
|  |  |  |G |  |R |  |  |
|  |B |G |  |GR|  |R |  |
|B |G |B |R |  |G |  |R |
|G |B |  |  |R |  |GR|  |
|  |G |  |  |  |GR|  |  |
|  |  |G |  |G |  |  |  |
|  |  |  |G |  |  |  |P |
```

Note that the rhombus can have an area of 0, which is depicted by the purple rhombus in the bottom right corner.

Return the biggest three distinct rhombus sums in the `grid` in descending order. 
If there are less than three distinct values, return all of them.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 50`
- `1 <= grid[i][j] <= 10^5`

## 基礎思路

本題要求找出矩陣中所有菱形邊框總和的前三大相異值。菱形的中心方向固定為上下左右四個頂點，且只計算邊界上的格子；另外，單一格子也視為半徑為 0 的合法菱形。

在思考解法時，可掌握以下核心觀察：

* **菱形邊框由四條對角線線段組成**：
  每個合法菱形都可拆成左上、右上、左下、右下四段斜對角邊，因此若能快速查詢對角線區間和，就能高效計算每個菱形的邊框總和。

* **直接逐格走訪邊框成本過高**：
  若對每個中心與半徑都逐一枚舉邊框上的格子，會造成大量重複計算；尤其矩陣大小可達 `50 x 50`，所有可能菱形數量不少，必須降低單次查詢成本。

* **可先預處理兩種方向的對角線前綴和**：
  一種對應 `\` 方向，另一種對應 `/` 方向。如此一來，每條菱形邊都能用常數時間取得區間總和。

* **菱形是否合法取決於四個頂點是否仍在矩陣內**：
  對於每個上頂點，只需根據底部、左側、右側邊界分別推得可擴張的最大半徑，再取其中最小值，即可枚舉所有合法菱形。

* **題目要求前三大且不可重複**：
  不需要儲存所有總和再排序，只需在掃描過程中同步維護目前最大的三個相異值即可。

依據以上特性，可以採用以下策略：

* **先建立兩張對角線前綴和表**，讓四條邊的總和都能在常數時間內查詢。
* **枚舉每個格子作為菱形上頂點**，同時將單一格子納入候選答案。
* **對每個合法半徑計算四條邊的總和**，再扣除四個頂點的重複計算。
* **以固定大小的結構維護前三大相異值**，最後依序輸出結果。

此策略能將每個菱形的計算壓縮為常數時間，並在完整枚舉所有合法形狀後得到正確答案。

## 解題步驟

### Step 1：建立維護前三大相異值的資料結構

由於題目只需要最大的三個相異總和，因此可以設計一個固定大小的結構，只保留目前排名前三的值，避免蒐集全部結果後再排序。

```typescript
/**
 * 維護前三大的相異總和。
 */
class TopThreeDistinctSums {
  private first = 0;
  private second = 0;
  private third = 0;

  // ...
}
```

### Step 2：插入新候選值並維持前三大相異順序

每當得到一個新的菱形總和時，就依照其大小與是否重複來更新前三名；如此整個搜尋過程中都能即時維持正確答案狀態。

```typescript
class TopThreeDistinctSums {
  // Step 1：建立維護前三大相異值的資料結構

  /**
   * 將候選值插入前三大相異總和中。
   *
   * @param value - 候選值。
   */
  put(value: number): void {
    if (value > this.first) {
      this.third = this.second;
      this.second = this.first;
      this.first = value;
    } else if (value !== this.first && value > this.second) {
      this.third = this.second;
      this.second = value;
    } else if (value !== this.first && value !== this.second && value > this.third) {
      this.third = value;
    }
  }

  // ...
}
```

### Step 3：輸出目前已保存的有效答案

由於結構內部固定保留三個位置，因此回傳結果時只需依序收集非空位置，即可得到由大到小的答案陣列。

```typescript
class TopThreeDistinctSums {
  // Step 1：建立維護前三大相異值的資料結構

  // Step 2：插入新候選值並維持前三大相異順序

  /**
   * 取得目前保存的總和，並依照遞減順序回傳。
   *
   * @returns 最大的三個相異總和。
   */
  get(): number[] {
    const result = [this.first];

    if (this.second !== 0) {
      result.push(this.second);
    }

    if (this.third !== 0) {
      result.push(this.third);
    }

    return result;
  }
}
```

### Step 4：初始化矩陣尺寸與兩種對角線前綴和表

為了之後能快速查詢菱形四條邊的總和，先取得矩陣大小，並建立 `\` 與 `/` 兩個方向的對角線前綴和儲存空間。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
const stride = columnCount + 2;

// 儲存 "\" 對角線的前綴和。
const downRightPrefix = new Int32Array((rowCount + 1) * stride);

// 儲存 "/" 對角線的前綴和。
const downLeftPrefix = new Int32Array((rowCount + 1) * stride);
```

### Step 5：逐列填入兩張對角線前綴和表

接著掃描整個矩陣，將每個位置的值累加到對應方向的前綴和表中，讓之後任一對角線區段都能以差分方式快速求和。

```typescript
// 建立兩張對角線前綴和表。
for (let row = 1; row <= rowCount; row++) {
  const currentRow = grid[row - 1];
  const currentBase = row * stride;
  const previousBase = (row - 1) * stride;

  for (let column = 1; column <= columnCount; column++) {
    const value = currentRow[column - 1];
    downRightPrefix[currentBase + column] =
      downRightPrefix[previousBase + column - 1] + value;
    downLeftPrefix[currentBase + column] =
      downLeftPrefix[previousBase + column + 1] + value;
  }
}
```

### Step 6：初始化答案結構，並先處理每個上頂點的單格菱形與半徑上界

在完成對角線前綴和預處理後，先建立答案結構；接著枚舉每個格子作為菱形上頂點。
對每個位置，第一件事是先將「單一格子」這個半徑為 0 的合法菱形加入答案，然後計算此頂點可向下、向左、向右延伸的最大範圍，據此得到可枚舉的最大半徑。

```typescript
const topThreeDistinctSums = new TopThreeDistinctSums();

for (let topRow = 0; topRow < rowCount; topRow++) {
  for (let topColumn = 0; topColumn < columnCount; topColumn++) {
    // 單一格子也屬於合法菱形。
    topThreeDistinctSums.put(grid[topRow][topColumn]);

    const maxRadiusByBottom = (rowCount - 1 - topRow) >> 1;
    const maxRadiusByLeft = topColumn;
    const maxRadiusByRight = columnCount - 1 - topColumn;

    let maxRadius = maxRadiusByBottom;

    if (maxRadiusByLeft < maxRadius) {
      maxRadius = maxRadiusByLeft;
    }

    if (maxRadiusByRight < maxRadius) {
      maxRadius = maxRadiusByRight;
    }

    // ...
  }
}
```

### Step 7：枚舉所有合法半徑並定位菱形四個頂點

在取得目前上頂點的最大合法半徑後，就可以從半徑 1 開始逐一枚舉所有可能的菱形。
每次先計算中間列、底列，以及左右兩個側頂點的位置，作為後續查詢四條邊界總和的基礎。

```typescript
for (let topRow = 0; topRow < rowCount; topRow++) {
  for (let topColumn = 0; topColumn < columnCount; topColumn++) {
    // Step 6：初始化答案結構，並先處理每個上頂點的單格菱形與半徑上界

    // 枚舉所有以上方格子為頂點的菱形。
    for (let radius = 1; radius <= maxRadius; radius++) {
      // 計算菱形的四個頂點位置。
      const middleRow = topRow + radius;
      const bottomRow = middleRow + radius;
      const leftColumn = topColumn - radius;
      const rightColumn = topColumn + radius;

      // ...
    }
  }
}
```

### Step 8：利用對角線前綴和查詢四條邊的總和

有了四個頂點後，就能分別查出左上、右上、左下、右下四段邊界的總和；每一段都可直接透過對角線前綴和在常數時間內取得。

```typescript
for (let topRow = 0; topRow < rowCount; topRow++) {
  for (let topColumn = 0; topColumn < columnCount; topColumn++) {
    // Step 6：初始化答案結構，並先處理每個上頂點的單格菱形與半徑上界

    for (let radius = 1; radius <= maxRadius; radius++) {
      // Step 7：枚舉所有合法半徑並定位菱形四個頂點

      // 從對角線前綴和中查詢四條邊界。
      const upperLeftEdge =
        downLeftPrefix[(middleRow + 1) * stride + (leftColumn + 1)] -
        downLeftPrefix[topRow * stride + (topColumn + 2)];
      const upperRightEdge =
        downRightPrefix[(middleRow + 1) * stride + (rightColumn + 1)] -
        downRightPrefix[topRow * stride + topColumn];
      const lowerLeftEdge =
        downRightPrefix[(bottomRow + 1) * stride + (topColumn + 1)] -
        downRightPrefix[middleRow * stride + leftColumn];
      const lowerRightEdge =
        downLeftPrefix[(bottomRow + 1) * stride + (topColumn + 1)] -
        downLeftPrefix[middleRow * stride + (rightColumn + 2)];

      // ...
    }
  }
}
```

### Step 9：合併四條邊並扣除重複頂點，更新前三大答案

四條邊相加時，四個頂點都會被重複計入一次，因此需將四個頂點各扣回一次，得到真正的菱形邊框總和，再將其加入前三大相異值的維護結構。

```typescript
for (let topRow = 0; topRow < rowCount; topRow++) {
  for (let topColumn = 0; topColumn < columnCount; topColumn++) {
    // Step 6：初始化答案結構，並先處理每個上頂點的單格菱形與半徑上界

    for (let radius = 1; radius <= maxRadius; radius++) {
      // Step 7：枚舉所有合法半徑並定位菱形四個頂點

      // Step 8：利用對角線前綴和查詢四條邊的總和

      // 合併四條邊，再扣除被重複計算的四個頂點。
      const rhombusSum =
        upperLeftEdge +
        upperRightEdge +
        lowerLeftEdge +
        lowerRightEdge -
        grid[topRow][topColumn] -
        grid[middleRow][leftColumn] -
        grid[middleRow][rightColumn] -
        grid[bottomRow][topColumn];

      topThreeDistinctSums.put(rhombusSum);
    }
  }
}
```

### Step 10：回傳最終結果

當所有可能的菱形都被枚舉並更新完畢後，直接回傳目前保存的前三大相異總和即可。

```typescript
return topThreeDistinctSums.get();
```

## 時間複雜度

- 建立兩張對角線前綴和表需要掃描整個矩陣一次，成本為 $O(m \times n)$；
- 枚舉每個位置作為上頂點後，最多再枚舉其所有合法半徑；單次菱形總和查詢為常數時間；
- 在最壞情況下，半徑枚舉上界為 $\min(m, n)$，因此總時間複雜度為 $O(m \times n \cdot \min(m, n))$。
- 總時間複雜度為 $O(m \times n \cdot \min(m, n))$。

> $O(m \times n \cdot \min(m, n))$

## 空間複雜度

- 兩張對角線前綴和表各需要與矩陣大小同階的空間；
- 維護前三大答案只需常數額外空間。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
