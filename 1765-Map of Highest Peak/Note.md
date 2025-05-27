# 1765. Map of Highest Peak

You are given an integer matrix `isWater` of size `m x n` that represents a map of land and water cells.

- If `isWater[i][j] == 0`, cell `(i, j)` is a land cell.
- If `isWater[i][j] == 1`, cell `(i, j)` is a water cell.

You must assign each cell a height in a way that follows these rules:

- The height of each cell must be non-negative.
- If the cell is a water cell, its height must be `0`.
- Any two adjacent cells must have an absolute height difference of at most `1`. 
- A cell is adjacent to another cell if the former is directly north, east, south, or west of the latter (i.e., their sides are touching).

Find an assignment of heights such that the maximum height in the matrix is maximized.

Return an integer matrix height of size `m x n` where `height[i][j]` is cell `(i, j)`'s height. 
If there are multiple solutions, return any of them.

**Constraints:**

- `m == isWater.length`
- `n == isWater[i].length`
- `1 <= m, n <= 1000`
- `isWater[i][j]` is `0` or `1`.
- There is at least one water cell.

It Is nearly the same as [542. 01 Matrix](../542-01%20Matrix/Note.md)

## 基礎思路

題目的核心要求是要為每個陸地格子指定一個適當的高度值，使得整個地圖符合以下條件：

- 水格高度必須為 $0$。
- 任意相鄰兩個格子的高度差最多只能是 $1$。
- 最終高度分配結果中，最大高度要盡可能地高。

若要達成最大高度這個目標，我們可以從以下觀察開始著手：

- 每個陸地格子的高度，會受距離最近水格子的距離所限制，因為水格高度固定為 $0$。
- 為了使高度盡量最大，陸地格子應該設定為「距離最近水格的最短距離」，這樣一來，從水格向外，高度才會逐步遞增，達到整體高度的最大化。
- 這個「最近距離」的問題，直觀來說，可以使用 BFS 來處理：從所有水格子同時向外拓展，直到覆蓋整個地圖為止。

但考量到題目的資料規模較大，單純的 BFS 可能需要較多額外空間。我們可以進一步思考：

- 是否能夠透過更有效率的方式取得每個格子到最近水格的距離？
- 如果能從地圖的邊界或是從特定方向依序掃描，並利用已經算出的高度值，推算出下一個格子的高度，將會更有效率且節省空間。

因此我們考慮以下策略：

- 先從左上到右下掃描一次地圖，考慮每個格子左邊和上方鄰居的影響。
- 再從右下到左上掃描一次地圖，補充考慮右邊與下方鄰居的影響。

經過這兩次方向互補的掃描，每個陸地格子便可得到最接近水源的最短距離，也就是我們想要設定的最大高度。

這個方式結合了動態規劃的思想，讓解法更簡潔、效率更高。

## 解題步驟

### Step 1：初始化變數並配置高度緩衝區

首先進行初始設定，計算必要的變數，並建立一個扁平化的高度緩衝區（flatHeightBuffer），用來儲存每個格子的高度，初始高度先設為一個較大的值（`maximumPossibleHeight`）：

```typescript
const rowCount = isWater.length;
if (rowCount === 0) {
  return [];
}

const columnCount = isWater[0].length;
const totalCells = rowCount * columnCount;
const maximumPossibleHeight = rowCount + columnCount;

// 1. 配置並初始化一維高度緩衝區
const flatHeightBuffer = new Int16Array(totalCells);
flatHeightBuffer.fill(maximumPossibleHeight);
```

### Step 2：第一次掃描，從左上到右下更新高度

我們由左上角向右下角掃描每個格子：

- 若目前格子為水格 (`isWater[rowIndex][columnIndex] == 1`)，直接設定高度為 0。
- 若目前格子是陸地格，則依照來自上方及左方格子的高度，更新為最小可能高度值。

```typescript
let currentIndex = 0;
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const waterRow = isWater[rowIndex];
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, currentIndex++) {
    if (waterRow[columnIndex] === 1) {
      flatHeightBuffer[currentIndex] = 0;
    } else {
      let bestHeight = flatHeightBuffer[currentIndex];

      // 來自上方格子
      if (rowIndex > 0) {
        const heightFromAbove = flatHeightBuffer[currentIndex - columnCount] + 1;
        if (heightFromAbove < bestHeight) {
          bestHeight = heightFromAbove;
        }
      }

      // 來自左方格子
      if (columnIndex > 0) {
        const heightFromLeft = flatHeightBuffer[currentIndex - 1] + 1;
        if (heightFromLeft < bestHeight) {
          bestHeight = heightFromLeft;
        }
      }

      flatHeightBuffer[currentIndex] = bestHeight;
    }
  }
}
```

### Step 3：第二次掃描，從右下到左上更新高度

由右下角向左上角再次掃描整個矩陣：

- 對每個格子，再次考慮來自右方和下方鄰居的高度值，更新為最小可能高度。

```typescript
currentIndex = totalCells - 1;
for (let rowIndex = rowCount - 1; rowIndex >= 0; rowIndex--) {
  for (let columnIndex = columnCount - 1; columnIndex >= 0; columnIndex--, currentIndex--) {
    let bestHeight = flatHeightBuffer[currentIndex];

    // 來自下方格子
    if (rowIndex < rowCount - 1) {
      const heightFromBelow = flatHeightBuffer[currentIndex + columnCount] + 1;
      if (heightFromBelow < bestHeight) {
        bestHeight = heightFromBelow;
      }
    }

    // 來自右方格子
    if (columnIndex < columnCount - 1) {
      const heightFromRight = flatHeightBuffer[currentIndex + 1] + 1;
      if (heightFromRight < bestHeight) {
        bestHeight = heightFromRight;
      }
    }

    flatHeightBuffer[currentIndex] = bestHeight;
  }
}
```

### Step 4：將一維緩衝區轉換回二維結果矩陣

最後將一維的高度緩衝區轉換回二維的結果矩陣後返回。

```typescript
const heightMatrix: number[][] = new Array(rowCount);
let writeIndex = 0;
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const resultRow = new Array<number>(columnCount);
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, writeIndex++) {
    resultRow[columnIndex] = flatHeightBuffer[writeIndex];
  }
  heightMatrix[rowIndex] = resultRow;
}

return heightMatrix;
```

## 時間複雜度

- 需進行兩次完整掃描整個矩陣（Step 2 與 Step 3），每次掃描均為 $O(m \times n)$。
- 另外還需額外一次迴圈將結果轉回二維矩陣，同為 $O(m \times n)$。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 使用了一個大小為 $m \times n$ 的扁平緩衝區 (`flatHeightBuffer`) 存儲高度資訊。
- 最後結果矩陣也需要 $m \times n$ 空間。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
