# 3454. Separate Squares II

You are given a 2D integer array `squares`. 
Each `squares[i] = [x_i, y_i, l_i]` represents the coordinates of the bottom-left point and the side length of a square parallel to the x-axis.

Find the minimum y-coordinate value of a horizontal line such that the total area covered by squares above the line equals the total area covered by squares below the line.

Answers within `10^-5` of the actual answer will be accepted.

Note: Squares may overlap. 
Overlapping areas should be counted only once in this version.

**Constraints:**

- `1 <= squares.length <= 5 * 10^4`
- `squares[i] = [x_i, y_i, l_i]`
- `squares[i].length == 3`
- `0 <= x_i, y_i <= 10^9`
- `1 <= l_i <= 10^9`
- The total area of all the squares will not exceed `10^15`.

## 基礎思路

本題給定多個與 x 軸平行的正方形（可能重疊），要找一條水平線 `y = Y`，使得「線上方的聯集面積」等於「線下方的聯集面積」。因為重疊區域只能算一次，所以我們處理的是**多矩形（正方形）聯集面積**的切割問題。

在思考解法時，需要注意幾個核心觀察：

* **面積隨 Y 單調遞增**：當水平線從下往上移動，線下方的聯集面積只會增加不會減少，因此存在一個最小的 `Y` 使得線下面積達到總面積的一半。
* **聯集面積可用掃描線計算**：把每個正方形視為在 y 方向的「進入/離開事件」，在相鄰事件的 y 區間（strip）內，活躍圖形集合固定，因此該 strip 的聯集面積 =（當前 x 方向聯集覆蓋長度）×（strip 高度）。
* **x 聯集覆蓋長度需要動態維護**：在掃描過程中，會不斷加入/移除 x 區間，因此需要一個能支援區間加減覆蓋、並能回報目前聯集覆蓋總長度的結構（典型作法是線段樹 + 座標壓縮）。
* **找切割線可二次掃描或一次記錄 strip**：先算出總聯集面積，再找最早讓累積面積達到一半的 y。若在第一次掃描時把每個 strip 的 `(起始 y, 高度, 覆蓋 x 長度)` 記錄下來，就能用一次前向掃描精確定位答案。

因此整體策略是：

1. **x 座標壓縮**：收集所有正方形的左右 x 端點，排序去重，將連續區間變成索引段。
2. **y 事件掃描線**：每個正方形產生兩個事件（進入、離開），按 y 排序。
3. **線段樹維護 x 聯集長度**：每次事件更新對應 x 索引區間的覆蓋次數，根節點即為目前聯集覆蓋長度。
4. **計算總面積並記錄 strips**：掃描累積 strip 面積得到總面積，同時記錄 strip 資訊。
5. **找 half-area 的最小 y**：對 strips 累積面積，找到第一個跨過 half 的 strip，用線性插值求出精確 y。

## 解題步驟

### Step 1：收集 x 端點並排序

先收集每個正方形的 `xStart` 與 `xStart + sideLength`，用於後續座標壓縮。排序後才能去重。

```typescript
const squareCount = squares.length;
const eventCount = squareCount << 1;

// 收集 x 端點以便做座標壓縮
const xEndpoints: number[] = new Array(eventCount);
for (let squareIndex = 0, writeIndex = 0; squareIndex < squareCount; squareIndex++) {
  const square = squares[squareIndex];
  const xStart = square[0];
  const sideLength = square[2];

  xEndpoints[writeIndex] = xStart;
  writeIndex++;

  xEndpoints[writeIndex] = xStart + sideLength;
  writeIndex++;
}
xEndpoints.sort((leftValue, rightValue) => leftValue - rightValue);
```

### Step 2：建立去重後的 uniqueX

排序後線性掃描去重，得到壓縮座標陣列 `uniqueX`。接著可得段數 `segmentCount = uniqueX.length - 1`。

```typescript
// 排序後建立去重的 x 座標
const uniqueX: number[] = [];
let lastValue = NaN;
for (let endpointIndex = 0; endpointIndex < xEndpoints.length; endpointIndex++) {
  const value = xEndpoints[endpointIndex];
  if (value !== lastValue) {
    uniqueX.push(value);
    lastValue = value;
  }
}

const xPointCount = uniqueX.length;
const segmentCount = xPointCount - 1;
if (segmentCount <= 0) {
  return 0;
}
```

### Step 3：建立 xIndexMap（x 值到壓縮索引）

用 `Map` 將每個 x 座標映射到其在 `uniqueX` 中的位置，後面建事件時可 O(1) 找索引。

```typescript
// 將 x 座標映射到壓縮後的索引
const xIndexMap = new Map<number, number>();
for (let xIndex = 0; xIndex < xPointCount; xIndex++) {
  xIndexMap.set(uniqueX[xIndex], xIndex);
}
```

### Step 4：建立 y 掃描事件（typed arrays）

每個正方形產生兩個事件：

* `yStart`：進入（delta = +1）
* `yStart + sideLength`：離開（delta = -1）
  並存入 typed arrays 以降低物件開銷。

```typescript
// 用 TypedArray 儲存掃描事件，減少每個事件的物件開銷
const yValues = new Float64Array(eventCount);
const leftIndices = new Int32Array(eventCount);
const rightIndices = new Int32Array(eventCount);
const deltas = new Int8Array(eventCount);

for (let squareIndex = 0, eventIndex = 0; squareIndex < squareCount; squareIndex++) {
  const square = squares[squareIndex];
  const xStart = square[0];
  const yStart = square[1];
  const sideLength = square[2];

  const leftIndex = xIndexMap.get(xStart)!;
  const rightIndex = xIndexMap.get(xStart + sideLength)!;

  // 進入事件：在 yStart 對 x 區間加入覆蓋
  yValues[eventIndex] = yStart;
  leftIndices[eventIndex] = leftIndex;
  rightIndices[eventIndex] = rightIndex;
  deltas[eventIndex] = 1;
  eventIndex++;

  // 離開事件：在 yStart + sideLength 對同一 x 區間移除覆蓋
  yValues[eventIndex] = yStart + sideLength;
  leftIndices[eventIndex] = leftIndex;
  rightIndices[eventIndex] = rightIndex;
  deltas[eventIndex] = -1;
  eventIndex++;
}
```

### Step 5：事件依 y 排序（使用 order 陣列）

用 `order` 儲存事件索引，再按 `yValues` 排序，避免搬動多個 typed arrays。

```typescript
// 用索引陣列排序事件（依 y 座標）
const order: number[] = new Array(eventCount);
for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
  order[eventIndex] = eventIndex;
}
order.sort((leftEventId, rightEventId) => yValues[leftEventId] - yValues[rightEventId]);
```

### Step 6：建立線段樹結構與迭代更新工具 updateRange

線段樹維護「目前活躍 x 區間的聯集覆蓋總長度」。
`coverCount[node] > 0` 表示此節點全覆蓋，其覆蓋長度可直接由 `uniqueX[nodeRight] - uniqueX[nodeLeft]` 得到；否則由子節點加總。
更新採用迭代堆疊以避免遞迴。

```typescript
// 線段樹：維護活躍區間在 x 軸上的聯集覆蓋長度
const treeSize = (segmentCount << 2) + 8;
const coverCount = new Int32Array(treeSize);
const coveredLength = new Float64Array(treeSize);

// 用迭代堆疊實作區間更新，避免遞迴
const nodeStack = new Int32Array(96);
const leftStack = new Int32Array(96);
const rightStack = new Int32Array(96);
const stateStack = new Int8Array(96);

/**
 * 對壓縮後的 x 索引區間 [queryLeft, queryRight) 套用覆蓋增量。
 *
 * @param queryLeft - 壓縮座標的左邊界索引
 * @param queryRight - 壓縮座標的右邊界索引
 * @param delta - +1 表示加入覆蓋，-1 表示移除覆蓋
 * @returns void
 */
function updateRange(queryLeft: number, queryRight: number, delta: number): void {
  if (queryLeft >= queryRight) {
    return;
  }

  // 從根節點開始（涵蓋 [0, segmentCount)）
  let stackPointer = 0;
  nodeStack[stackPointer] = 1;
  leftStack[stackPointer] = 0;
  rightStack[stackPointer] = segmentCount;
  stateStack[stackPointer] = 0;
  stackPointer++;

  while (stackPointer > 0) {
    stackPointer--;

    const node = nodeStack[stackPointer];
    const nodeLeft = leftStack[stackPointer];
    const nodeRight = rightStack[stackPointer];
    const state = stateStack[stackPointer];

    if (state !== 0) {
      // 依 coverCount 或子節點重新計算 coveredLength[node]
      if (coverCount[node] > 0) {
        coveredLength[node] = uniqueX[nodeRight] - uniqueX[nodeLeft];
      } else if (nodeRight - nodeLeft === 1) {
        coveredLength[node] = 0;
      } else {
        const leftChild = node << 1;
        coveredLength[node] = coveredLength[leftChild] + coveredLength[leftChild | 1];
      }
      continue;
    }

    // 不與查詢區間相交則略過
    if (queryRight <= nodeLeft || nodeRight <= queryLeft) {
      continue;
    }

    // 完全覆蓋：更新 coverCount 並刷新 coveredLength
    if (queryLeft <= nodeLeft && nodeRight <= queryRight) {
      coverCount[node] += delta;

      if (coverCount[node] > 0) {
        coveredLength[node] = uniqueX[nodeRight] - uniqueX[nodeLeft];
      } else if (nodeRight - nodeLeft === 1) {
        coveredLength[node] = 0;
      } else {
        const leftChild = node << 1;
        coveredLength[node] = coveredLength[leftChild] + coveredLength[leftChild | 1];
      }
      continue;
    }

    // 葉節點：只需處理自身 coverCount
    if (nodeRight - nodeLeft === 1) {
      coverCount[node] += delta;
      coveredLength[node] = coverCount[node] > 0 ? uniqueX[nodeRight] - uniqueX[nodeLeft] : 0;
      continue;
    }

    // 安排回溯時重新計算
    nodeStack[stackPointer] = node;
    leftStack[stackPointer] = nodeLeft;
    rightStack[stackPointer] = nodeRight;
    stateStack[stackPointer] = 1;
    stackPointer++;

    const splitIndex = (nodeLeft + nodeRight) >> 1;
    const leftChild = node << 1;

    // 先推右子節點，確保左子節點先被處理（堆疊 LIFO）
    nodeStack[stackPointer] = leftChild | 1;
    leftStack[stackPointer] = splitIndex;
    rightStack[stackPointer] = nodeRight;
    stateStack[stackPointer] = 0;
    stackPointer++;

    nodeStack[stackPointer] = leftChild;
    leftStack[stackPointer] = nodeLeft;
    rightStack[stackPointer] = splitIndex;
    stateStack[stackPointer] = 0;
    stackPointer++;
  }
}
```

### Step 7：掃描線前置 — 記錄 strips 並計算總聯集面積

我們在 y 軸掃描時，對每個相鄰事件 y 區間形成一個 strip，記錄：

* strip 起始 y
* strip 高度 deltaY
* 當前 x 聯集覆蓋長度 coveredX

同時計算總聯集面積 `totalArea`，後續再找 half-area 的切割點。

```typescript
// 記錄 y-strip，便於後續一次掃描找到 half-area 的切割點
const stripStartY = new Float64Array(eventCount);
const stripDeltaY = new Float64Array(eventCount);
const stripCoveredX = new Float64Array(eventCount);

let stripCount = 0;
let orderIndex = 0;

// 先套用最低 y 的所有事件
let currentY = yValues[order[0]];
while (orderIndex < eventCount && yValues[order[orderIndex]] === currentY) {
  const eventId = order[orderIndex];
  updateRange(leftIndices[eventId], rightIndices[eventId], deltas[eventId]);
  orderIndex++;
}

let totalArea = 0;

while (orderIndex < eventCount) {
  const nextY = yValues[order[orderIndex]];
  const deltaY = nextY - currentY;
  const coveredX = coveredLength[1];

  // 保存當前 strip（供後續 half-area 搜尋）
  stripStartY[stripCount] = currentY;
  stripDeltaY[stripCount] = deltaY;
  stripCoveredX[stripCount] = coveredX;
  stripCount++;

  // 用此 strip 的覆蓋長度累加聯集面積
  if (coveredX !== 0 && deltaY !== 0) {
    totalArea += coveredX * deltaY;
  }

  currentY = nextY;

  // 套用新 y 上的所有事件
  while (orderIndex < eventCount && yValues[order[orderIndex]] === currentY) {
    const eventId = order[orderIndex];
    updateRange(leftIndices[eventId], rightIndices[eventId], deltas[eventId]);
    orderIndex++;
  }
}
```

### Step 8：處理總面積為 0 的特例並計算 halfArea

若聯集面積為 0（理論上可能出現退化情況），按程式定義回傳最低 y。

```typescript
const lowestY = yValues[order[0]];
if (totalArea === 0) {
  return lowestY;
}

const halfArea = totalArea * 0.5;
```

### Step 9：掃描 strips 找到最小 y（線性插值定位）

依序累加 `areaBelow`，找到第一個使得累積面積達到 `halfArea` 的 strip。
若在某 strip 內跨過 halfArea，答案為：
`startY + (halfArea - areaBelow) / coveredX`。

```typescript
// 掃描 strips 找到最早使面積達到 halfArea 的 y
let areaBelow = 0;
for (let stripIndex = 0; stripIndex < stripCount; stripIndex++) {
  const startY = stripStartY[stripIndex];
  const deltaY = stripDeltaY[stripIndex];
  const coveredX = stripCoveredX[stripIndex];

  if (coveredX !== 0 && deltaY !== 0) {
    const stripArea = coveredX * deltaY;
    if (areaBelow + stripArea >= halfArea) {
      return startY + (halfArea - areaBelow) / coveredX;
    }
    areaBelow += stripArea;
    continue;
  }

  // 處理退化 strip，仍需確保回傳最小 y
  if (areaBelow >= halfArea) {
    return startY;
  }
}

return currentY;
```

## 時間複雜度

- 設 $n = squares.length$，事件數為 $2n$；壓縮後的 x 座標數為 $m = uniqueX.length$，且因為 `uniqueX` 由 `2n` 個端點去重而來，所以 **必有 $2 \le m \le 2n$**（當 `segmentCount > 0` 時）。
- 排序成本：
    - 排序 `xEndpoints`（長度 $2n$）：$O((2n)\log(2n))$
    - 排序 `order`（長度 $2n$）：$O((2n)\log(2n))$
    - 合併為 $O(n\log n)$（常數 2 與常數倍不影響大 O）。
- 掃描線更新成本：
    - 每個事件呼叫一次 `updateRange`，共 $2n$ 次。
    - `updateRange` 是線段樹上的區間更新，樹高為 $O(\log(segmentCount)) = O(\log(m-1))$，因此總更新為 $O(2n\log(m-1))$。
- 其餘（建表、去重、記錄 strip、掃描 strip）皆為線性：$O(n + m)$。
- 合併後時間複雜度為 $O(n\log n + n\log(m-1) + n + m)$，利用 $m \le 2n \Rightarrow \log(m-1) \le \log(2n)$，可進一步嚴格化簡為 $O(n\log n)$。
- 總時間複雜度為 $O(n\log n)$。

> $O(n \log n)$

## 空間複雜度

- 事件與 strip 相關陣列（長度皆為 $2n$）：$O(n)$。
- `uniqueX` 與 `xIndexMap`（大小 $m$）：$O(m)$，且 $m \le 2n$，所以為 $O(n)$。
- 線段樹陣列大小為 $O(m)$，因此也是 $O(n)$。
- 迭代堆疊固定大小（96），為 $O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
