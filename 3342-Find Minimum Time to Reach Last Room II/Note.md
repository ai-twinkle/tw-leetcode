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

- 將二維座標平面化，便於直接以索引值存取；
- 預計算每一步的移動花費（1 或 2 秒交替）；
- 使用 `Int32Array` 和 `Uint8Array` 儲存，以節省記憶體開銷。

```typescript
const n = moveTime.length;
const m = moveTime[0].length;
const totalCells = n * m;

// 1. 準備房間開放時間與步伐花費陣列
const openTimeArray = new Int32Array(totalCells);
const stepCostArray = new Uint8Array(totalCells);

// 將二維陣列平面化並填充資料
for (let rowIndex = 0; rowIndex < n; ++rowIndex) {
  const base = rowIndex * m;
  const rowArr = moveTime[rowIndex];

  for (let columnIndex = 0; columnIndex < m; ++columnIndex) {
    const idx = base + columnIndex;
    openTimeArray[idx] = rowArr[columnIndex] | 0; // 儲存每格最早開放時間
    stepCostArray[idx] = ((rowIndex + columnIndex) & 1) + 1; // 根據座標奇偶性設定交替步伐花費
  }
}
```

### Step 2：距離與訪問狀態初始化

初始化最短路徑距離與是否訪問的標記：

```typescript
// 2. 初始化距離陣列與已訪問標記
const INF = 0x7fffffff;
const distanceArray = new Int32Array(totalCells).fill(INF);
distanceArray[0] = 0; // 起點距離設為 0
const visitedFlags = new Uint8Array(totalCells); // 初始皆未訪問
```

### Step 3：建構自訂的最小堆

自訂一個二元堆，用來高效地取得當前最短距離的節點。

```typescript
// 3. 建構自訂二元最小堆
const heapIndices = new Int32Array(totalCells + 1);
let heapSize = 0;

/**
 * 將節點推入堆中
 * @param nodeIndex {number} - 要加入的節點索引
 */
function pushHeap(nodeIndex: number) {
  let pos = ++heapSize;
  heapIndices[pos] = nodeIndex;
  // 向上冒泡以維護最小堆性質
  while (pos > 1) {
    const parentPos = pos >>> 1;
    const parentIndex = heapIndices[parentPos];

    if (distanceArray[nodeIndex] >= distanceArray[parentIndex]) break;

    heapIndices[pos] = parentIndex;
    heapIndices[parentPos] = nodeIndex;
    pos = parentPos;
  }
}

/**
 * 從堆中彈出最小距離節點
 * @returns {number} - 彈出的節點索引
 */
function popHeap(): number {
  const top = heapIndices[1];
  const last = heapIndices[heapSize--];
  let pos = 1;
  // 向下篩選以維護堆結構
  while ((pos << 1) <= heapSize) {
    let childPos = pos << 1;
    const leftIndex = heapIndices[childPos];

    // 選取左右子中距離更小者
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

### Step 4：主循環 - 執行 Dijkstra 演算法

將起點推入堆中，進行節點的提取與鄰居的鬆弛操作。

```typescript
// 將起點加入堆中
pushHeap(0);

// 4. 主循環：提取堆頂並鬆弛鄰居
while (heapSize > 0) {
  const currentIndex = popHeap();

  // 若已訪問，則跳過
  if (visitedFlags[currentIndex]) continue;

  // 若抵達終點，則提前結束
  if (currentIndex === totalCells - 1) break;

  // 標記為已訪問
  visitedFlags[currentIndex] = 1;

  // 計算目前格子的 row/column 與移動花費
  const currentDistance = distanceArray[currentIndex];
  const rowIndex = (currentIndex / m) | 0;
  const columnIndex = currentIndex - rowIndex * m;
  const costForThisStep = stepCostArray[currentIndex];

  /**
   * 鬆弛到相鄰格子的邊
   * @param neighbor {number} - 鄰居格子的索引
   */
  const relax = (neighbor: number) => {
    if (visitedFlags[neighbor]) return;

    // 計算出發時間（可能需要等待開放）
    let departTime = currentDistance;
    const openTime = openTimeArray[neighbor];
    if (departTime < openTime) {
      departTime = openTime;
    }

    // 抵達時間為出發時間加移動步伐花費
    const arriveTime = departTime + costForThisStep;

    // 若可以更新最短路徑，則更新並推入堆中
    if (arriveTime < distanceArray[neighbor]) {
      distanceArray[neighbor] = arriveTime;
      pushHeap(neighbor);
    }
  };

  // 鬆弛四個方向（上下左右）
  if (columnIndex + 1 < m) relax(currentIndex + 1);
  if (columnIndex > 0) relax(currentIndex - 1);
  if (rowIndex + 1 < n) relax(currentIndex + m);
  if (rowIndex > 0) relax(currentIndex - m);
}
```

### Step 5：返回最終結果

返回到達終點的最短時間，若無法抵達則返回 -1。

```typescript
const result = distanceArray[totalCells - 1];
return result === INF ? -1 : result;
```

## 時間複雜度

- **初始化與預處理**：平面化與填表操作為 $O(n\times m)$；

- **Dijkstra 演算法**：每個節點最多進堆與出堆一次，每次堆操作為 $O(\log(n\times m))$，總計 $O((n\times m)\log(n\times m))$。

- 總時間複雜度為 $O((n\times m)\log(n\times m))$。

> $O((n\times m)\log(n\times m))$

## 空間複雜度

- `openTimeArray`、`stepCostArray`、`distanceArray`、`visitedFlags`、`heapIndices` 都為長度 $n\times m$ 的陣列；

- 總空間複雜度為 $O(n\times m)$。

> $O(n\times m)$
