# 3650. Minimum Cost Path with Edge Reversals

You are given a directed, weighted graph with `n` nodes labeled from 0 to `n - 1`, 
and an array edges where `edges[i] = [u_i, v_i, w_i]` represents a directed edge from node `u_i` to node `v_i` with cost `w_i`.

Each node `u_i` has a switch that can be used at most once: when you arrive at `u_i` and have not yet used its switch, 
you may activate it on one of its incoming edges `v_i → u_i` reverse that edge to `u_i → v_i` and immediately traverse it.

The reversal is only valid for that single move, and using a reversed edge costs `2 * w_i`.

Return the minimum total cost to travel from node 0 to node `n - 1`. 
If it is not possible, return -1.

**Constraints:**

- `2 <= n <= 5 * 10^4`
- `1 <= edges.length <= 10^5`
- `edges[i] = [u_i, v_i, w_i]`
- `0 <= u_i, v_i <= n - 1`
- `1 <= w_i <= 1000`

## 基礎思路

本題給定一張**有向加權圖**，但每個節點有一個「一次性開關」：當我們到達節點 `u` 時，若尚未用過 `u` 的開關，就可以選擇一條**進入 `u` 的邊 `v → u`**，把它在這一步**反轉成 `u → v`** 並立刻走過去，且反轉行走成本為 `2 * w`。目標是從 `0` 到 `n-1` 的最小總成本。

在思考解法時，我們需要注意幾個核心觀察：

* **反轉只影響單一步移動**：反轉並不會永久改變圖結構，因此不能把它當成「邊被改向後一直存在」。
* **反轉動作的使用時機固定**：反轉一定發生在「抵達某節點」的當下，且只能用該節點的開關一次。
* **所有成本皆為正**：原邊成本 `w` 與反轉成本 `2w` 皆為正，因此最短路徑可以使用 Dijkstra 類演算法處理。

我們可以使用以下策略來達成：

* **把一次性反轉視為額外可走邊**：對每條輸入邊 `u → v (w)`，除了原邊外，還額外允許在抵達 `v` 時「用 `v` 的開關反轉並走回 `u`」，這等價於在圖上加入一條 `v → u` 的邊，成本為 `2w`。
* **將問題轉為固定圖上的最短路徑**：把所有原邊與上述「可反轉走一步」的邊都加入轉換後圖，問題就變成在這張固定的加權有向圖上求 `0 → n-1` 的最短距離。
* **使用 Dijkstra 求解**：由於所有邊權為正，Dijkstra 能正確求得最短路徑；搭配高效的鄰接結構與最小堆以滿足大規模限制。

透過以上策略，我們可以在不動態修改圖的情況下，把「一次性反轉」完全納入邊集合中，並以標準最短路徑方法求得答案。

## 解題步驟

### Step 1：初始化圖規模與壓縮鄰接串列結構

建立 `(n)` 個 head，並用三個 typed arrays 存放所有弧（to / weight / next），以 `arcIndex` 逐一插入。

```typescript
// 圖的邊數與轉換後弧容量
const edgeCount = edges.length;
const arcCapacity = edgeCount * 2;

// 使用 TypedArray 的壓縮鄰接串列，加速遍歷並降低額外開銷
const adjacencyHead = new Int32Array(n);
adjacencyHead.fill(-1);
const adjacencyTo = new Int32Array(arcCapacity);
const adjacencyWeight = new Int32Array(arcCapacity);
const adjacencyNext = new Int32Array(arcCapacity);
let arcIndex = 0;
```

### Step 2：輔助函式 `addArc` — 插入一條有向弧

把弧資料寫入三個陣列，並用 `adjacencyNext` 串起同一個 `fromNode` 的鏈結。

```typescript
/**
 * 在壓縮鄰接結構中加入一條有向弧。
 *
 * @param fromNode - 起點節點
 * @param toNode - 終點節點
 * @param weight - 弧的成本
 */
function addArc(fromNode: number, toNode: number, weight: number): void {
  adjacencyTo[arcIndex] = toNode;
  adjacencyWeight[arcIndex] = weight;
  adjacencyNext[arcIndex] = adjacencyHead[fromNode];
  adjacencyHead[fromNode] = arcIndex;
  arcIndex++;
}
```

### Step 3：建立「轉換後圖」— 同時加入原邊與可反轉行走邊

對每條輸入邊 `u → v (w)`：

* 加入原邊 `u → v` 成本 `w`
* 加入反向可走弧 `v → u` 成本 `2w`

```typescript
// 遍歷所有輸入邊，建立轉換後圖
for (let index = 0; index < edgeCount; index++) {
  const edge = edges[index];
  const fromNode = edge[0];
  const toNode = edge[1];
  const weight = edge[2];

  // 加入原本的有向邊
  addArc(fromNode, toNode, weight);

  // 加入可反轉行走的一次性邊（成本加倍）
  addArc(toNode, fromNode, weight + weight);
}
```

### Step 4：初始化 Dijkstra 距離表

用 `Float64Array` 存每個節點的最短距離，初始為無限大，起點 `0` 為 `0`。

```typescript
// 初始化 Dijkstra 距離表為無限大
const infinityDistance = 1e30;
const distance = new Float64Array(n);
distance.fill(infinityDistance);
distance[0] = 0;
```

### Step 5：初始化二元最小堆的儲存結構

使用兩個陣列分別存節點與 key（距離），允許 stale entries，後續再用距離表過濾。

```typescript
// Dijkstra 的二元最小堆；允許舊的（stale）項目，之後再過濾
const heapNodes = new Int32Array(arcCapacity + 8);
const heapKeys = new Float64Array(arcCapacity + 8);
let heapSize = 0;
```

### Step 6：輔助函式 `heapPush` — 插入 (node, key) 並向上調整

插入後以 bubble-up 維持最小堆性質。

```typescript
/**
 * 將 (node, key) 插入最小堆。
 *
 * @param node - 節點 id
 * @param key - 當前暫定距離
 */
function heapPush(node: number, key: number): void {
  heapSize++;
  let position = heapSize;

  // 插入後向上調整，以恢復堆序
  while (position > 1) {
    const parentPosition = position >> 1;
    if (heapKeys[parentPosition] <= key) {
      break;
    }
    heapNodes[position] = heapNodes[parentPosition];
    heapKeys[position] = heapKeys[parentPosition];
    position = parentPosition;
  }

  heapNodes[position] = node;
  heapKeys[position] = key;
}
```

### Step 7：輔助函式 `heapPopNode` — 取出最小 key 的節點並向下調整

移除堆頂後，把最後元素放到頂端並 bubble-down 維持堆序。

```typescript
/**
 * 從堆中彈出 key 最小的節點。
 *
 * @return 具有最小 key 的節點 id
 */
function heapPopNode(): number {
  const rootNode = heapNodes[1];
  const lastNode = heapNodes[heapSize];
  const lastKey = heapKeys[heapSize];
  heapSize--;

  // 若堆已空，直接回傳唯一元素
  if (heapSize === 0) {
    return rootNode;
  }

  let position = 1;

  // 將最後元素向下調整，以恢復堆序
  while (true) {
    let childPosition = position << 1;
    if (childPosition > heapSize) {
      break;
    }
    if (childPosition + 1 <= heapSize && heapKeys[childPosition + 1] < heapKeys[childPosition]) {
      childPosition++;
    }
    if (heapKeys[childPosition] >= lastKey) {
      break;
    }
    heapNodes[position] = heapNodes[childPosition];
    heapKeys[position] = heapKeys[childPosition];
    position = childPosition;
  }

  heapNodes[position] = lastNode;
  heapKeys[position] = lastKey;
  return rootNode;
}
```

### Step 8：輔助函式 `heapPeekKey` — 讀取堆頂 key

堆頂 key 用來取得本次 pop 的距離值（配合 stale 過濾）。

```typescript
/**
 * 讀取目前堆頂的最小 key。
 *
 * @return 堆頂最小 key
 */
function heapPeekKey(): number {
  return heapKeys[1];
}
```

### Step 9：初始化起點並設定目標節點

把 `(0, 0)` 放入堆，並快取 `targetNode`。

```typescript
// 將起點放入堆以啟動 Dijkstra
heapPush(0, 0);

// 快取目標節點以加速比較
const targetNode = n - 1;
```

### Step 10：主迴圈（Dijkstra）— 反覆取出最短距離節點並鬆弛鄰邊

此處需要拆解迴圈內部邏輯，因此**保留最外層 while**，並用你指定的 Step 省略標記串接。

```typescript
// 持續執行 Dijkstra：直到堆空或找到目標
while (heapSize > 0) {
  const currentKey = heapPeekKey();
  const currentNode = heapPopNode();

  // 忽略 stale 的堆項目（已不是該節點的最短距離）
  if (currentKey !== distance[currentNode]) {
    continue;
  }

  // 一旦目標節點最短路徑確定，立即返回
  if (currentNode === targetNode) {
    return currentKey;
  }

  // 遍歷 currentNode 的所有外出弧
  for (let arc = adjacencyHead[currentNode]; arc !== -1; arc = adjacencyNext[arc]) {
    const neighborNode = adjacencyTo[arc];
    const newDistance = currentKey + adjacencyWeight[arc];

    // 若找到更短距離，更新並推入堆
    if (newDistance < distance[neighborNode]) {
      distance[neighborNode] = newDistance;
      heapPush(neighborNode, newDistance);
    }
  }
}
```

### Step 11：若目標不可達，回傳 -1

```typescript
// 若目標節點不可達，回傳 -1
return -1;
```

## 時間複雜度

- 令原始邊數為 $m = \text{edges.length}$，轉換後弧數為 $A = 2m$。
- 建圖插入 $A$ 條弧，每次插入為常數時間，合計為 $O(A)$。
- Dijkstra 中，每次成功鬆弛會執行一次 `heapPush`，鬆弛最多發生 $A$ 次，因此 `heapPush` 次數至多 $A + 1$（含起點）。
- `heapPopNode` 的次數不超過 `heapPush` 次數，因此也至多 $A + 1$ 次。
- 二元堆每次 `push/pop` 的時間為 $O(\log(A + 1))$。
- 總時間複雜度為 $O\big((A + 1)\log(A + 1) + A\big)$。

> $O\big((2m + 1)\log(2m + 1) + 2m\big)$

## 空間複雜度

- 鄰接結構 `adjacencyHead` 佔 $O(n)$。
- 弧資料 `adjacencyTo/adjacencyWeight/adjacencyNext` 各長度 $A$，合計 $O(A)$。
- 距離表 `distance` 佔 $O(n)$。
- 堆陣列 `heapNodes/heapKeys` 長度約 $A$，合計 $O(A)$。
- 總空間複雜度為 $O(n + A)$。

> $O(n + 2m)$
