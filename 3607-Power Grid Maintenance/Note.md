# 3607. Power Grid Maintenance

You are given an integer `c` representing `c` power stations, each with a unique identifier `id` from 1 to `c` (1‑based indexing).

These stations are interconnected via n bidirectional cables, represented by a 2D array connections, 
where each element `connections[i] = [u_i, v_i]` indicates a connection between station `u_i` and station `v_i`. 
Stations that are directly or indirectly connected form a power grid.

Initially, all stations are online (operational).

You are also given a 2D array `queries`, where each query is one of the following two types:

- `[1, x]`: A maintenance check is requested for station `x`. 
  If station `x` is online, it resolves the check by itself. 
  If station `x` is offline, the check is resolved by the operational station with the smallest `id` in the same power grid as `x`. 
  If no operational station exists in that grid, return -1.

- `[2, x]`: Station `x` goes offline (i.e., it becomes non-operational).

Return an array of integers representing the results of each query of type `[1, x]` in the order they appear.

Note: The power grid preserves its structure; an offline (non‑operational) node remains part of its grid and taking it offline does not alter connectivity.

**Constraints:**

- `1 <= c <= 10^5`
- `0 <= n == connections.length <= min(10^5, c * (c - 1) / 2)`
- `connections[i].length == 2`
- `1 <= u_i, v_i <= c`
- `u_i != v_i`
- `1 <= queries.length <= 2 * 10^5`
- `queries[i].length == 2`
- `queries[i][0]` is either `1` or `2`.
- `1 <= queries[i][1] <= c`

## 基礎思路

本題要我們模擬一個電網系統，支援「查詢維修」與「停機」操作，並且在大量節點與查詢下維持高效執行。

題意可歸納為：

1. 每個電站具有唯一 ID（1-based）。
2. 電站之間以雙向電纜連線，形成若干「電網（連通分量）」。
3. 每次查詢可能是：
    - **`[1, x]` 維修請求**：若 `x` 在線上，輸出 `x`；若 `x` 離線，輸出同一電網中最小編號的線上電站；若整網皆離線，輸出 `-1`。
    - **`[2, x]` 停機請求**：將電站 `x` 標記為離線。
4. 電網結構不會因停機而改變（停機不會斷線）。

在思考解法時，我們需關注幾個重點：

- **電網識別**：要能快速判斷兩電站是否屬於同一電網。
- **最小線上節點查找**：需能在某個電網內找到最小線上電站，且當節點停機後仍能有效更新。
- **高效查詢**：題目上限達 $2 \times 10^5$ 次查詢，必須避免逐次遍歷整個電網。

為達成以上要求，我們採取以下策略：

- **使用並查集（Union-Find）**：先將所有電站依照電纜連線合併成連通分量，確定每個電站所屬電網。
- **分量壓縮與排序**：將每個電網的電站以 ID 升序排列，並記錄每個電網的起訖區間位置。
- **指標維護**：對每個電網維護一個指標，指向目前最小的線上節點；若該節點停機，指標向後推進。
- **懶惰推進策略（Lazy advancement）**：只有當某電網被查詢或停機時才更新指標，避免重複掃描。

透過此設計，查詢與停機皆可在近似常數時間內完成，滿足題目的效能需求。

## 解題步驟

### Step 1：處理無電纜情況

若沒有任何電纜，所有電站皆獨立成網，查詢僅需判斷該站是否離線。

```typescript
// 若無任何連線，每個電站皆獨立，直接以單節點方式處理
if (edgeCount === 0) {
  const isOffline = new Uint8Array(stationCount + 1); // 標記每個電站是否離線
  const results: number[] = [];

  for (let i = 0; i < queries.length; i += 1) {
    const queryType = queries[i][0] | 0;
    const stationId = queries[i][1] | 0;

    if (queryType === 2) {
      // 將指定電站標記為離線
      isOffline[stationId] = 1;
      continue;
    }

    // 維修查詢：若在線上輸出自身，否則輸出 -1
    if (isOffline[stationId] === 0) {
      results.push(stationId);
    } else {
      results.push(-1);
    }
  }
  return results;
}
```

### Step 2：建立並查集

並查集（Union-Find）能快速判定兩節點是否屬於同一電網。

```typescript
// 建立並查集結構
const parent = new Int32Array(stationCount + 1);
const setSize = new Int32Array(stationCount + 1);

// 初始化：每個節點自成一組
for (let stationId = 1; stationId <= stationCount; stationId += 1) {
  parent[stationId] = stationId;
  setSize[stationId] = 1;
}

/**
 * 尋找節點的根節點（帶路徑壓縮）
 */
function findRoot(stationId: number): number {
  let current = stationId | 0;
  while (parent[current] !== current) {
    parent[current] = parent[parent[current]]; // 路徑壓縮
    current = parent[current];
  }
  return current;
}

/**
 * 合併兩個集合（按大小合併以保持樹淺）
 */
function mergeSets(firstStation: number, secondStation: number): void {
  let rootA = findRoot(firstStation);
  let rootB = findRoot(secondStation);

  if (rootA === rootB) return; // 已屬同一電網

  if (setSize[rootA] < setSize[rootB]) {
    const temp = rootA;
    rootA = rootB;
    rootB = temp;
  }

  parent[rootB] = rootA;
  setSize[rootA] += setSize[rootB];
}
```

### Step 3：合併所有連線

依序合併每條連線，將相連的電站合併為同一電網。

```typescript
// 根據連線建立電網結構
for (let i = 0; i < edgeCount; i += 1) {
  const u = connections[i][0] | 0;
  const v = connections[i][1] | 0;
  mergeSets(u, v);
}
```

### Step 4：壓縮電網索引

將每個根節點分配獨立的電網編號，建立「節點 → 電網」的對應關係。

```typescript
// 將每個電網根節點映射成獨立的電網編號
const rootToComponent = new Int32Array(stationCount + 1);
let componentCount = 0;

for (let stationId = 1; stationId <= stationCount; stationId += 1) {
  const root = findRoot(stationId);
  if (rootToComponent[root] === 0) {
    componentCount += 1;
    rootToComponent[root] = componentCount;
  }
}
```

### Step 5：建立每個電網的節點清單

依電網索引將電站排序並集中儲存，方便後續快速查詢最小線上節點。

```typescript
// 建立電網中電站的排序資訊
const stationToComponent = new Int32Array(stationCount + 1);
const orderedStations = new Int32Array(stationCount);
const componentSize = new Int32Array(componentCount + 1);

// 統計每個電網的節點數
for (let id = 1; id <= stationCount; id += 1) {
  const root = findRoot(id);
  const comp = rootToComponent[root];
  stationToComponent[id] = comp;
  componentSize[comp] += 1;
}

// 計算每個電網在 orderedStations 中的起訖位置（prefix sum）
const start = new Int32Array(componentCount + 1);
const end = new Int32Array(componentCount + 1);
let offset = 0;
for (let comp = 1; comp <= componentCount; comp += 1) {
  start[comp] = offset;
  offset += componentSize[comp];
  end[comp] = offset;
}
```

### Step 6：填入每個電網的節點並初始化指標

每個電網的節點在 `orderedStations` 內依 ID 升序排列，並為每個電網設置指標指向最小線上節點。

```typescript
// 每個電網的填寫游標
const writeCursor = new Int32Array(componentCount + 1);
for (let comp = 1; comp <= componentCount; comp += 1) {
  writeCursor[comp] = start[comp];
}

// 將節點依序填入 orderedStations
for (let id = 1; id <= stationCount; id += 1) {
  const comp = stationToComponent[id];
  const pos = writeCursor[comp];
  orderedStations[pos] = id;
  writeCursor[comp] = pos + 1;
}

// 初始化每個電網的指標
const pointer = new Int32Array(componentCount + 1);
for (let comp = 1; comp <= componentCount; comp += 1) {
  pointer[comp] = start[comp];
}
```

### Step 7：定義輔助函數

該函數用來在某電網內前進指標，跳過所有已離線節點。

```typescript
/**
 * 移動電網指標以跳過離線節點
 */
function movePointerForward(componentIndex: number): void {
  let p = pointer[componentIndex];
  const endPos = end[componentIndex];

  while (p < endPos) {
    const id = orderedStations[p];
    if (isOffline[id] === 0) break; // 找到線上節點
    p += 1;
  }
  pointer[componentIndex] = p;
}
```

### Step 8：處理所有查詢

根據查詢類型更新離線狀態或回傳維修結果。

```typescript
// 處理查詢
const isOffline = new Uint8Array(stationCount + 1);
const results: number[] = [];

for (let i = 0; i < queries.length; i += 1) {
  const type = queries[i][0] | 0;
  const id = queries[i][1] | 0;

  if (type === 2) {
    // 停機事件：標記離線並更新指標
    isOffline[id] = 1;
    const comp = stationToComponent[id];
    const p = pointer[comp];
    if (p < end[comp] && orderedStations[p] === id) {
      movePointerForward(comp);
    }
    continue;
  }

  // 維修查詢
  if (isOffline[id] === 0) {
    results.push(id); // 在線上，輸出自身
    continue;
  }

  // 離線：尋找同電網中最小的線上電站
  const comp = stationToComponent[id];
  movePointerForward(comp);
  const pNow = pointer[comp];
  if (pNow >= end[comp]) {
    results.push(-1); // 全電網離線
  } else {
    results.push(orderedStations[pNow]); // 回傳最小線上節點
  }
}
```

## 時間複雜度

- **預處理（並查集 + 佈局）**：
  建立 DSU 並合併所有連邊為 $O(m,\alpha(n))$，壓縮與分塊佈局為 $O(n)$。
  其中 $m$ 為電纜數，$n$ 為電站數，$\alpha$ 為阿克曼反函數。
- **線上查詢**：
  每個連通塊的游標總前移次數至多等於該塊站數，因此所有 `[1]` 與 `[2]` 操作的總攤銷時間為 $O(q + n)$。
  其中 $q$ 為查詢數。
- 總時間複雜度為 $O(n + m,\alpha(n) + q)$。

> $O(n + m,\alpha(n) + q)$

## 空間複雜度

- DSU 陣列、電網分塊、排序後站台、游標與離線標記陣列皆為線性規模。
- 需額外 $O(n)$ 儲存索引與輔助結構。
- 總空間複雜度為 $O(n)$。

> $O(n)$
