# 3558. Number of Ways to Assign Edge Weights I

There is an undirected tree with n nodes labeled from `1` to `n`, rooted at node 1. 
The tree is represented by a 2D integer array `edges` of length `n - 1`, 
where `edges[i] = [u_i, v_i]` indicates that there is an edge between nodes `u_i` and `v_i`.

Initially, all edges have a weight of 0. You must assign each edge a weight of either 1 or 2.

The cost of a path between any two nodes `u` and `v` is the total weight of all edges in the path connecting them.

Select any one node `x` at the maximum depth. 
Return the number of ways to assign edge weights in the path from node 1 to `x` such that its total cost is odd.

Since the answer may be large, return it modulo `10^9 + 7`.

Note: Ignore all edges not in the path from node 1 to `x`.

**Constraints:**

- `2 <= n <= 10^5`
- `edges.length == n - 1`
- `edges[i] == [u_i, v_i]`
- `1 <= u_i, v_i <= n`
- `edges` represents a valid tree.

## 基礎思路

本題要求在一棵根為節點 1 的樹中，將根節點到某個位於最大深度的節點之路徑上每條邊指派為權重 1 或 2，並計算讓總路徑成本為奇數的方案數，最後對 $10^9 + 7$ 取模。

在思考解法時，可掌握以下核心觀察：

- **權重 2 不影響奇偶性**：
  每條邊權重僅可能為 1 或 2，由於 2 為偶數，整條路徑總和的奇偶性僅取決於權重為 1 的邊的數量。

- **問題轉化為「在 k 條邊中挑出奇數條」的計數**：
  若路徑共有 $k$ 條邊，則需要挑出奇數條作為權重 1，方案數恰為
  $\binom{k}{1} + \binom{k}{3} + \cdots = 2^{k-1}$。

- **答案僅取決於最大深度**：
  題目允許任意挑選一個位於最大深度的節點，因此唯一影響答案的量就是樹的最大深度 $k$。

- **取模與預計算需求**：
  由於 $k$ 可能達到 $n - 1$ 量級，需對 $10^9 + 7$ 取模；可預先計算 $2^k \bmod p$ 表，以便常數時間查詢。

依據以上特性，可以採用以下策略：

- **預計算 $2^k \bmod (10^9 + 7)$ 表**，避免每次呼叫重新計算冪次。
- **以 CSR（壓縮稀疏列）格式建立鄰接表**，使每個節點的鄰居在記憶體中連續排列以加速 BFS。
- **從節點 1 進行 BFS，逐層更新最大深度 $k$**。
- **直接回傳 $2^{k-1} \bmod (10^9 + 7)$**。

## 解題步驟

### Step 1：在函式外預先計算 2 的冪次模值表

由於 $k$ 最大可達 $n - 1 \le 10^5 - 1$，我們在函式外建立 $0$ 至 $10^5$ 範圍的 $2^k \bmod (10^9 + 7)$ 查表，使後續查詢能以 $O(1)$ 完成。

```typescript
// 題目所要求的模數
const ASSIGN_EDGE_MODULO = 1_000_000_007;

// 路徑長度上限：n <= 10^5 時最多為 n - 1
const ASSIGN_EDGE_MAX_EXPONENT = 100_000;

// 在函式外預計算 2^k mod ASSIGN_EDGE_MODULO，供所有呼叫以 O(1) 查表
const assignEdgePowersOfTwo = new Int32Array(ASSIGN_EDGE_MAX_EXPONENT + 1);
assignEdgePowersOfTwo[0] = 1;
for (let exponent = 1; exponent <= ASSIGN_EDGE_MAX_EXPONENT; exponent++) {
  assignEdgePowersOfTwo[exponent] = (assignEdgePowersOfTwo[exponent - 1] * 2) % ASSIGN_EDGE_MODULO;
}
```

### Step 2：統計每個節點的度數

CSR 格式需先知道每個節點的鄰居數量，因此先掃過所有邊累加度數，作為後續配置記憶體版面的依據。

```typescript
const numberOfNodes = edges.length + 1;

// 統計每個節點的度數，以決定壓縮鄰接表的版面大小
const degree = new Int32Array(numberOfNodes + 1);
for (let index = 0; index < edges.length; index++) {
  const edge = edges[index];
  degree[edge[0]]++;
  degree[edge[1]]++;
}
```

### Step 3：建立 CSR 起始偏移表

利用度數的前綴和計算每個節點在鄰接陣列中對應的起始位置，確保每個節點的鄰居佔據連續的記憶體區段。

```typescript
// 建立 CSR 起始偏移，使每個節點的鄰居在記憶體中連續排列
const start = new Int32Array(numberOfNodes + 2);
for (let node = 1; node <= numberOfNodes; node++) {
  start[node + 1] = start[node] + degree[node];
}
```

### Step 4：填入扁平化的鄰接陣列

複製 `start` 作為每個節點的寫入游標，依序將每條無向邊的兩個方向寫入扁平化的鄰接陣列中。

```typescript
// 使用每個節點的寫入游標，將鄰居填入扁平鄰接陣列
const adjacency = new Int32Array(2 * edges.length);
const cursor = start.slice();
for (let index = 0; index < edges.length; index++) {
  const edge = edges[index];
  const firstNode = edge[0];
  const secondNode = edge[1];
  adjacency[cursor[firstNode]++] = secondNode;
  adjacency[cursor[secondNode]++] = firstNode;
}
```

### Step 5：初始化 BFS 所需的結構

建立深度陣列（初值 $-1$ 表示尚未拜訪）與陣列形式的佇列，將根節點 1 推入佇列並將其深度設為 $0$，同時準備好記錄最大深度的變數。

```typescript
// 從根節點以 BFS 探索，逐層計算深度（以邊為單位）
const depth = new Int32Array(numberOfNodes + 1).fill(-1);
const queue = new Int32Array(numberOfNodes);
let head = 0;
let tail = 0;
depth[1] = 0;
queue[tail++] = 1;
let maximumDepth = 0;
```

### Step 6：執行 BFS 並追蹤最大深度

每輪從佇列取出一個節點後，先比對其深度以更新目前已知的最大深度，再依 CSR 偏移展開其所有鄰居，將尚未拜訪者推入佇列並設定深度為當前深度加一。

```typescript
while (head < tail) {
  const current = queue[head++];
  const currentDepth = depth[current];

  // 記錄目前已經到達的最深層級
  if (currentDepth > maximumDepth) {
    maximumDepth = currentDepth;
  }

  const sliceEnd = start[current + 1];
  for (let edgeIndex = start[current]; edgeIndex < sliceEnd; edgeIndex++) {
    const neighbor = adjacency[edgeIndex];

    // 每個鄰居僅拜訪一次（未拜訪者深度仍為 -1）
    if (depth[neighbor] === -1) {
      depth[neighbor] = currentDepth + 1;
      queue[tail++] = neighbor;
    }
  }
}
```

### Step 7：以查表方式回傳 $2^{k-1}$ 的結果

最大深度 $k$ 已求得，依據先前的觀察，含 $k$ 條邊的路徑共有 $2^{k-1}$ 種使總成本為奇數的指派方式，直接從預計算表中取出對應值回傳即可。

```typescript
// 含 k 條邊的路徑共有 2^(k - 1) 種使總成本為奇數的指派方式
return assignEdgePowersOfTwo[maximumDepth - 1];
```

## 時間複雜度

- 預計算 $2^k$ 模值表為一次性建立，成本為 $O(N_{\max})$，攤提到每次函式呼叫可視為 $O(1)$。
- 統計度數、建立 CSR 起始偏移、填入鄰接陣列各為 $O(n)$。
- BFS 過程中每個節點與每條邊皆僅被處理一次，整體為 $O(n)$。
- 最後查表回傳為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- `degree`、`start`、`depth`、`queue`、`cursor` 各佔 $O(n)$。
- `adjacency` 為雙倍邊數的扁平陣列，仍為 $O(n)$。
- 預計算的 $2^k$ 模值表佔 $O(N_{\max})$，與輸入無關，可視為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
