# 2493. Divide Nodes Into the Maximum Number of Groups

You are given a positive integer `n` representing the number of nodes in an undirected graph. 
The nodes are labeled from `1` to `n`.

You are also given a 2D integer array edges, where `edges[i] = [a_i, b_i]` indicates 
that there is a bidirectional edge between nodes `a_i` and `b_i`. 
Notice that the given graph may be disconnected.

Divide the nodes of the graph into `m` groups (1-indexed) such that:

- Each node in the graph belongs to exactly one group.
- For every pair of nodes in the graph that are connected by an edge `[ai, bi]`, 
- if `a_i` belongs to the group with index `x`, and `b_i` belongs to the group with index `y`, then `|y - x| = 1`.

Return the maximum number of groups (i.e., maximum `m`) into which you can divide the nodes. 
Return `-1` if it is impossible to group the nodes with the given conditions.

## 基礎思路

這個問題可以被轉換成以下三個子問題：

1. 有效性檢查：確保節點之間的分層結構**
   - 核心問題是檢查節點集合是否能形成合法的層次結構。也就是每對相鄰節點之間的層級差必須剛好相差 1。
   - 如果無法滿足此條件，則無法進行有效分組。

2. 雙分圖判定
   - 每個連通子圖需要檢查是否是**雙分圖** (可以將節點分成兩個不相交的集合，並且每條邊都連接不同集合中的節點)。
   - 雙分圖的性質自然保證了相鄰節點位於不同層級上，從而滿足「層級差 1」的需求。反之，則無法有效地分層並劃分組，直接返回無效。

3. 最大組數計算：依據層級深度劃分
   - 當確認連通子圖是雙分圖後，我們可以根據每個節點的 **層級深度** 來進行分組。
   - 每個不同層級對應一個獨立的組，因此 **最大組數 = 子圖中節點的最大層次深度 + 1**。
   - 節點越多層級，代表我們可以分配的組數越多。


> Tips:
>在進行雙分圖檢查的同時，可以同步記錄每個節點的層級深度，從而減少額外的遍歷操作，提高效率。

## 解題步驟

### Step 1: 建立 Adjacency List

首先，我們需要將給定的邊列表轉換為鄰接表形式，且轉成 0-based index。

```typescript
// 無向圖的鄰接表
const adjacencyList: number[][] = Array.from({ length: n }, () => []);

for (const [u, v] of edges) {
  // 轉換為 0-based index
  const uIndex = u - 1;
  const vIndex = v - 1;
  adjacencyList[uIndex].push(vIndex);
  adjacencyList[vIndex].push(uIndex);
}
```

### Step 2: 定義紀錄訪問狀態的數組

我們需要定義一個數組 `globalVisited` 來記錄節點的訪問狀態，並初始化為 `false`，表示未訪問。

```typescript
const globalVisited: boolean[] = Array(n).fill(false);
```

### Step 3: 檢查並計算最大層級 (getMaxLayerCount)

在此步驟中，我們需要對某個節點進行廣度優先搜索（BFS），以：
1. 檢查相鄰節點之間的距離是否恰好差 1。
2. 找出整個可達範圍中，節點所能達到的 **最大層級**（即最大 BFS 深度）。

> **作法**：
> - 建立一個 `distance` 陣列來儲存節點的 BFS 深度（預設值為 `-1`）。
> - 將起點 `startNode` 的 `distance` 設為 0，並使用佇列（queue）進行層級遍歷。
> - 過程中，若發現任何相鄰節點的距離差異不是 1，表示無法滿足層次分組需求，則回傳 `-1`。
> - 若全程合法，則回傳最大層級數（`maxLayer`）。

```typescript
function getMaxLayerCount(startNode: number): number {
  const distance: number[] = Array(n).fill(-1);
  distance[startNode] = 0;

  const queue: number[] = [startNode];
  let maxLayer = 1;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distance[current];

    for (const neighbor of adjacencyList[current]) {
      if (distance[neighbor] === -1) {
        distance[neighbor] = currentDist + 1;
        maxLayer = Math.max(maxLayer, distance[neighbor] + 1);
        queue.push(neighbor);
        continue;
      }
      if (Math.abs(distance[neighbor] - currentDist) !== 1) {
        return -1; // 層級差異不為 1，無法分組
      }
    }
  }

  return maxLayer; // 回傳最大層級數
}
```

### Step 4: 探索連通子圖 (exploreComponent)

為了找出整個圖中所有節點的分組方式，需要先找出每個 **連通子圖**，並對子圖進行雙分圖檢查及最大層級計算：

1. **收集子圖節點**
    - 以 `startNode` 為起點，使用 BFS 走訪整個子圖；並透過 `globalVisited` 標記已探索的節點，防止重複處理。
    - 過程中順便檢查 **雙分圖衝突**（若有兩個相鄰節點的「BFS 距離」相同，表示衝突）。

2. **計算該子圖的最大層級**
    - 若子圖沒有衝突，則對該子圖中的每個節點呼叫 `getMaxLayerCount(node)`，找出最大層級值。
    - 若任何節點無法形成有效的層級分組，則整個子圖無效，回傳 `-1`。

```typescript
function exploreComponent(startNode: number): number {
  // 1. BFS 探索子圖 + 雙分圖檢查
  const queue: number[] = [startNode];
  const distance: number[] = Array(n).fill(-1);
  distance[startNode] = 0;
  globalVisited[startNode] = true;

  const componentNodes: number[] = [startNode];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distance[current];

    for (const neighbor of adjacencyList[current]) {
      if (distance[neighbor] === -1) {
        distance[neighbor] = currentDist + 1;
        queue.push(neighbor);
        componentNodes.push(neighbor);
        globalVisited[neighbor] = true;
        continue;
      }
      // 相鄰節點若是同一層 (距離相同)，表示非雙分圖，無法分組
      if (distance[neighbor] === currentDist) {
        return -1;
      }
    }
  }

  // 2. 尋找該子圖的最大層級
  let maxGroups = 1;
  for (const node of componentNodes) {
    const layerCount = getMaxLayerCount(node);
    if (layerCount === -1) {
      return -1;
    }
    maxGroups = Math.max(maxGroups, layerCount);
  }

  return maxGroups;
}
```

### Step 5: 主流程 - 合計所有子圖的組數

最後，透過一個主迴圈將所有節點逐一檢查，對每個 **尚未造訪 (globalVisited 為 false)** 的節點呼叫 `exploreComponent(i)`。
- 若 **子圖非法**（回傳 `-1`），整個問題就無解，回傳 `-1`。
- 否則將所有子圖的最大組數加總後，作為最終答案。

```typescript
let totalMaxGroups = 0;

for (let i = 0; i < n; i++) {
  if (globalVisited[i]) {
    continue;
  }

  const resultForComponent = exploreComponent(i);
  if (resultForComponent === -1) {
    return -1; // 任一子圖無效，直接結束
  }

  totalMaxGroups += resultForComponent;
}

return totalMaxGroups; // 回傳所有子圖組數的總和
```

## 時間複雜度
- 建立鄰接表需要將所有邊掃描一次，耗時 $O(E)$。
- 處理所有節點與子圖時：
    1. `exploreComponent` 會以 BFS 走訪子圖中的每個節點，各子圖加總後約為 $O(N + E)$。
    2. 不過在 `exploreComponent` 中，還會對該子圖的每個節點呼叫 `getMaxLayerCount`（又是一個 BFS）。在最壞情況（整張圖是單一連通子圖）下，對 $N$ 個節點各做一次 BFS，單次 BFS 為 $O(N + E)$
    3. 因此最壞情況的整體時間複雜度可達 $O\bigl(N \times (N + E)\bigr)$

> $O\bigl(N \times (N + E)\bigr)$

## 空間複雜度
- **鄰接表**：需要儲存所有節點與邊的關係，約為 $O(N + E)$。
- **輔助陣列**：包含 `globalVisited`、`distance` 等大小為 $N$ 的結構，因此額外空間複雜度為 $O(N)$。
- **整體**：主要被鄰接表佔用，故空間複雜度為

> $O(N + E)$
