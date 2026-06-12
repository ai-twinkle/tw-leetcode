# 3559. Number of Ways to Assign Edge Weights II

There is an undirected tree with n nodes labeled from `1` to `n`, rooted at node `1`. 
The tree is represented by a 2D integer array `edges` of length `n - 1`, 
where `edges[i] = [u_i, v_i]` indicates that there is an edge between nodes `u_i` and `v_i`.

Initially, all edges have a weight of 0. 
You must assign each edge a weight of either 1 or 2.

The cost of a path between any two nodes `u` and `v` is the total weight of all edges in the path connecting them.

You are given a 2D integer array queries. For each `queries[i] = [u_i, v_i]`, 
determine the number of ways to assign weights to edges in the path such that the cost of the path between `u_i` and `v_i` is odd.

Return an array `answer`, where `answer[i]` is the number of valid assignments for `queries[i]`.

Since the answer may be large, apply modulo `10^9 + 7` to each `answer[i]`.

Note: For each query, disregard all edges not in the path between node `u_i` and `v_i`.

**Constraints:**

- `2 <= n <= 10^5`
- `edges.length == n - 1`
- `edges[i] == [u_i, v_i]`
- `1 <= queries.length <= 10^5`
- `queries[i] == [u_i, v_i]`
- `1 <= u_i, v_i <= n`
- `edges` represents a valid tree.

## 基礎思路

本題要求對樹上的路徑進行邊權分配計數：每條邊可被指派為 1 或 2，問存在多少種分配方式，使指定兩節點間的路徑總和為奇數。

在分析此題時，可掌握以下幾個關鍵觀察：

- **邊權對奇偶性的影響**：
  權值 1 為奇、權值 2 為偶。因此路徑總和的奇偶性，完全等同於「被指派為 1 的邊數」的奇偶性。

- **計數可化簡為閉式公式**：
  若路徑共有 $k$ 條邊，要從中選出奇數條邊指派為 1 的方法數，恰為所有奇數項二項係數之和，即 $2^{k-1}$。

- **問題降階為求路徑長度**：
  每筆查詢只需取得兩節點間的邊數 $k$，便能由公式直接得到答案 $2^{k-1} \bmod (10^9+7)$。

- **多次查詢需高效的最近共同祖先 (LCA)**：
  路徑長度可由「兩節點各自的深度減去最近共同祖先深度的兩倍」得出，因此每筆查詢都需快速取得 LCA。

依據以上特性，可採取以下策略：

- **預處理階段一次性完成資料準備**：以廣度優先搜尋從根節點求出每個節點的深度與直接父節點，再以「二進位提升 (binary lifting)」遞推每個節點各層次的祖先，使 LCA 查詢能在對數時間內完成。

- **預先建立 2 的次方對 $10^9+7$ 取模的查表**，使每筆查詢在取得路徑長度後可於常數時間內查得答案。

- **每筆查詢採用「深度對齊 + 同步上爬」找出 LCA**：先將較深者上提至與另一節點同一層，再讓兩節點同步往上跳，直到父節點重合即為 LCA；最後由路徑長度查表回傳答案，路徑長度為 0 時直接回傳 0。

如此可將每筆查詢的處理壓低至對數時間，整體效率對於 $10^5$ 規模的輸入十分充裕。

## 解題步驟

### Step 1：取得基礎參數並計算二進位提升所需的最高層數

先取得節點數量、邊數量與查詢數量，再以倍增的方式找出最小的層數 `maxLevel`，使其 $2^{\text{maxLevel}}$ 足以覆蓋任意可能的深度差。

```typescript
const nodeCount = edges.length + 1;
const edgeCount = edges.length;
const queryCount = queries.length;

// 找出可涵蓋所有可能深度差的最小層數
let maxLevel = 1;
while ((1 << maxLevel) < nodeCount) {
  maxLevel++;
}
```

### Step 2：以度數計數加前綴和建立 CSR 鄰接結構的起始偏移

為避免使用一般陣列造成額外配置與快取不友善，這裡採用扁平化 CSR 結構。先把每個節點的度數寫入偏移後一格，再以前綴和將其轉換為各節點在扁平鄰接陣列中的起始位置。

```typescript
// 將度數寫入偏移後一格，以便後續直接做前綴和
const neighborStart = new Int32Array(nodeCount + 2);
for (let i = 0; i < edgeCount; i++) {
  neighborStart[edges[i][0] + 1]++;
  neighborStart[edges[i][1] + 1]++;
}
// 前綴和將度數轉換為每個節點的起始偏移
for (let node = 1; node <= nodeCount; node++) {
  neighborStart[node + 1] += neighborStart[node];
}
```

### Step 3：使用可移動游標填入扁平鄰接陣列

複製一份起始偏移作為可移動游標 `fillCursor`，再依序處理每條無向邊，將兩端互為鄰居寫入扁平鄰接陣列。

```typescript
// 依照前述偏移把鄰接關係寫入扁平鄰接陣列
const neighbors = new Int32Array(2 * edgeCount);
const fillCursor = neighborStart.slice(0, nodeCount + 1);
for (let i = 0; i < edgeCount; i++) {
  const firstNode = edges[i][0];
  const secondNode = edges[i][1];
  neighbors[fillCursor[firstNode]++] = secondNode;
  neighbors[fillCursor[secondNode]++] = firstNode;
}
```

### Step 4：配置深度陣列與一維化的二進位提升祖先表

宣告儲存節點深度的陣列，以及攤平為一維的祖先表。`ancestorTable[level * stride + node]` 表示節點 `node` 的第 $2^{\text{level}}$ 個祖先；0 用作哨兵代表「無祖先」。

```typescript
const stride = nodeCount + 1;
const depth = new Int32Array(nodeCount + 1);
// ancestorTable[level * stride + node] 為 node 的第 2^level 祖先；0 為哨兵
const ancestorTable = new Int32Array(maxLevel * stride);
```

### Step 5：以迭代式 BFS 從根節點建立深度與第 0 層祖先

從節點 1 開始進行 BFS。每次從佇列取出當前節點，遍歷其鄰接區間，當鄰居尚未訪問時，記錄其深度與直接父節點（即 $2^0 = 1$ 級祖先），並推入佇列繼續展開。

```typescript
// 從根節點開始迭代式 BFS，填入深度與第 0 層祖先
const bfsQueue = new Int32Array(nodeCount);
const visited = new Uint8Array(nodeCount + 1);
let queueHead = 0;
let queueTail = 0;
bfsQueue[queueTail++] = 1;
visited[1] = 1;
while (queueHead < queueTail) {
  const current = bfsQueue[queueHead++];
  const rangeEnd = neighborStart[current + 1];
  for (let i = neighborStart[current]; i < rangeEnd; i++) {
    const next = neighbors[i];
    if (visited[next] === 0) {
      visited[next] = 1;
      depth[next] = depth[current] + 1;
      ancestorTable[next] = current;
      bfsQueue[queueTail++] = next;
    }
  }
}
```

### Step 6：以遞推填滿其餘層級的二進位提升祖先表

利用「第 $L$ 層祖先 = 第 $L-1$ 層祖先再往上跳第 $L-1$ 層」的遞推關係，逐層填滿祖先表，使後續查詢能以位元拆解方式在對數時間內跳到任意祖先。

```typescript
// 二進位提升：第 L 層祖先 = 第 L-1 層祖先的第 L-1 層祖先
for (let level = 1; level < maxLevel; level++) {
  const currentBase = level * stride;
  const previousBase = (level - 1) * stride;
  for (let node = 1; node <= nodeCount; node++) {
    const midAncestor = ancestorTable[previousBase + node];
    ancestorTable[currentBase + node] = ancestorTable[previousBase + midAncestor];
  }
}
```

### Step 7：預先建立 2 的次方對 $10^9+7$ 取模的查表

因每個查詢的答案為「路徑長度減一」的 2 的次方，可事先建表，使每筆查詢的最終回答僅需一次查表即可完成。

```typescript
// 預先建立 2 的次方表，使查詢可在 O(1) 時間取得結果
const powerOfTwo = new Int32Array(nodeCount);
powerOfTwo[0] = 1;
for (let i = 1; i < nodeCount; i++) {
  powerOfTwo[i] = (powerOfTwo[i - 1] * 2) % ODD_PATH_MODULO;
}
```

### Step 8：建立結果陣列並對每筆查詢取出節點與較深者

先配置結果陣列以容納每筆查詢的答案。對每筆查詢取出兩節點與其深度，並將較深者放入 `lower`、較淺者放入 `higher`，便於後續統一將較深節點往上爬。

```typescript
const result: number[] = new Array(queryCount);
for (let q = 0; q < queryCount; q++) {
  const nodeU = queries[q][0];
  const nodeV = queries[q][1];
  const depthU = depth[nodeU];
  const depthV = depth[nodeV];

  // 將較深的節點放入 lower，便於統一往上爬
  let lower = nodeU;
  let higher = nodeV;
  if (depthU < depthV) {
    lower = nodeV;
    higher = nodeU;
  }

  // ...
}
```

### Step 9：依深度差的位元逐次上提較深的節點

計算兩節點深度差，並依其二進位表示逐位上提較深的節點：當第 `level` 位為 1，便利用祖先表跳上 $2^{\text{level}}$ 階祖先。完成後兩節點將位於同一層。

```typescript
for (let q = 0; q < queryCount; q++) {
  // Step 8：取出查詢節點並判定較深者

  // 依深度差的位元逐次將較深節點向上提升
  let difference = depth[lower] - depth[higher];
  for (let level = 0; level < maxLevel; level++) {
    if (((difference >> level) & 1) === 1) {
      lower = ancestorTable[level * stride + lower];
    }
  }

  // ...
}
```

### Step 10：兩節點同步上爬以求出最近共同祖先

若兩節點對齊深度後仍不相同，則由高層往低層同步上爬：當該層的祖先彼此不同時就跳上去，相同則停留於原位。迴圈結束時，兩節點的直接父節點即為 LCA。

```typescript
for (let q = 0; q < queryCount; q++) {
  // Step 8：取出查詢節點並判定較深者

  // Step 9：將較深節點上提至同深度

  let lowestCommonAncestor = lower;
  if (lower !== higher) {
    // 由高層往低層同步上爬，遇到祖先不同才跳
    for (let level = maxLevel - 1; level >= 0; level--) {
      const lowerAncestor = ancestorTable[level * stride + lower];
      const higherAncestor = ancestorTable[level * stride + higher];
      if (lowerAncestor !== higherAncestor) {
        lower = lowerAncestor;
        higher = higherAncestor;
      }
    }
    // 此時兩節點的父節點即為 LCA
    lowestCommonAncestor = ancestorTable[lower];
  }

  // ...
}
```

### Step 11：依路徑長度查表得到答案並回傳結果

由 `depthU + depthV - 2 * depth[LCA]` 即得到路徑邊數。當路徑長度為 0（兩節點相同）時直接記為 0；否則查表取得 $2^{\text{length}-1} \bmod (10^9+7)$。處理完所有查詢後回傳結果。

```typescript
for (let q = 0; q < queryCount; q++) {
  // Step 8：取出查詢節點並判定較深者

  // Step 9：將較深節點上提至同深度

  // Step 10：同步上爬以求得 LCA

  // 依路徑長度查表取得答案
  const distance = depthU + depthV - 2 * depth[lowestCommonAncestor];
  if (distance === 0) {
    result[q] = 0;
  } else {
    result[q] = powerOfTwo[distance - 1];
  }
}

return result;
```

## 時間複雜度

- 建立 CSR 鄰接結構與 BFS 各需 $O(n)$；
- 二進位提升祖先表共有 $O(n \log n)$ 個格點，填表為線性掃描；
- 預計算 2 的次方表為 $O(n)$；
- 每筆查詢以二進位提升取得 LCA 需 $O(\log n)$，共 $q$ 筆查詢共需 $O(q \log n)$。
- 總時間複雜度為 $O((n + q) \log n)$。

> $O((n + q) \log n)$

## 空間複雜度

- 扁平鄰接陣列、深度與 BFS 輔助結構皆為 $O(n)$；
- 二進位提升祖先表為 $O(n \log n)$；
- 2 的次方表與結果陣列各為 $O(n)$ 與 $O(q)$。
- 總空間複雜度為 $O(n \log n + q)$。

> $O(n \log n + q)$
