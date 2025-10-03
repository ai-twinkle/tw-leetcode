# 407. Trapping Rain Water II

Given an `m x n` integer matrix `heightMap` representing the height of each unit cell in a 2D elevation map,  
return the volume of water it can trap after raining.

**Constraints:**

- `m == heightMap.length`
- `n == heightMap[i].length`
- `1 <= m, n <= 200`
- `0 <= heightMap[i][j] <= 2 * 10^4`

## 基礎思路

本題要求在一個二維高度地圖中，計算雨水可以被困住的總量。
問題的本質是：**每個位置能困住的水量取決於它周圍邊界的最小高度**。

若僅從單點觀察，需知道「從外圍邊界向內推進時，某格能被填充的最高水位」。這使問題轉化為一種**由外而內的最小邊界擴展**。

思考時需注意幾點：

* **邊界限制**：矩陣邊緣的格子一定無法存水，因為水會外洩；計算應從邊界開始往內推。
* **水位高度**：某格最終水位高度取決於它周圍的最低邊界，而非自身高度。
* **搜尋策略**：適合採用「最小堆 / 優先隊列」或等價結構，由最矮的邊界開始擴展，逐步更新內部格子的可能水位。
* **空間優化**：由於高度上限僅 $2 \times 10^4$，可以用 **bucket（高度桶）+ 鏈結陣列** 來模擬優先隊列，降低常數開銷。

解題策略如下：

1. **初始化邊界**：將邊界格子視為初始「牆」，加入結構並標記訪問。
2. **由外向內擴展**：每次從當前最低高度的邊界格子開始，向鄰居傳遞「水位」。
3. **更新水量**：若鄰居比當前水位低，表示可蓄水，水量為「水位 - 高度」。
4. **維護水位**：若鄰居較高，則其自身高度成為新的邊界。
5. **重複直至處理完所有格子**。

## 解題步驟

### Step 1：基礎變數與特殊情況處理

若矩陣過小（小於 3x3），無法形成內部蓄水區，直接返回 0。

```typescript
// 矩陣行列數
const rowCount = heightMap.length;
const columnCount = heightMap[0].length;

// 特例：若行或列小於 3，無法蓄水，直接返回 0
if (rowCount < 3 || columnCount < 3) {
  return 0;
}
```

### Step 2：初始化平坦化存儲結構

將二維矩陣轉為一維陣列，並記錄每個格子的 row/column，方便計算。

```typescript
const cellCount = rowCount * columnCount;

// 使用 TypedArray 優化：高度、是否訪問、桶鏈結等
const cellHeights = new Int32Array(cellCount);
const visitedCells = new Uint8Array(cellCount);
const bucketHead = new Int32Array(MAX_HEIGHT + 1).fill(-1);
const nextCellLink = new Int32Array(cellCount);
const rowOfCell = new Uint16Array(cellCount);
const columnOfCell = new Uint16Array(cellCount);

// 平坦化輸入矩陣，並預先存 row/col 資訊
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const rowReference = heightMap[rowIndex];
  const baseIndex = rowIndex * columnCount;
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const flatIndex = baseIndex + columnIndex;
    cellHeights[flatIndex] = rowReference[columnIndex] | 0;
    rowOfCell[flatIndex] = rowIndex;
    columnOfCell[flatIndex] = columnIndex;
  }
}
```

### Step 3：定義推入高度桶的方法

用「高度 → 鏈結表」的結構維護 bucket。

```typescript
// 將格子推入對應高度桶
const pushToBucket = (height: number, flatIndex: number): void => {
  nextCellLink[flatIndex] = bucketHead[height];
  bucketHead[height] = flatIndex;
};
```

### Step 4：初始化邊界作為起始牆

所有邊界格子都是初始水牆，推入結構並標記訪問。

```typescript
let minimumBoundaryHeight = MAX_HEIGHT;
let queueCount = 0;

// 將邊界格子加入 bucket 並標記訪問
const enqueueBoundary = (flatIndex: number): void => {
  if (visitedCells[flatIndex] === 0) {
    visitedCells[flatIndex] = 1;
    const cellHeight = cellHeights[flatIndex];
    pushToBucket(cellHeight, flatIndex);
    if (cellHeight < minimumBoundaryHeight) {
      minimumBoundaryHeight = cellHeight;
    }
    queueCount++;
  }
};

// 上下邊界
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  enqueueBoundary(columnIndex); // 第一行
  enqueueBoundary((rowCount - 1) * columnCount + columnIndex); // 最後一行
}
// 左右邊界
for (let rowIndex = 1; rowIndex < rowCount - 1; rowIndex++) {
  enqueueBoundary(rowIndex * columnCount); // 第一列
  enqueueBoundary(rowIndex * columnCount + columnCount - 1); // 最後一列
}
```

### Step 5：從邊界開始進行擴展

維護當前水位，逐步從低高度向內部傳遞。

```typescript
let currentHeightLevel = minimumBoundaryHeight;
let totalTrappedWater = 0;

// 使用 bucket-based BFS 擴展
while (queueCount > 0) {
  // 找下一個非空的高度桶
  while (currentHeightLevel <= MAX_HEIGHT && bucketHead[currentHeightLevel] === -1) {
    currentHeightLevel++;
  }
  if (currentHeightLevel > MAX_HEIGHT) {
    break;
  }

  // 彈出當前桶的一個格子
  const flatIndex = bucketHead[currentHeightLevel];
  bucketHead[currentHeightLevel] = nextCellLink[flatIndex];
  queueCount--;

  const rowIndex = rowOfCell[flatIndex];
  const columnIndex = columnOfCell[flatIndex];
```

### Step 6：檢查四個方向鄰居並更新水量

若鄰居比當前水位低，表示能蓄水；否則更新邊界。

```typescript
  // 四個方向鄰居
  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    let neighborIndex: number | undefined;

    if (directionIndex === 0 && columnIndex + 1 < columnCount) {
      neighborIndex = flatIndex + 1;
    } else if (directionIndex === 1 && columnIndex > 0) {
      neighborIndex = flatIndex - 1;
    } else if (directionIndex === 2 && rowIndex + 1 < rowCount) {
      neighborIndex = flatIndex + columnCount;
    } else if (directionIndex === 3 && rowIndex > 0) {
      neighborIndex = flatIndex - columnCount;
    } else {
      continue;
    }

    // 已訪問過則略過
    if (visitedCells[neighborIndex] === 1) {
      continue;
    }
    visitedCells[neighborIndex] = 1;

    // 計算水量或更新邊界
    const neighborHeight = cellHeights[neighborIndex];
    if (currentHeightLevel > neighborHeight) {
      totalTrappedWater += currentHeightLevel - neighborHeight;
      pushToBucket(currentHeightLevel, neighborIndex);
    } else {
      pushToBucket(neighborHeight, neighborIndex);
    }
    queueCount++;
  }
}
```

### Step 7：返回結果

最後累計的水量即為答案。

```typescript
return totalTrappedWater;
```

## 時間複雜度

- 每個格子最多被訪問一次，總共 $m \times n$ 格子。
- 每次訪問僅做常數操作（桶推入/彈出）。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 額外儲存高度陣列、訪問標記、桶結構、鏈結表與索引，皆與格子數量等階。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
