# 3342. Find Minimum Time to Reach Last Room II

There is a dungeon with `n x m` rooms arranged as a grid.

You are given a 2D array `moveTime` of size `n x m`, 
where `moveTime[i][j]` represents the minimum time in seconds 
when you can start moving to that room. 
You start from the room `(0, 0)` at time `t = 0` and can move to an adjacent room.
Moving between adjacent rooms takes one second for one move and two seconds for the next, alternating between the two.

Return the minimum time to reach the room `(n - 1, m - 1)`.

Two rooms are adjacent if they share a common wall, either horizontally or vertically.

**Constraints:**

- `2 <= n == moveTime.length <= 750`
- `2 <= m == moveTime[i].length <= 750`
- `0 <= moveTime[i][j] <= 10^9`

## 基礎思路

本題為圖論上的最短路徑問題，可以利用 Dijkstra 演算法解決。我們將整個迷宮抽象為一個圖：

- 房間視為圖的節點；
- 相鄰房間之間存在邊；
- 邊的權重為移動時間，根據題意，移動耗時在 1 秒與 2 秒間交替；
- 每個房間皆有一個最早可進入的時間點，若到達房間時小於該房間開放時間，則必須等待至開放後再進入。

最終目標是找到從房間 `(0, 0)` 到房間 `(n-1, m-1)` 的最短抵達時間。

## 解題步驟

### Step 1：資料預處理與初始化

首先，將房間開放時間與移動花費分別轉成一維陣列，方便快速訪問與處理。

- 將二維座標平面化，便於直接以索引值存取。
- 預計算每一步的移動花費（1 或 2 秒交替）。
- 使用 Int32Array 和 Uint8Array 儲存以減少記憶體消耗。

```typescript
const n = moveTime.length;
const m = moveTime[0].length;
const totalCells = n * m;

// 預計算房間開放時間和移動花費
const openTimeArray = new Int32Array(totalCells);
const stepCostArray = new Uint8Array(totalCells);

for (let rowIndex = 0; rowIndex < n; ++rowIndex) {
  const base = rowIndex * m;
  const rowArr = moveTime[rowIndex];

  for (let columnIndex = 0; columnIndex < m; ++columnIndex) {
    const idx = base + columnIndex;
    openTimeArray[idx] = rowArr[columnIndex] | 0; // 房間開放時間
    stepCostArray[idx] = ((rowIndex + columnIndex) & 1) + 1; // 交替移動花費
  }
}
```

### Step 2：距離與狀態初始化

- 建立 `distanceArray`，記錄從起點到每個房間的最短時間，初始為無限大，起點為 0。
- 建立 `visitedFlags`，記錄是否已計算過最短路徑。

```typescript
const INF = 0x7fffffff;
const distanceArray = new Int32Array(totalCells).fill(INF);
distanceArray[0] = 0; // 起始房間距離為 0
const visitedFlags = new Uint8Array(totalCells);
```

### Step 3：建構 Min-Heap 操作

實作最小堆，能快速取出目前最短距離的節點。

```typescript
const heapIndices = new Int32Array(totalCells + 1);
let heapSize = 0;

function pushHeap(nodeIndex: number) {
  let pos = ++heapSize;
  heapIndices[pos] = nodeIndex;
  
  // 向上調整
  while (pos > 1) {
    const parentPos = pos >>> 1;
    const parentIndex = heapIndices[parentPos];

    if (distanceArray[nodeIndex] >= distanceArray[parentIndex]) break;

    heapIndices[pos] = parentIndex;
    heapIndices[parentPos] = nodeIndex;
    pos = parentPos;
  }
}

function popHeap(): number {
  const top = heapIndices[1];
  const last = heapIndices[heapSize--];
  let pos = 1;
  
  // 向下調整
  while ((pos << 1) <= heapSize) {
    let childPos = pos << 1;
    const leftIndex = heapIndices[childPos];

    if (
      childPos + 1 <= heapSize &&
      distanceArray[heapIndices[childPos + 1]] < distanceArray[leftIndex]
    ) childPos++;

    const childIndex = heapIndices[childPos];
    if (distanceArray[last] <= distanceArray[childIndex]) break;

    heapIndices[pos] = childIndex;
    pos = childPos;
  }

  heapIndices[pos] = last;
  return top;
}
```

### Step 4：執行 Dijkstra 主循環（節點展開與邊鬆弛）

將起點放入堆中，開始進行節點訪問並鬆弛鄰近的邊。

```typescript
pushHeap(0);

while (heapSize > 0) {
  const currentIndex = popHeap();

  if (visitedFlags[currentIndex]) continue;
  if (currentIndex === totalCells - 1) break; // 抵達終點
  visitedFlags[currentIndex] = 1;

  const currentDistance = distanceArray[currentIndex];
  const rowIndex = (currentIndex / m) | 0;
  const columnIndex = currentIndex - rowIndex * m;
  const costForThisStep = stepCostArray[currentIndex];

  const relax = (neighbor: number) => {
    if (visitedFlags[neighbor]) return;

    let departTime = Math.max(currentDistance, openTimeArray[neighbor]);
    const arriveTime = departTime + costForThisStep;

    if (arriveTime < distanceArray[neighbor]) {
      distanceArray[neighbor] = arriveTime;
      pushHeap(neighbor);
    }
  };

  if (columnIndex + 1 < m) relax(currentIndex + 1);
  if (columnIndex > 0) relax(currentIndex - 1);
  if (rowIndex + 1 < n) relax(currentIndex + m);
  if (rowIndex > 0) relax(currentIndex - m);
}
```

### Step 5：返回最終結果

返回抵達終點 `(n-1, m-1)` 的最短時間。

```typescript
return distanceArray[totalCells - 1] === INF ? -1 : distanceArray[totalCells - 1];
```

## 時間複雜度

- 初始化及預處理所有房間：$O(n\times m)$。

- Dijkstra 演算法的最差情況，堆的操作時間為：$O((n\times m)\log(n\times m))$。

- 總時間複雜度為 $O((n\times m)\log(n\times m))$。

> $O((n\times m)\log(n\times m))$

## 空間複雜度

- `openTimeArray`、`stepCostArray`、`distanceArray`、`visitedFlags` 和 `heapIndices`，每個都是長度為 $n\times m$ 的陣列。

- 總空間複雜度為 $O(n\times m)$。

> $O(n\times m)$
