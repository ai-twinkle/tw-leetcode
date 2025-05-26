# 1857. Largest Color Value in a Directed Graph

There is a directed graph of `n` colored nodes and `m` edges. 
The nodes are numbered from `0` to `n - 1`.

You are given a string `colors` where `colors[i]` is a lowercase English letter representing the color of the $i^{th}$ node in this graph (0-indexed). 
You are also given a 2D array `edges` where $\text{edges}[j] = [a_j, b_j]$ indicates that there is a directed edge from node $a_j$ to node $b_j$.

A valid path in the graph is a sequence of nodes $x_1$ -> $x_2$ -> $x_3$ -> ... -> $x_k$ such 
that there is a directed edge from $x_i$ to $x_{i+1}$ for every `1 <= i < k`. 
The color value of the path is the number of nodes that are colored the most frequently occurring color along that path.

Return the largest color value of any valid path in the given graph, or `-1` if the graph contains a cycle.

**Constraints:**

- `n == colors.length`
- `m == edges.length`
- `1 <= n <= 10^5`
- `0 <= m <= 10^5`
- `colors` consists of lowercase English letters.
- `0 <= a_j, b_j < n`

## 基礎思路

本題要計算一個有向圖中任意合法路徑上出現次數最多的顏色的最大值，但如果圖中含有環路，則直接返回`-1`。
因此，我們可以利用以下步驟來解決問題：

- **判斷有向圖是否存在環**
  透過計算節點入度，執行拓撲排序（Topological Sort）判斷圖是否有環：
  若無法完整拜訪所有節點，則有環，回傳 `-1`。

- **使用動態規劃 (DP) 求解合法路徑上最多顏色數量**
  利用拓撲排序過程，從入度為 0 的節點逐步遍歷到後繼節點，同時用 DP 表紀錄每個節點從起點到目前節點之間，每種顏色出現次數的最大值。

最後返回所有 DP 值中最大的顏色出現次數，即為題目答案。

## 解題步驟

#### Step 1：將每個節點的顏色字母映射成整數（0～25）

例如，`'a'` 對應 0，`'b'` 對應 1，依此類推至 `'z'` 為 25。

```typescript
// 將每個節點的顏色轉為數字 0 到 25，以便後續DP處理。
const nodeColorIndices = new Uint8Array(numberOfNodes);
for (let i = 0; i < numberOfNodes; i++) {
  nodeColorIndices[i] = colors.charCodeAt(i) - 97;
}
```

#### Step 2：計算每個節點的入度與出度

- 入度：進入節點的邊數量，用於拓撲排序。
- 出度：從節點出去的邊數量，用於建構 CSR 結構。

```typescript
// 初始化每個節點的入度和出度，計算圖的基本結構資訊。
const inDegreeCounts = new Uint32Array(numberOfNodes);
const outDegreeCounts = new Uint32Array(numberOfNodes);
for (let i = 0; i < numberOfEdges; i++) {
  const [sourceNode, targetNode] = edges[i];
  inDegreeCounts[targetNode]++;
  outDegreeCounts[sourceNode]++;
}
```

#### Step 3：建構 CSR（Compressed Sparse Row）頭指標陣列

CSR 結構可在後續高效遍歷節點的鄰居。

```typescript
// 建立 CSR 陣列，方便快速存取每個節點的所有鄰居。
const headIndices = new Uint32Array(numberOfNodes + 1);
for (let i = 0; i < numberOfNodes; i++) {
  headIndices[i + 1] = headIndices[i] + outDegreeCounts[i];
}
```

#### Step 4：建立 CSR 鄰接串列

存放每個節點的鄰居節點，提供快速邊訪問能力。

```typescript
// 複製 headIndices 作為寫入指標，將邊存放於鄰接陣列中。
const writePointers = headIndices.slice(0, numberOfNodes);
const adjacencyList = new Uint32Array(numberOfEdges);
for (let i = 0; i < numberOfEdges; i++) {
  const [sourceNode, targetNode] = edges[i];
  adjacencyList[writePointers[sourceNode]++] = targetNode;
}
```

#### Step 5：初始化 DP 表與拓撲排序的隊列

- `dpColorCounts` 儲存每個節點到達時各顏色的最大次數。
- `topologicalQueue` 用於拓撲排序。

```typescript
// 初始化 DP 表 (紀錄每個節點對所有顏色的出現次數)，以及拓撲排序所需變數。
const dpColorCounts = new Uint32Array(numberOfNodes * LETTER_COUNT);
const topologicalQueue = new Uint32Array(numberOfNodes);
let queueHeadIndex = 0;
let queueTailIndex = 0;
let visitedNodeCount = 0;
let maximumColorValue = 0;
```

#### Step 6：拓撲排序初始化（將入度為 0 的節點加入隊列）

為後續 DP 傳播做準備。

```typescript
// 將入度為 0 的節點加入拓撲排序起始隊列，並設定其顏色出現次數為 1。
for (let i = 0; i < numberOfNodes; i++) {
  if (inDegreeCounts[i] === 0) {
    topologicalQueue[queueTailIndex++] = i;
    const dpIndex = i * LETTER_COUNT + nodeColorIndices[i];
    dpColorCounts[dpIndex] = 1;
    maximumColorValue = 1;
  }
}
```

#### Step 7：拓撲排序並執行 DP 更新

拓撲排序會依序處理圖中的每個節點，並將節點的狀態 (顏色次數資訊) 透過有向邊傳遞給後續節點。這個步驟包含以下子步驟：

1. 從隊列中取出節點並累計已訪問節點數。
2. 使用 CSR 陣列快速取得該節點的所有鄰居節點。
3. 對每個鄰居節點：

   - **更新鄰居節點自身顏色**的 DP 狀態：將當前節點中此顏色的 DP 值 +1，表示此顏色在路徑上再多出現一次。
   - **更新其他顏色的 DP 狀態**：由於鄰居節點並未增加這些其他顏色，因此直接從當前節點將這些顏色的 DP 值傳遞過去（若更大則更新）。
   - 若鄰居節點的入度減少到 0，代表所有前驅節點皆處理完成，將此鄰居節點加入拓撲排序隊列。

```typescript
// 當拓撲排序隊列還有節點未處理時，持續進行
while (queueHeadIndex < queueTailIndex) {
  
  // 從隊列頭取出一個節點做為當前處理節點
  const currentNode = topologicalQueue[queueHeadIndex++];
  visitedNodeCount++; // 記錄已處理的節點數目
  
  // 取得當前節點DP表起始索引位置
  const baseIndexU = currentNode * LETTER_COUNT;

  // 從CSR結構(headIndices)快速取出當前節點的鄰居節點範圍
  const startEdge = headIndices[currentNode];
  const endEdge = headIndices[currentNode + 1];

  // 遍歷當前節點的所有鄰居節點
  for (let edgePointer = startEdge; edgePointer < endEdge; edgePointer++) {

    // 取得鄰居節點編號及DP起始位置
    const neighborNode = adjacencyList[edgePointer];
    const baseIndexV = neighborNode * LETTER_COUNT;

    // 鄰居節點自身的顏色索引 (0~25)
    const neighborColorIdx = nodeColorIndices[neighborNode];

    // 7.1 更新鄰居自身顏色的 DP 值
    // 代表經過當前節點後再進入鄰居節點，此顏色的出現次數將加1
    const incrementedCount = dpColorCounts[baseIndexU + neighborColorIdx] + 1;
    
    // 如果透過此路徑的顏色次數更大，更新DP表並更新全局最大值
    if (incrementedCount > dpColorCounts[baseIndexV + neighborColorIdx]) {
      dpColorCounts[baseIndexV + neighborColorIdx] = incrementedCount;
      maximumColorValue = Math.max(maximumColorValue, incrementedCount);
    }

    // 7.2 傳播其他顏色的 DP 值
    // 除鄰居自身顏色外，其他顏色直接從當前節點傳遞給鄰居節點
    for (let i = 0; i < LETTER_COUNT; i++) {
      if (i !== neighborColorIdx) { // 跳過鄰居自身顏色，已經處理過了
        const propagatedValue = dpColorCounts[baseIndexU + i];

        // 若當前節點的此顏色出現次數比鄰居節點記錄的更多，則更新
        if (propagatedValue > dpColorCounts[baseIndexV + i]) {
          dpColorCounts[baseIndexV + i] = propagatedValue;
          maximumColorValue = Math.max(maximumColorValue, propagatedValue);
        }
      }
    }

    // 7.3 拓撲排序隊列更新
    // 鄰居節點入度減1，若入度歸零，代表所有前驅節點處理完成
    if (--inDegreeCounts[neighborNode] === 0) {
      // 將鄰居節點加入拓撲排序隊列尾部，後續會處理該節點
      topologicalQueue[queueTailIndex++] = neighborNode;
    }
  }
}
```

#### Step 8：判斷是否存在環並返回結果

```typescript
// 如果訪問節點數量不等於節點總數，表示存在環，返回 -1；否則返回最大顏色次數。
return visitedNodeCount === numberOfNodes ? maximumColorValue : -1;
```

## 時間複雜度

- 拓撲排序訪問每個節點與每條邊，皆為 $O(n + m)$。
- 對每個節點進行 DP 時，遍歷固定 26 種顏色，為常數操作 $O(26)$。
- 總時間複雜度為 $O(26(n + m))$，簡化後為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 使用 CSR 結構儲存邊資訊，消耗 $O(n + m)$ 空間。
- DP 表紀錄每節點 26 種顏色的次數，消耗 $O(26n)$ 空間。
- 總空間複雜度為 $O(26n + m)$，簡化後為 $O(n + m)$。

> $O(n + m)$
