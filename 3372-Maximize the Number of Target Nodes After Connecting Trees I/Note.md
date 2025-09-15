# 3372. Maximize the Number of Target Nodes After Connecting Trees I

There exist two undirected trees with `n` and `m` nodes, with distinct labels in ranges `[0, n - 1]` and `[0, m - 1]`, respectively.

You are given two 2D integer arrays `edges1` and `edges2` of lengths `n - 1` and `m - 1`, respectively, where `edges1[i] = [a_i, b_i]` indicates that 
there is an edge between nodes `a_i` and `b_i` in the first tree and `edges2[i] = [u_i, v_i]` indicates that there is an edge between nodes `u_i` and `v_i` in the second tree. 
You are also given an integer `k`.

Node `u` is target to node `v` if the number of edges on the path from `u` to `v` is less than or equal to `k`. 
Note that a node is always target to itself.

Return an array of `n` integers `answer`, where `answer[i]` is the maximum possible number of nodes target to node `i` of the first tree 
if you have to connect one node from the first tree to another node in the second tree.

Note that queries are independent from each other. 
That is, for every query you will remove the added edge before proceeding to the next query.

**Constraints:**

- `2 <= n, m <= 1000`
- `edges1.length == n - 1`
- `edges2.length == m - 1`
- `edges1[i].length == edges2[i].length == 2`
- `edges1[i] = [a_i, b_i]`
- `0 <= a_i, b_i < n`
- `edges2[i] = [u_i, v_i]`
- `0 <= u_i, v_i < m`
- The input is generated such that `edges1` and `edges2` represent valid trees.
- `0 <= k <= 1000`

## 基礎思路

本題的核心要求是對於第一棵樹的每個節點，計算出當連接到第二棵樹的任意節點時，最多能在距離限制 `k` 內到達多少個節點。

- 我們可以透過建構有效的圖形表示方法（例如 CSR），加快節點間距離計算的效率。
- 對每個節點分別使用廣度優先搜尋（BFS）計算在特定距離內的可達節點數目。
- 因為每次連接到第二棵樹的點時，都必須經過新建的橋接邊，所以從第二棵樹出發的可達距離為 `k-1`。
- 事先計算第二棵樹在 `k-1` 步內最多可達的節點數量，避免重複計算。
- 最後將兩樹各自計算的結果合併起來，即可獲得最終答案。

## 解題步驟

### Step 1：初始化兩棵樹的節點數量

首先透過邊的數量計算每棵樹各自擁有的節點數量：

```typescript
// 計算每棵樹各自的節點數
const numberOfNodesInTree1 = edges1.length + 1;
const numberOfNodesInTree2 = edges2.length + 1;
```

### Step 2：建立壓縮稀疏列 (CSR) 結構

透過 CSR 可以高效存取鄰居節點：

```typescript
function buildCompressedSparseRow(
  edgeList: number[][],
  totalNodeCount: number
): { offsets: Uint16Array; neighbors: Uint16Array } {
  // 計算每個節點的度數
  const degreeOfNode = new Uint16Array(totalNodeCount);
  for (const [nodeA, nodeB] of edgeList) {
    degreeOfNode[nodeA]++;
    degreeOfNode[nodeB]++;
  }

  // 計算每個節點鄰居的起始索引
  const offsets = new Uint16Array(totalNodeCount + 1);
  for (let nodeIndex = 0; nodeIndex < totalNodeCount; nodeIndex++) {
    offsets[nodeIndex + 1] = offsets[nodeIndex] + degreeOfNode[nodeIndex];
  }

  // 使用 offsets 填充 neighbors 陣列
  const neighbors = new Uint16Array(offsets[totalNodeCount]);
  const insertionPointers = offsets.subarray(0, totalNodeCount).slice();

  for (const [nodeA, nodeB] of edgeList) {
    neighbors[insertionPointers[nodeA]++] = nodeB;
    neighbors[insertionPointers[nodeB]++] = nodeA;
  }

  return { offsets, neighbors };
}
```

### Step 3：分別為兩棵樹建立 CSR

分別建立兩棵樹的CSR結構，後續方便操作：

```typescript
// 建立 CSR 結構以便後續進行 BFS
const {
  offsets: csrOffsetsTree1,
  neighbors: csrNeighborsTree1
} = buildCompressedSparseRow(edges1, numberOfNodesInTree1);

const {
  offsets: csrOffsetsTree2,
  neighbors: csrNeighborsTree2
} = buildCompressedSparseRow(edges2, numberOfNodesInTree2);
```

### Step 4：計算每個節點可達節點數量（使用 BFS）

透過 BFS 搜尋來統計每個節點在距離限制內可到達的節點數量：

```typescript
function computeReachableNodesArray(
  csrOffsets: Uint16Array,
  csrNeighbors: Uint16Array,
  totalNodeCount: number,
  distanceLimit: number
): Int32Array {
  const reachableCount = new Int32Array(totalNodeCount);
  if (distanceLimit < 0) {
    return reachableCount;
  }

  // 使用唯一 token 標記每輪 BFS 是否訪問過節點
  const lastVisitedToken = new Uint32Array(totalNodeCount);
  const nodeDistance = new Int16Array(totalNodeCount);
  const bfsQueue = new Uint16Array(totalNodeCount);

  let globalIterationToken = 1;

  for (let startNode = 0; startNode < totalNodeCount; startNode++, globalIterationToken++) {
    let queueHead = 0;
    let queueTail = 0;

    // 初始化 BFS 起始節點
    lastVisitedToken[startNode] = globalIterationToken;
    nodeDistance[startNode] = 0;
    bfsQueue[queueTail++] = startNode;

    let nodesReached = 1; // 起始節點必定計算

    // BFS 主迴圈
    while (queueHead < queueTail) {
      const currentNode = bfsQueue[queueHead++];
      const currentDistance = nodeDistance[currentNode];
      if (currentDistance === distanceLimit) {
        continue;
      }

      // 拜訪所有未訪問且距離內的鄰居節點
      for (let ptr = csrOffsets[currentNode], end = csrOffsets[currentNode + 1]; ptr < end; ptr++) {
        const neighborNode = csrNeighbors[ptr];
        if (lastVisitedToken[neighborNode] !== globalIterationToken) {
          lastVisitedToken[neighborNode] = globalIterationToken;
          nodeDistance[neighborNode] = currentDistance + 1;
          bfsQueue[queueTail++] = neighborNode;
          nodesReached++;
        }
      }
    }

    reachableCount[startNode] = nodesReached;
  }

  return reachableCount;
}
```

### Step 5：計算第二棵樹的最佳可達節點數量

透過限制為 `k-1` 的距離條件，計算第二棵樹可提供的最大節點數：

```typescript
function computeMaximumReachableNodes(
  csrOffsets: Uint16Array,
  csrNeighbors: Uint16Array,
  totalNodeCount: number,
  distanceLimit: number
): number {
  if (distanceLimit < 0) {
    return 0;
  }
  // 計算所有節點的可達數量
  const reachableArray = computeReachableNodesArray(
    csrOffsets, csrNeighbors, totalNodeCount, distanceLimit
  );
  // 找到其中的最大值
  let maximumReached = 0;
  for (let nodeIndex = 0; nodeIndex < totalNodeCount; nodeIndex++) {
    if (reachableArray[nodeIndex] > maximumReached) {
      maximumReached = reachableArray[nodeIndex];
    }
  }
  return maximumReached;
}
```

### Step 6：合併計算最終結果

計算並合併兩棵樹的節點數量得到最終答案：

```typescript
const reachableCountPerNodeInTree1 = computeReachableNodesArray(
  csrOffsetsTree1,
  csrNeighborsTree1,
  numberOfNodesInTree1,
  k
);

// 第二棵樹最多能走 k-1 步，因為有橋接邊耗費 1 步
const bestReachableInTree2 = computeMaximumReachableNodes(
  csrOffsetsTree2,
  csrNeighborsTree2,
  numberOfNodesInTree2,
  k - 1 // 因為有橋接邊所以最多為 k-1
);

// 合併兩棵樹的結果
const result = new Array<number>(numberOfNodesInTree1);
for (let nodeIndex = 0; nodeIndex < numberOfNodesInTree1; nodeIndex++) {
  result[nodeIndex] = reachableCountPerNodeInTree1[nodeIndex] + bestReachableInTree2;
}

// 返回最終答案陣列
return result;
```

## 時間複雜度

- 建立CSR結構時，需遍歷全部邊，花費 $O(n+m)$。
- BFS需對每個節點遍歷一次，總共需遍歷約 $O(n^2 + m^2)$ 次操作。
- 最終合併操作為 $O(n)$。
- 總時間複雜度為 $O(n^2 + m^2)$。

> $O(n^2+m^2)$

## 空間複雜度

- CSR結構的空間花費為 $O(n+m)$。
- BFS搜索時使用的輔助空間（visited、queue 等）最多為 $O(n+m)$。
- 最終輸出陣列佔用空間為 $O(n)$。
- 總空間複雜度為 $O(n+m)$。

> $O(n+m)$
