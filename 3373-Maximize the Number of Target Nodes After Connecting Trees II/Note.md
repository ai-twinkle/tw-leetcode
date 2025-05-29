# 3373. Maximize the Number of Target Nodes After Connecting Trees II

There exist two undirected trees with `n` and `m` nodes, labeled from `[0, n - 1]` and `[0, m - 1]`, respectively.

You are given two 2D integer arrays `edges1` and `edges2` of lengths `n - 1` and `m - 1`, 
respectively, where `edges1[i] = [a_i, b_i]` indicates that there is an edge between nodes `a_i` and `b_i` in the first tree and `edges2[i] = [u_i, v_i]` indicates that 
there is an edge between nodes `u_i` and `v_i` in the second tree.

Node `u` is target to node `v` if the number of edges on the path from `u` to `v` is even. 
Note that a node is always target to itself.

Return an array of `n` integers `answer`, where `answer[i]` is the maximum possible number of nodes 
that are target to node `i` of the first tree if you had to connect one node from the first tree to another node in the second tree.

Note that queries are independent from each other. 
That is, for every query you will remove the added edge before proceeding to the next query.

**Constraints:**

- `2 <= n, m <= 10^5`
- `edges1.length == n - 1`
- `edges2.length == m - 1`
- `edges1[i].length == edges2[i].length == 2`
- `edges1[i] = [a_i, b_i]`
- `0 <= a_i, b_i < n`
- `edges2[i] = [u_i, v_i]`
- `0 <= u_i, v_i < m`
- The input is generated such that `edges1` and `edges2` represent valid trees.

## 基礎思路

本題的核心在於分析樹的深度與節點間距離的奇偶性，根據題意，我們必須透過連接兩棵不同的樹，來達成對每個節點最大化能夠到達的偶數距離（包括自己）的節點數目。

為解決這個問題，我們需要考慮以下幾個要點：

- **分析奇偶性：**
  深度為偶數的節點到深度為偶數的節點之間的距離必為偶數；深度為奇數的節點到深度為奇數的節點之間的距離亦必為偶數。

- **跨樹影響奇偶性：**
  連接兩棵樹時，連接的邊會使得節點跨樹後的距離奇偶性產生變化，因此需透過選擇適合的樹來連接，最大化目標節點數目。

基於上述考量，我們會：

1. 分別計算兩棵樹各自深度奇偶節點數目。
2. 找出第二棵樹中奇偶節點數目較多的一邊，以最大化跨樹後可達的偶數距離節點數量。
3. 根據第一棵樹每個節點的深度奇偶，結合上述資訊得出答案。

## 解題步驟

### Step 1：計算兩棵樹的節點數

首先計算兩棵樹的節點數，這將用於建立後續的資料結構。

```typescript
// 1. 計算兩棵樹的節點數。
const numberOfNodesTreeOne = edges1.length + 1;
const numberOfNodesTreeTwo = edges2.length + 1;
```

### Step 2：準備 BFS 佇列

為後續 BFS 遍歷預先分配一個足夠大的佇列。

```typescript
// 2. 準備足夠大的佇列用於 BFS 遍歷，長度為兩樹節點數的最大值。
const maxNodes = numberOfNodesTreeOne > numberOfNodesTreeTwo
  ? numberOfNodesTreeOne
  : numberOfNodesTreeTwo;
const bfsQueue = new Int32Array(maxNodes);
```

### Step 3：定義並實作 `computeParityCounts` 幫助函式

我們用 BFS 遍歷樹，計算每個節點深度的奇偶性，同時統計偶數與奇數深度的節點數量。

```typescript
/**
 * 3. 幫助函式，用於構建 CSR 並計算節點深度的奇偶數量
 * @param {number[][]} edgeList - 以 [u, v] 形式的邊列表
 * @param {number} numberOfNodes - 此樹的節點總數
 * @return {{ parity: Int8Array, evenCount: number, oddCount: number }} 返回深度奇偶陣列，以及偶數深度與奇數深度節點數量
 */
function computeParityCounts(
  edgeList: number[][],
  numberOfNodes: number
): { parity: Int8Array; evenCount: number; oddCount: number } {
  // 建立鄰接表 (CSR 結構)
  const adjacencyHead = new Int32Array(numberOfNodes).fill(-1);
  const adjacencyTo = new Int32Array(edgeList.length * 2);
  const adjacencyNext = new Int32Array(edgeList.length * 2);

  let edgePointer = 0;
  for (let i = 0; i < edgeList.length; i++) {
    const u = edgeList[i][0];
    const v = edgeList[i][1];

    // 將 v 加入 u 的鄰接列表
    adjacencyTo[edgePointer] = v;
    adjacencyNext[edgePointer] = adjacencyHead[u];
    adjacencyHead[u] = edgePointer++;

    // 將 u 加入 v 的鄰接列表 (無向)
    adjacencyTo[edgePointer] = u;
    adjacencyNext[edgePointer] = adjacencyHead[v];
    adjacencyHead[v] = edgePointer++;
  }

  // 使用 BFS 計算每個節點的深度奇偶性 (偶/奇)
  const depthParity = new Int8Array(numberOfNodes).fill(-1); // -1: 未訪問, 0: 偶, 1: 奇
  let queueStart = 0;
  let queueEnd = 0;
  depthParity[0] = 0; // 根節點深度為偶數 (0)
  bfsQueue[queueEnd++] = 0;

  let evenDepthCount = 1; // 根節點為偶數深度
  let oddDepthCount = 0;

  while (queueStart < queueEnd) {
    const current = bfsQueue[queueStart++]; // 佇列取出
    // 訪問所有鄰居
    for (let adjIndex = adjacencyHead[current]; adjIndex !== -1; adjIndex = adjacencyNext[adjIndex]) {
      const neighbor = adjacencyTo[adjIndex];

      if (depthParity[neighbor] !== -1) {
        continue; // 已經訪問
      }

      // 設定鄰居的奇偶（從父節點取反）
      const newParity = depthParity[current] ^ 1;
      depthParity[neighbor] = newParity;

      // 統計奇偶數量
      if (newParity === 0) {
        evenDepthCount++;
      } else {
        oddDepthCount++;
      }

      // 將鄰居加入佇列
      bfsQueue[queueEnd++] = neighbor;
    }
  }

  // 回傳此樹的奇偶陣列與計數
  return {
    parity: depthParity,
    evenCount: evenDepthCount,
    oddCount: oddDepthCount,
  };
}
```

### Step 4：計算第一棵與第二棵樹的奇偶計數

利用上面的幫助函式，分別計算第一棵樹的偶數和奇數深度節點數量及每個節點的深度奇偶。
同理，計算第二棵樹的節點數量。

```typescript
// 4. 計算第一棵樹（Tree 1）與二棵樹（Tree 2）的深度奇偶陣列與偶/奇節點數
const {
  parity: parityTreeOne,
  evenCount: evenTreeOne,
  oddCount: oddTreeOne,
} = computeParityCounts(edges1, numberOfNodesTreeOne);

const {
  evenCount: evenTreeTwo,
  oddCount: oddTreeTwo,
} = computeParityCounts(edges2, numberOfNodesTreeTwo);
```

### Step 5：選擇 Tree 2 中最佳的偶距離節點數

跨樹時距離會翻轉奇偶性，選擇 Tree 2 中偶數或奇數深度較多者（跨樹後將成為偶距離），以最大化總可達偶距離節點數。

```typescript
// 5. 跨樹會翻轉奇偶，選擇第二棵樹中節點數較多的一方作為跨樹後的偶距離節點數
const bestOddDistanceCountInTreeTwo = evenTreeTwo > oddTreeTwo
  ? evenTreeTwo
  : oddTreeTwo;
```

### Step 6：針對第一棵樹的每個節點計算最終答案

對於每個節點，根據其深度奇偶，計算其在本樹內的可達偶距離節點數，再加上最佳 Tree 2 偶距離數即為答案。

```typescript
// 6. 針對 Tree 1 的每個節點，根據其深度奇偶計算可目標到的 Tree 1 節點數，再加上最佳 Tree 2 偶距離數
const result = new Array<number>(numberOfNodesTreeOne);
const differenceEvenOddTreeOne = evenTreeOne - oddTreeOne;
for (let node = 0; node < numberOfNodesTreeOne; node++) {
  // 若為奇深度，需扣除偶奇差；若為偶深度，則直接使用 evenTreeOne
  result[node] =
    evenTreeOne
    - parityTreeOne[node] * differenceEvenOddTreeOne
    + bestOddDistanceCountInTreeTwo;
}
```

### Step 7：回傳最終答案

最後回傳所有節點的最大可達目標節點數。

```typescript
// 7. 回傳最終答案陣列
return result;
```

## 時間複雜度

- 計算兩棵樹的深度奇偶各需一次 BFS，時間為 $O(n)$ 及 $O(m)$；
- 之後再遍歷第一棵樹的每個節點一次，為 $O(n)$；
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- CSR 結構與深度陣列共佔用 $O(n + m)$；
- BFS 佇列與結果陣列分別佔用 $O(\max(n,m))$ 及 $O(n)$；
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
