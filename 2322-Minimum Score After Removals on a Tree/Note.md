# 2322. Minimum Score After Removals on a Tree

There is an undirected connected tree with `n` nodes labeled from `0` to `n - 1` and `n - 1` edges.

You are given a 0-indexed integer array `nums` of length `n` where `nums[i]` represents the value of the $i^{th}$ node. 
You are also given a 2D integer array `edges` of length `n - 1` where `edges[i] = [a_i, b_i]` indicates that there is an edge between nodes `a_i` and `b_i` in the tree.

Remove two distinct edges of the tree to form three connected components. For a pair of removed edges, the following steps are defined:

1. Get the XOR of all the values of the nodes for each of the three components respectively.
2. The difference between the largest XOR value and the smallest XOR value is the score of the pair.
   - For example, say the three components have the node values: `[4,5,7]`, `[1,9]`, and `[3,3,3]`. 
     The three XOR values are `4 ^ 5 ^ 7 = 6`, `1 ^ 9 = 8`, and `3 ^ 3 ^ 3 = 3`. 
     The largest XOR value is `8` and the smallest XOR value is `3`. 
     The score is then `8 - 3 = 5`.

Return the minimum score of any possible pair of edge removals on the given tree.

**Constraints:**

- `n == nums.length`
- `3 <= n <= 1000`
- `1 <= nums[i] <= 10^8`
- `edges.length == n - 1`
- `edges[i].length == 2`
- `0 <= a_i, b_i < n`
- `a_i != b_i`
- `edges` represents a valid tree.

## 基礎思路

本題的核心是要在一棵無向樹上，透過移除任意兩條邊，將原本的樹拆分成三個獨立的連通分量。
每次拆分之後，我們需要計算這三個連通分量各自所有節點值的 XOR，並求出最大的 XOR 與最小的 XOR 之差，即為此次拆分的分數。
我們的目標是找到所有可能拆分方式中，最小的分數。

為了有效地處理此問題，我們需要做到以下幾點：

- 先透過 DFS 計算出每個節點的子樹 XOR 值以及進入和離開的時間戳記，透過這個時間戳記，我們可以快速判斷任兩個節點之間的子樹包含關係。
- 利用上述資訊，我們接著枚舉所有可能的兩條邊移除方案，迅速地判斷移除這兩條邊後，會形成哪三個連通分量，進而計算 XOR 值，並持續更新最小的分數。

## 解題步驟

### Step 1：建立高效的樹狀資料結構（平面鄰接表）

首先，我們以平面鄰接表的形式建立樹的表示方式，以便後續能快速遍歷每個節點的鄰居：

```typescript
const nodeCount = nums.length;

// 建立平面鄰接表（head/next 陣列）
const head = new Int32Array(nodeCount).fill(-1);
const to = new Int32Array((nodeCount - 1) * 2);
const nextEdge = new Int32Array((nodeCount - 1) * 2);
let edgeIndex = 0;

for (let i = 0; i < edges.length; i++) {
  const [nodeA, nodeB] = edges[i];
  to[edgeIndex] = nodeB;
  nextEdge[edgeIndex] = head[nodeA];
  head[nodeA] = edgeIndex++;

  to[edgeIndex] = nodeA;
  nextEdge[edgeIndex] = head[nodeB];
  head[nodeB] = edgeIndex++;
}
```

### Step 2：透過 DFS 計算各節點子樹 XOR 及時間戳記

利用迭代的 DFS，計算出每個節點子樹的 XOR 值，並標記 DFS 的進入與離開時間，以便快速判斷節點間的關係：

```typescript
const subtreeXor = new Int32Array(nodeCount);
const entryTime = new Int32Array(nodeCount);
const exitTime = new Int32Array(nodeCount);

for (let i = 0; i < nodeCount; i++) {
  subtreeXor[i] = nums[i] | 0;  // 初始化子樹 XOR 值為自身節點值
}

let timeStamp = 0;
const stackNode = new Int32Array(nodeCount * 2);
const stackParent = new Int32Array(nodeCount * 2);
let stackPointer = 0;

// 從節點 0 開始 DFS，父節點設為 -1
stackNode[stackPointer] = 0;
stackParent[stackPointer] = -1;
stackPointer++;

while (stackPointer > 0) {
  stackPointer--;
  const current = stackNode[stackPointer];
  const parent = stackParent[stackPointer];

  if (current >= 0) {
    // 前序遍歷：記錄進入時間
    entryTime[current] = timeStamp++;

    // 標記後序遍歷位置
    stackNode[stackPointer] = ~current;
    stackParent[stackPointer] = parent;
    stackPointer++;

    // 將所有子節點推入堆疊
    let edge = head[current];
    while (edge !== -1) {
      const neighbor = to[edge];
      if (neighbor !== parent) {
        stackNode[stackPointer] = neighbor;
        stackParent[stackPointer] = current;
        stackPointer++;
      }
      edge = nextEdge[edge];
    }
    continue;
  }

  // 後序遍歷：從子節點累積 XOR 值
  const realNode = ~current;
  let accumulated = subtreeXor[realNode];

  let edge = head[realNode];
  while (edge !== -1) {
    const neighbor = to[edge];
    if (neighbor !== parent) {
      accumulated ^= subtreeXor[neighbor];
    }
    edge = nextEdge[edge];
  }
  subtreeXor[realNode] = accumulated;
  exitTime[realNode] = timeStamp;
}
```

### Step 3：枚舉所有可能的邊移除方案，計算最小分數

我們嘗試移除每一對節點，依照三種情況（節點包含關係）快速計算每種拆分的分數：

```typescript
const totalXor = subtreeXor[0]; // 全樹 XOR 值
let bestScore = Number.MAX_SAFE_INTEGER;

for (let nodeU = 1; nodeU < nodeCount; nodeU++) {
  const xorU = subtreeXor[nodeU];
  const entryU = entryTime[nodeU];
  const exitU = exitTime[nodeU];

  for (let nodeV = nodeU + 1; nodeV < nodeCount; nodeV++) {
    const xorV = subtreeXor[nodeV];
    const entryV = entryTime[nodeV];

    let part1: number, part2: number, part3: number;

    if (entryV > entryU && entryV < exitU) {
      // V 在 U 的子樹中
      part1 = totalXor ^ xorU;
      part2 = xorU ^ xorV;
      part3 = xorV;
    } else if (entryU > entryV && entryU < exitTime[nodeV]) {
      // U 在 V 的子樹中
      part1 = totalXor ^ xorV;
      part2 = xorV ^ xorU;
      part3 = xorU;
    } else {
      // 兩者無子樹關係
      part1 = totalXor ^ xorU ^ xorV;
      part2 = xorU;
      part3 = xorV;
    }

    const currentMax = Math.max(part1, part2, part3);
    const currentMin = Math.min(part1, part2, part3);

    const currentScore = currentMax - currentMin;
    bestScore = Math.min(bestScore, currentScore);
  }
}
```

### Step 4：返回最小分數

```typescript
return bestScore;
```

## 時間複雜度

- 建立鄰接表與 DFS 遍歷皆為 $O(n)$。
- 最後枚舉所有兩兩節點組合為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用的輔助陣列 (鄰接表、DFS stack、時間戳記、XOR 陣列) 空間皆與節點數成正比。
- 總空間複雜度為 $O(n)$。

> $O(n)$
