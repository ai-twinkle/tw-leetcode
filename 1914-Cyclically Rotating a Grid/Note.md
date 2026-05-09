# 1914. Cyclically Rotating a Grid

You are given an `m x n` integer matrix `grid`, where `m` and `n` are both even integers, and an integer `k`.

The matrix is composed of several layers, which is shown in the below image, where each color is its own layer:

```
1 1 1 1
1 2 2 1
1 2 2 1
1 2 2 1
1 1 1 1
```

A cyclic rotation of the matrix is done by cyclically rotating each layer in the matrix. 
To cyclically rotate a layer once, each element in the layer will take the place of the adjacent element in the counter-clockwise direction. 
An example rotation is shown below:

Before rotation:
```
 1  2  3  4
16  1  2  5
15  8  3  6
14  7  4  7
13  6  5  8
12 11 10  9
```

After rotation with `k = 1`:
```
 2  3  4  5
 1  2  3  6
16  1  4  7
15  8  5  8
14  7  6  9
13 12 11 10
```

Return the matrix after applying `k` cyclic rotations to it.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `2 <= m, n <= 50`
- Both `m` and `n` are even integers.
- `1 <= grid[i][j] <= 5000`
- `1 <= k <= 10^9`

## 基礎思路

本題要求對一個 `m x n` 的矩陣執行 `k` 次逆時針循環旋轉，且矩陣由多層同心環狀結構組成，每層各自獨立旋轉。

在思考解法時，可掌握以下核心觀察：

- **矩陣由多層環狀周長構成**：
  每一層恰好是一條閉合路徑，路徑上的元素可以被線性化為一維陣列，旋轉問題因此退化為一維循環位移問題。

- **旋轉次數可對周長取模**：
  旋轉一整圈後結果與旋轉前相同，因此只需計算有效的位移量，避免重複旋轉的無效運算。

- **元素的讀取與寫入方向一致**：
  若以固定順序（如逆時針方向）列舉周長上的元素，旋轉操作等同於對此序列進行循環左移，可用起始讀取指標的偏移來模擬。

- **模除的代價可以被消除**：
  在逐一寫回元素時，每次只需在到達緩衝區尾端時歸零，而非每步都進行取模運算，以提升效能。

依據以上特性，可以採用以下策略：

- **逐層處理**，計算每一層的周長，並沿固定方向將元素讀入線性緩衝區。
- **計算有效位移量**並直接設定讀取起始指標，而非真正執行多次旋轉。
- **沿相同方向寫回元素**，搭配廉價的邊界歸零取代取模，將旋轉後的結果回填至原矩陣。

此策略使每層的處理時間正比於其周長，整體效率最優且邏輯清晰。

## 解題步驟

### Step 1：初始化維度資訊與共用緩衝區

計算矩陣的列數、行數與總層數；層數取兩者中較小值的一半。
另外預先建立一個可重複使用的緩衝區，大小足以容納最外層（周長最大）的所有元素。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
const layerCount = (rowCount < columnCount ? rowCount : columnCount) >> 1;

// 可重複使用的型別化緩衝區，大小足以容納最外層的所有周長元素
const perimeterBuffer = new Int32Array(2 * (rowCount + columnCount));
```

### Step 2：逐層計算邊界與周長，並將周長元素讀入緩衝區

對每一層，先確定其上下左右邊界以及實際周長長度；
接著按逆時針方向（左列向下 → 底列向右 → 右列向上 → 頂列向左）依序將所有周長元素寫入緩衝區。

```typescript
for (let layer = 0; layer < layerCount; ++layer) {
  const topRow = layer;
  const bottomRow = rowCount - layer - 1;
  const leftColumn = layer;
  const rightColumn = columnCount - layer - 1;
  const layerHeight = bottomRow - topRow;
  const layerWidth = rightColumn - leftColumn;
  const perimeterLength = (layerHeight + layerWidth) << 1;

  // 依逆時針順序將周長元素讀入緩衝區
  let writeIndex = 0;
  // 左列向下（從頂列到底列的前一行）
  for (let row = topRow; row < bottomRow; ++row) {
    perimeterBuffer[writeIndex++] = grid[row][leftColumn];
  }
  // 底列向右（從左行到右行的前一列）
  const bottomGridRow = grid[bottomRow];
  for (let column = leftColumn; column < rightColumn; ++column) {
    perimeterBuffer[writeIndex++] = bottomGridRow[column];
  }
  // 右列向上（從底列到頂列的後一行）
  for (let row = bottomRow; row > topRow; --row) {
    perimeterBuffer[writeIndex++] = grid[row][rightColumn];
  }
  // 頂列向左（從右行到左行的後一列）
  const topGridRow = grid[topRow];
  for (let column = rightColumn; column > leftColumn; --column) {
    perimeterBuffer[writeIndex++] = topGridRow[column];
  }

  // ...
}
```

### Step 3：計算有效位移量並設定讀取起始指標

對周長長度取模，得出實際需要位移的步數；
由於每個元素往逆時針方向移動 `effectiveShift` 格，讀取起始點應從 `perimeterLength - effectiveShift` 開始；
當位移量為 0 時，起始點恰好等於周長長度，需歸零修正。

```typescript
for (let layer = 0; layer < layerCount; ++layer) {
  // Step 2：計算邊界、周長並讀入緩衝區

  // 此層的有效旋轉次數
  const effectiveShift = k % perimeterLength;
  // 每個元素移至其逆時針相鄰位置，因此位置 i 的值來自位置 (i - shift)
  // 起始讀取指標為 (perimeterLength - effectiveShift)，位移為零時歸零
  let readIndex = perimeterLength - effectiveShift;
  if (readIndex === perimeterLength) {
    readIndex = 0;
  }

  // ...
}
```

### Step 4：依相同順序將緩衝區內容寫回矩陣，並以邊界歸零取代取模

沿與讀取相同的逆時針方向，逐一將緩衝區的值寫回原矩陣對應位置；
每寫入一個元素後，讀取指標加一，並在抵達緩衝區尾端時直接歸零，避免每步取模的額外開銷。

```typescript
for (let layer = 0; layer < layerCount; ++layer) {
  // Step 2：計算邊界、周長並讀入緩衝區

  // Step 3：計算有效位移量並設定讀取起始指標

  // 走訪周長寫回元素；以廉價的邊界歸零取代逐元素取模
  // 左列向下
  for (let row = topRow; row < bottomRow; ++row) {
    grid[row][leftColumn] = perimeterBuffer[readIndex];
    ++readIndex;
    // 到達緩衝區尾端時歸零
    if (readIndex === perimeterLength) {
      readIndex = 0;
    }
  }
  // 底列向右
  for (let column = leftColumn; column < rightColumn; ++column) {
    bottomGridRow[column] = perimeterBuffer[readIndex];
    ++readIndex;
    if (readIndex === perimeterLength) {
      readIndex = 0;
    }
  }
  // 右列向上
  for (let row = bottomRow; row > topRow; --row) {
    grid[row][rightColumn] = perimeterBuffer[readIndex];
    ++readIndex;
    if (readIndex === perimeterLength) {
      readIndex = 0;
    }
  }
  // 頂列向左
  for (let column = rightColumn; column > leftColumn; --column) {
    topGridRow[column] = perimeterBuffer[readIndex];
    ++readIndex;
    if (readIndex === perimeterLength) {
      readIndex = 0;
    }
  }
}
```

### Step 5：回傳就地修改完成的矩陣

所有層處理完畢後，原矩陣已就地更新，直接回傳即可。

```typescript
return grid;
```

## 時間複雜度

- 共有 $O(\min(m, n))$ 層，每層處理時間正比於其周長；
- 所有層的周長總和等於矩陣元素總數，即 $O(m \cdot n)$；
- 每個元素恰好被讀取一次並寫回一次，操作為線性。
- 總時間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$

## 空間複雜度

- 使用一個大小為 $O(m + n)$ 的緩衝區儲存最外層周長元素；
- 其餘皆為固定數量的變數，無額外動態空間。
- 總空間複雜度為 $O(m + n)$。

> $O(m + n)$
