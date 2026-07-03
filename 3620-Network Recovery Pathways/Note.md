# 3620. Network Recovery Pathways

You are given a directed acyclic graph of `n` nodes numbered from 0 to `n−1`. 
This is represented by a 2D array `edges` of length `m`, 
where `edges[i] = [u_i, v_i, cost_i]` indicates a one‑way communication from node `u_i` to node `v_i` with a recovery cost of `cost_i`.

Some nodes may be offline. 
You are given a boolean array `online` where `online[i] = true` means node `i` is online. 
Nodes 0 and `n−1` are always online.

A path from 0 to `n−1` is valid if:

- All intermediate nodes on the path are online.
- The total recovery cost of all edges on the path does not exceed `k`.

For each valid path, define its score as the minimum edge‑cost along that path.

Return the maximum path score (i.e., the largest minimum-edge cost) among all valid paths. 
If no valid path exists, return -1.

**Constraints:**

- `n == online.length`
- `2 <= n <= 5 * 10^4`
- `0 <= m == edges.length <= min(10^5, n * (n - 1) / 2)`
- `edges[i] = [u_i, v_i, cost_i]`
- `0 <= u_i, v_i < n`
- `u_i != v_i`
- `0 <= cost_i <= 10^9`
- `0 <= k <= 5 * 10^13`
- `online[i]` is either true or false, and both `online[0]` and `online[n − 1]` are `true`.
- The given graph is a directed acyclic graph.

## 基礎思路

本題要求在一個有向無環圖（DAG）中，找出從節點 0 到節點 n-1 的所有合法路徑中，「路徑上最小邊成本」的最大值。合法路徑需滿足：中間節點皆為 online、且所有邊成本之總和不超過 k。

在思考解法時，可掌握以下核心觀察：

- **最大化最小值是二分搜尋的經典特徵**：
  答案必為某條邊的成本值，且若門檻值 t 可行，則所有小於 t 的門檻也可行；若不可行，則所有大於 t 的門檻亦不可行。此單調性使二分搜尋可以直接套用。

- **可行性驗證等價於受限最短路徑問題**：
  給定一個門檻 t，只保留成本 ≥ t 的邊，此時問題退化為：從節點 0 到節點 n-1 是否存在一條合法路徑，且路徑邊成本總和 ≤ k。圖為 DAG，因此可用拓撲排序進行一次線性 DP 完成驗證。

- **拓撲排序只需計算一次**：
  DAG 的拓撲順序與邊的篩選門檻無關，可在所有可行性驗證之外事先計算，重複複用，避免重複建圖。

- **候選門檻只來自邊成本集合**：
  答案必為圖中某條邊的實際成本值，因此對去重後的邊成本排序後進行二分搜尋，即可窮舉所有候選答案。

依據以上特性，可以採用以下策略：

- **預先將邊資訊儲存為型別陣列**，並收集所有邊成本作為候選門檻，排序去重後建立二分搜尋的搜尋空間。
- **以 Kahn's 演算法預計算拓撲順序**，供每次可行性驗證重複使用。
- **每次可行性驗證使用拓撲順序 DP**：在給定門檻下，只允許成本 ≥ 門檻的邊，計算從節點 0 出發的最小總成本，判斷是否能在成本 ≤ k 的限制下到達節點 n-1。
- **二分搜尋最大可行門檻**，取得最終答案。

## 解題步驟

### Step 1：處理無邊情況並展開邊資料

若圖中不存在任何邊，則不可能存在任何路徑，直接回傳 -1。
接著，將輸入的邊資料展開儲存至型別陣列中，以利後續快取友好的存取，並同步收集所有邊成本作為二分搜尋的候選門檻。

```typescript
const nodeCount = online.length;
const edgeCount = edges.length;

if (edgeCount === 0) {
  return -1;
}

// 將邊資訊展開儲存至型別陣列以提升存取效率
const edgeFrom = new Int32Array(edgeCount);
const edgeTo = new Int32Array(edgeCount);
const edgeCost = new Float64Array(edgeCount);

// 收集所有成本作為二分搜尋的候選門檻
const distinctCosts = new Float64Array(edgeCount);

for (let i = 0; i < edgeCount; i++) {
  const edge = edges[i];
  edgeFrom[i] = edge[0];
  edgeTo[i] = edge[1];
  edgeCost[i] = edge[2];
  distinctCosts[i] = edge[2];
}
```

### Step 2：對候選門檻排序並去重

將所有邊成本排序後，進行原地去重，只保留不重複的值，作為後續二分搜尋的搜尋空間。

```typescript
// 將候選門檻升冪排列，並原地去重
distinctCosts.sort();
let uniqueCount = 0;
for (let i = 0; i < edgeCount; i++) {
  if (uniqueCount === 0 || distinctCosts[i] !== distinctCosts[uniqueCount - 1]) {
    distinctCosts[uniqueCount] = distinctCosts[i];
    uniqueCount++;
  }
}
```

### Step 3：建立壓縮式鄰接結構

使用前綴計數法計算每個節點的出邊數量，再累積轉換為各節點在平坦陣列中的起始位置，接著將邊索引填入對應的桶中，同時統計每個節點的入度，以供後續拓撲排序使用。

```typescript
// 前綴計數：統計每個節點的出邊數，再轉為起始位置
const outEdgeStart = new Int32Array(nodeCount + 1);
for (let i = 0; i < edgeCount; i++) {
  outEdgeStart[edgeFrom[i] + 1]++;
}
for (let i = 0; i < nodeCount; i++) {
  outEdgeStart[i + 1] += outEdgeStart[i];
}

// 壓縮鄰接：adjacencyEdge[outEdgeStart[u]..outEdgeStart[u+1]) 存放節點 u 的所有出邊索引
const adjacencyEdge = new Int32Array(edgeCount);
const fillCursor = outEdgeStart.slice(0, nodeCount);
const inDegree = new Int32Array(nodeCount);
for (let i = 0; i < edgeCount; i++) {
  const from = edgeFrom[i];
  adjacencyEdge[fillCursor[from]++] = i;
  inDegree[edgeTo[i]]++;
}
```

### Step 4：以 Kahn's 演算法預計算拓撲順序

對 DAG 執行 Kahn's 演算法，將拓撲順序存入 `topoOrder`，此順序將在每次可行性驗證中重複使用，無須重新計算。

```typescript
// 以 Kahn's 演算法計算拓撲順序，供後續每次可行性驗證複用
const topoOrder = new Int32Array(nodeCount);
const inDegreeWork = inDegree.slice();
const queue = new Int32Array(nodeCount);
let queueHead = 0;
let queueTail = 0;
for (let i = 0; i < nodeCount; i++) {
  if (inDegreeWork[i] === 0) {
    queue[queueTail++] = i;
  }
}
while (queueHead < queueTail) {
  const node = queue[queueHead++];
  topoOrder[queueHead - 1] = node;
  const edgeStart = outEdgeStart[node];
  const edgeEnd = outEdgeStart[node + 1];
  for (let e = edgeStart; e < edgeEnd; e++) {
    const to = edgeTo[adjacencyEdge[e]];
    if (--inDegreeWork[to] === 0) {
      queue[queueTail++] = to;
    }
  }
}
```

### Step 5：定義可行性驗證函數並初始化距離陣列

宣告儲存每個節點最小到達成本的陣列 `minCostToReach`，接著定義 `isFeasible` 函數，在函數開頭將所有節點的最小成本重置為無限大，並將起點節點 0 的成本設為 0。

```typescript
const targetNode = nodeCount - 1;
const INFINITY_COST = Infinity;

// 儲存在指定門檻下，從節點 0 到達各節點的最小總成本
const minCostToReach = new Float64Array(nodeCount);

/**
 * 檢查是否存在一條從 0 到 n-1 的路徑，
 * 僅使用成本 >= threshold 的邊，且總成本不超過 k，且中間節點皆為 online。
 * @param threshold - 允許使用的最小邊成本門檻。
 * @returns 若此類合法路徑存在則回傳 true。
 */
const isFeasible = (threshold: number): boolean => {
  for (let i = 0; i < nodeCount; i++) {
    minCostToReach[i] = INFINITY_COST;
  }
  minCostToReach[0] = 0;

  // ...
};
```

### Step 6：依拓撲順序進行邊鬆弛以計算最小路徑成本

按照預計算的拓撲順序逐一處理節點：跳過尚未可達的節點、跳過非 online 的中間節點，接著對每條成本 ≥ 門檻的出邊嘗試鬆弛，更新目標節點的最小到達成本。

```typescript
const isFeasible = (threshold: number): boolean => {
  // Step 5：重置距離並初始化起點

  // 依拓撲順序鬆弛邊，確保前驅節點先於後繼節點處理
  for (let t = 0; t < nodeCount; t++) {
    const node = topoOrder[t];
    const currentCost = minCostToReach[node];
    if (currentCost === INFINITY_COST) {
      continue;
    }
    if (node === targetNode) {
      continue;
    }
    // 中間節點（非起點亦非終點）必須為 online 才可繼續往後傳遞
    if (node !== 0 && !online[node]) {
      continue;
    }
    const edgeStart = outEdgeStart[node];
    const edgeEnd = outEdgeStart[node + 1];
    for (let e = edgeStart; e < edgeEnd; e++) {
      const edgeIndex = adjacencyEdge[e];
      if (edgeCost[edgeIndex] < threshold) {
        continue;
      }
      const to = edgeTo[edgeIndex];
      const candidate = currentCost + edgeCost[edgeIndex];
      if (candidate < minCostToReach[to]) {
        minCostToReach[to] = candidate;
      }
    }
  }
  return minCostToReach[targetNode] <= k;
};
```

### Step 7：以最小門檻預先判斷是否存在任何合法路徑

在二分搜尋前，先以最寬鬆的門檻（即所有去重後的最小成本）執行一次可行性驗證。若此時都無法找到合法路徑，則代表不存在任何解，直接回傳 -1。

```typescript
// 若以最低門檻都無法找到合法路徑，則不存在任何解
if (!isFeasible(distinctCosts[0])) {
  return -1;
}
```

### Step 8：二分搜尋最大可行門檻並回傳結果

在候選門檻陣列上進行二分搜尋：若當前門檻可行，則嘗試更大的門檻（往右搜），並更新 `bestScore`；若不可行，則往左縮小範圍。最終回傳找到的最大可行門檻。

```typescript
// 二分搜尋最大的可行門檻
let low = 0;
let high = uniqueCount - 1;
let bestScore = distinctCosts[0];
while (low <= high) {
  const midCandidateIndex = (low + high) >>> 1;
  if (isFeasible(distinctCosts[midCandidateIndex])) {
    bestScore = distinctCosts[midCandidateIndex];
    low = midCandidateIndex + 1;
  } else {
    high = midCandidateIndex - 1;
  }
}

return bestScore;
```

## 時間複雜度

- 展開邊資料與收集候選門檻需 $O(m)$；
- 對候選門檻排序需 $O(m \log m)$，去重需 $O(m)$；
- 建立壓縮鄰接結構與計算入度需 $O(n + m)$；
- 以 Kahn's 演算法計算拓撲順序需 $O(n + m)$；
- 二分搜尋執行 $O(\log m)$ 次，每次可行性驗證需 $O(n + m)$，共 $O((n + m) \log m)$；
- 總時間複雜度為 $O((n + m) \log m)$。

> $O((n + m) \log m)$

## 空間複雜度

- 展開的邊資料與候選門檻陣列各需 $O(m)$；
- 壓縮鄰接陣列與出邊起始位置陣列需 $O(n + m)$；
- 拓撲順序、佇列、入度工作陣列各需 $O(n)$；
- 可行性驗證所使用的最小成本陣列需 $O(n)$；
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
