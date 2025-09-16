# 827. Making A Large Island

You are given an `n x n` binary matrix `grid`. 
You are allowed to change at most one `0` to be `1`.

Return the size of the largest island in `grid` after applying this operation.

An island is a 4-directionally connected group of `1`s.

**Constraints:**

- `n == grid.length`
- `n == grid[i].length`
- `1 <= n <= 500`
- `grid[i][j]` is either `0` or `1`.

## 基礎思路

在一個二元矩陣中，最大的島嶼是由相鄰（上下左右）且為 1 的格子所構成。
我們被允許將**最多一個 0 翻成 1**，目標是讓翻轉後的最大島嶼面積最大。

我們可以利用以下策略來解決這個問題：

1. **先為現有的所有島嶼編號並量測面積**：把每塊島嶼以唯一的 `id` 標上，並記錄 `id → 面積`，這樣未來嘗試把某個 0 翻成 1 時，就能 O(1) 取得四個方向相鄰島嶼的面積。
2. **對每個為 0 的格子試著翻轉**：翻轉後，該格會把**四個方向的不同島嶼**連接起來，合併面積就是 1（自己）加上四鄰不同 `id` 的島嶼面積總和。對所有 0 取最大值即為答案。
3. **邊界與早停**：若原矩陣沒有 0，答案就是整張圖；若過程中已達滿版（`n*n`），可提前結束。

這樣整個流程只需線性掃描與線性次數的合併計算，搭配**迭代式 flood‑fill**（避免遞迴爆棧），在時間與空間上都能符合約束。

## 解題步驟

### Step 1：初始化尺寸資訊與 1x1 特例

先抓出邊長與總格數；若是 1x1，翻與不翻結果都為 1，直接返回。

```typescript
const dimension = grid.length;
const totalCells = dimension * dimension;

// 1. 特例處理：處理最小的網格 (1x1)
if (totalCells === 1) {
  if (grid[0][0] === 1) {
    return 1;
  } else {
    return 1;
  }
}
```

### Step 2：建立平坦化陣列與統計零的數量（本步包含 for 迴圈）

將二維 `grid` 攤平成一維 `flatGrid` 以利 O(1) 存取與就地標記，同時統計 0 的數量，後續可進行早停判斷。

```typescript
// 2. 將 2D 網格攤平成 1D 型別陣列
const flatGrid = new Int32Array(totalCells);
let zeroCount = 0;

for (let row = 0; row < dimension; row++) {
  const rowBase = row * dimension;
  const rowArray = grid[row];

  for (let column = 0; column < dimension; column++) {
    const value = rowArray[column] | 0;
    flatGrid[rowBase + column] = value;

    if (value === 0) {
      zeroCount++;
    }
  }
}
```

### Step 3：沒有 0 的早停

若整張圖沒有 0，原本即為一座面積 `n*n` 的島嶼，直接回傳。

```typescript
// 3. 若網格沒有任何 0 → 已經是滿版島嶼
if (zeroCount === 0) {
  return totalCells;
}
```

### Step 4：以迭代式 flood‑fill 為每座島嶼編號並計算面積（本步包含 for 與 while）

使用 `islandId` 自 2 開始（避開 0/1），就地把所有值為 1 的連通區改成該 `id`，並在 `islandSizes` 中記下其面積；同時維護目前已知最大島嶼面積。

```typescript
// 4. 為島嶼標記編號並計算其大小（迭代式 DFS 洪泛填充）
const islandSizes = new Int32Array(totalCells + 2);
let islandId = 2;
let maximumIslandSize = 0;

// 預先配置堆疊以進行洪泛填充走訪
const stackRow = new Int32Array(totalCells);
const stackColumn = new Int32Array(totalCells);
let stackSize = 0;

for (let row = 0; row < dimension; row++) {
  const rowBase = row * dimension;

  for (let column = 0; column < dimension; column++) {
    const index = rowBase + column;

    if (flatGrid[index] !== 1) {
      continue;
    }

    // 開始探索一座新島嶼
    let currentSize = 0;
    stackRow[stackSize] = row;
    stackColumn[stackSize] = column;
    stackSize++;

    flatGrid[index] = islandId;

    // 使用堆疊進行洪泛填充
    while (stackSize > 0) {
      stackSize--;
      const currentRow = stackRow[stackSize];
      const currentColumn = stackColumn[stackSize];
      const currentBase = currentRow * dimension;
      currentSize++;

      // 向上探索
      if (currentRow > 0) {
        const upIndex = (currentRow - 1) * dimension + currentColumn;
        if (flatGrid[upIndex] === 1) {
          flatGrid[upIndex] = islandId;
          stackRow[stackSize] = currentRow - 1;
          stackColumn[stackSize] = currentColumn;
          stackSize++;
        }
      }

      // 向下探索
      if (currentRow + 1 < dimension) {
        const downIndex = (currentRow + 1) * dimension + currentColumn;
        if (flatGrid[downIndex] === 1) {
          flatGrid[downIndex] = islandId;
          stackRow[stackSize] = currentRow + 1;
          stackColumn[stackSize] = currentColumn;
          stackSize++;
        }
      }

      // 向左探索
      if (currentColumn > 0) {
        const leftIndex = currentBase + (currentColumn - 1);
        if (flatGrid[leftIndex] === 1) {
          flatGrid[leftIndex] = islandId;
          stackRow[stackSize] = currentRow;
          stackColumn[stackSize] = currentColumn - 1;
          stackSize++;
        }
      }

      // 向右探索
      if (currentColumn + 1 < dimension) {
        const rightIndex = currentBase + (currentColumn + 1);
        if (flatGrid[rightIndex] === 1) {
          flatGrid[rightIndex] = islandId;
          stackRow[stackSize] = currentRow;
          stackColumn[stackSize] = currentColumn + 1;
          stackSize++;
        }
      }
    }

    // 儲存此島嶼的面積
    islandSizes[islandId] = currentSize;
    if (currentSize > maximumIslandSize) {
      maximumIslandSize = currentSize;
    }

    islandId++;
  }
}
```

### Step 5：枚舉每個 0 嘗試翻轉並合併相鄰不同島嶼（本步包含 for）

現在對每個 0 位置，以「翻轉後為 1」的角度，收集上下左右的**不同**島嶼 `id` 並加總其面積（外加自己 1），更新最佳答案。若在過程中已達 `n*n`，即可提前返回。

```typescript
// 5. 嘗試將每個 0 翻成 1 並與相鄰島嶼合併
let bestResult = maximumIslandSize;

for (let row = 0; row < dimension; row++) {
  const rowBase = row * dimension;

  for (let column = 0; column < dimension; column++) {
    const index = rowBase + column;

    if (flatGrid[index] !== 0) {
      continue;
    }

    // 收集相鄰的島嶼編號
    const upId = row > 0 ? flatGrid[(row - 1) * dimension + column] : 0;
    const downId = row + 1 < dimension ? flatGrid[(row + 1) * dimension + column] : 0;
    const leftId = column > 0 ? flatGrid[index - 1] : 0;
    const rightId = column + 1 < dimension ? flatGrid[index + 1] : 0;

    // 候選島嶼面積（先加 1，代表翻轉的這一格）
    let candidateSize = 1;

    if (upId > 1) {
      candidateSize += islandSizes[upId];
    }

    if (rightId > 1 && rightId !== upId) {
      candidateSize += islandSizes[rightId];
    }

    if (downId > 1 && downId !== upId && downId !== rightId) {
      candidateSize += islandSizes[downId];
    }

    if (leftId > 1 && leftId !== upId && leftId !== rightId && leftId !== downId) {
      candidateSize += islandSizes[leftId];
    }

    // 更新最佳答案
    if (candidateSize > bestResult) {
      bestResult = candidateSize;

      // 若已達滿版則可提前返回
      if (bestResult === totalCells) {
        return bestResult;
      }
    }
  }
}
```

### Step 6：全部為 0 的處理與回傳

若先前沒有任何島嶼（`bestResult === 0`），翻 1 格所得為 1；否則回傳最佳結果。

```typescript
// 6. 若全為 0，翻一格可形成面積 1 的島嶼
if (bestResult === 0) {
  return 1;
}

return bestResult;
```

## 時間複雜度

- 島嶼編號與量測（flood‑fill）會走訪每個格子與每條邊各常數次，為 $O(n^2)$。
- 翻轉模擬：再次走訪每個格子，對 0 位置只看 4 個鄰居，為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用 `flatGrid`、`islandSizes`、以及堆疊陣列 `stackRow/stackColumn`，皆為與格子數同階的空間。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
