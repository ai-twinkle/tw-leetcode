# 2359. Find Closest Node to Given Two Nodes

You are given a directed graph of `n` nodes numbered from `0` to `n - 1`, where each node has at most one outgoing edge.

The graph is represented with a given 0-indexed array `edges` of size `n`, 
indicating that there is a directed edge from node `i` to node `edges[i]`. 
If there is no outgoing edge from `i`, then `edges[i] == -1`.

You are also given two integers `node1` and `node2`.

Return the index of the node that can be reached from both `node1` and `node2`, 
such that the maximum between the distance from `node1` to that node, and from `node2` to that node is minimized. 
If there are multiple answers, return the node with the smallest index, and if no possible answer exists, return `-1`.

Note that `edges` may contain cycles.

**Constraints:**

- `n == edges.length`
- `2 <= n <= 10^5`
- `-1 <= edges[i] < n`
- `edges[i] != i`
- `0 <= node1, node2 < n`

## 基礎思路

這題要我們找出一個節點，這個節點同時可以從 `node1` 和 `node2` 走過去，且兩人走過去的路徑「最長的那個」要盡量短。

- 如果有多個符合條件的節點，就選編號最小的；
- 如果找不到，回傳 `-1`。

我們可以這樣想：

- 因為每個節點最多只有一條出邊，所以這張圖只會是一堆鏈狀或環狀結構，路徑都很單純，不用怕太複雜。
- 我們可以先從 `node1` 開始一直往下走，順便把到每個節點的距離記錄下來。
- 再從 `node2` 出發一樣一路往下走，但這次遇到從 `node1` 也能到的節點，就把兩邊距離都算出來，取較大那個。
- 只要遇到更短的「最大距離」就更新答案；遇到一樣短就選編號較小的節點。
- 如果兩邊根本沒交集，就直接回傳 `-1`。

## 解題步驟

### Step 1：初始化與參數設定

- `totalNodes`：圖中節點總數。
- `outgoingEdges`：為 `edges` 設立簡短別名，避免多次存取原陣列時的額外開銷。

```typescript
const totalNodes = edges.length;
const outgoingEdges = edges; // 本地別名以加快索引存取速度
```

### Step 2：計算從 `node1` 到各節點的距離

- 使用 `distanceFromNodeOne` 陣列，初始化所有距離為 `-1`（表示未到達）。
- 循環沿著出邊前進，直到遇到 `-1`（無出邊）或已訪問的節點（遇到環）為止。

```typescript
// 1. 計算並記錄從 node1 到每個可到達節點的距離
const distanceFromNodeOne = new Int32Array(totalNodes).fill(-1);
let currentNode = node1;
let currentDistance = 0;
while (currentNode !== -1 && distanceFromNodeOne[currentNode] === -1) {
  distanceFromNodeOne[currentNode] = currentDistance;
  currentNode = outgoingEdges[currentNode];
  currentDistance++;
}
```

### Step 3：遍歷 `node2` 並尋找最小最大距離節點

- `visitedFromNodeTwo` 用於避免在環中重複走訪。
- 每次遇到同時可由 `node1` 與 `node2` 到達的節點時計算並比較最大距離 `maxDist`，更新最優解。

```typescript
// 2. 從 node2 遍歷，標記已訪問以避免循環—但不儲存所有距離
const visitedFromNodeTwo = new Uint8Array(totalNodes);
let closestMeetingNodeIndex = -1;
let minimalMaxDistance = totalNodes; // 真實的最大距離至多為 totalNodes-1

currentNode = node2;
currentDistance = 0;
while (currentNode !== -1 && visitedFromNodeTwo[currentNode] === 0) {
  visitedFromNodeTwo[currentNode] = 1;

  const distOne = distanceFromNodeOne[currentNode];
  if (distOne >= 0) {
    // 節點可由兩起點皆到達
    const maxDist = distOne > currentDistance ? distOne : currentDistance;
    if (
      maxDist < minimalMaxDistance ||
      (maxDist === minimalMaxDistance && currentNode < closestMeetingNodeIndex)
    ) {
      minimalMaxDistance = maxDist;
      closestMeetingNodeIndex = currentNode;
    }
  }

  currentNode = outgoingEdges[currentNode];
  currentDistance++;
}
```

### Step 4：返回結果

- 如果從未更新過 `closestMeetingNodeIndex`，則其值仍為 `-1`，符合題意返回 `-1`。

```typescript
return closestMeetingNodeIndex;
```

## 時間複雜度

- 由於圖中每個節點最多只有一條出邊，從 `node1` 出發不會走重複路徑，最壞情況下會遍歷到所有 $n$ 個節點，時間為 $O(n)$。
- 同理，從 `node2` 出發最多也只會遍歷 $n$ 個節點，且每個節點只會進入一次，時間為 $O(n)$。
- 包括陣列初始化與單一變數設定等操作，皆為 $O(n)$ 或 $O(1)$，相較之下可忽略不計。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 $n$ 的 Int32Array 來存放從 `node1` 出發到每個節點的距離，需要 $O(n)$ 空間。
- 使用一個長度為 $n$ 的 Uint8Array 來標記從 `node2` 出發是否已拜訪過每個節點，也需 $O(n)$ 空間。
- 其餘皆為常數空間 $O(1)$，如暫存節點、距離等。
- 總空間複雜度為 $O(n)$。

> $O(n)$
