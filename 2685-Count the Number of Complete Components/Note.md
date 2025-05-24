# 2685. Count the Number of Complete Components

You are given an integer `n`. 
There is an undirected graph with n vertices, numbered from `0` to `n - 1`. 
You are given a 2D integer array `edges` where $\text{edges}[i] = [ai, bi]$ denotes that 
there exists an undirected edge connecting vertices $a_i$ and $b_i$.

Return the number of complete connected components of the graph.

A connected component is a subgraph of a graph in which there exists a path between any two vertices, 
and no vertex of the subgraph shares an edge with a vertex outside of the subgraph.

A connected component is said to be complete if there exists an edge between every pair of its vertices.

**Constraints:**

- `1 <= n <= 50`
- `0 <= edges.length <= n * (n - 1) / 2`
- `edges[i].length == 2`
- `0 <= a_i, b_i <= n - 1`
- `a_i != b_i`
- There are no repeated edges.

## 基礎思路

題目要求統計圖中「完全連通分量」（complete connected components）的數量，也就是說在某個連通分量內任意兩個節點間都必須存在邊。我們可以利用下面兩個關鍵觀察：

1. **連通分量劃分**  
   透過並查集，我們可以將所有節點合併成各自的連通分量。在合併過程中，同時記錄每個分量內的節點數（size）。

2. **邊數驗證**  
   對於一個完全圖，若該分量中有 `k` 個節點，則邊數必須等於 $\frac{k \times (k-1)}{2}$。我們在合併時也同時累計每個分量內的邊數，最終只需要檢查累計的邊數是否正好等於完全圖所需的邊數。

最後，我們只需要遍歷所有節點，對每個節點的根節點進行檢查，若該分量的邊數等於完全圖所需的邊數，則該分量即為「完全連通分量」。

## 解題步驟

### Step 1：初始化與資料結構

我們需要準備以下幾個數組：
- **parents**：記錄每個節點的父節點，初始時每個節點都是獨立的一個分量。
- **size**：記錄每個分量的大小（節點數量）。
- **edgeCount**：記錄每個分量中累計的邊數。

同時定義一個輔助函數 `getCompleteEdgeCount` 用來計算給定節點數量的完全圖應有的邊數。

```typescript
const parents = new Array(n).fill(0).map((_, i) => i);
const size = new Array(n).fill(1);
const edgeCount = new Array(n).fill(0);

const getCompleteEdgeCount = (k: number) => (k * (k - 1)) / 2;
```

### Step 2：利用並查集合併節點

接下來，我們定義 `find` 函數來尋找節點的根，並採用「路徑縮減」（Path Halving）來加速查找。同時定義 `union` 函數，使用「按大小合併」（Union by Size）來合併兩個節點所在的分量。

在處理每條邊 `[u, v]` 時：
- 若 `u` 與 `v` 已經屬於同一分量，直接將該分量的 `edgeCount` 增加 1。
- 否則，合併兩個分量，同時累計邊數：新分量的邊數等於兩個分量原本的邊數加上當前這條邊（連接兩個分量）。

```typescript
const find = (node: number): number => {
  while (node !== parents[node]) {
    parents[node] = parents[parents[node]]; // 路徑縮減
    node = parents[node];
  }
  return node;
};

const union = (a: number, b: number): void => {
  const rootA = find(a);
  const rootB = find(b);

  // 如果已屬於同一分量，僅累計邊數
  if (rootA === rootB) {
    edgeCount[rootA]++;
    return;
  }

  // 按大小合併，將較小分量合併到較大分量
  if (size[rootA] < size[rootB]) {
    parents[rootA] = rootB;
    size[rootB] += size[rootA];
    edgeCount[rootB] += edgeCount[rootA] + 1;
  } else {
    parents[rootB] = rootA;
    size[rootA] += size[rootB];
    edgeCount[rootA] += edgeCount[rootB] + 1;
  }
};

// 遍歷每一條邊進行合併
for (const [u, v] of edges) {
  union(u, v);
}
```

### Step 3：檢查並計算完全連通分量

合併所有邊後，對每個節點進行遍歷，僅針對分量的根節點進行檢查。  
若某個分量的累計邊數 `edgeCount` 等於完全圖應有的邊數 `getCompleteEdgeCount(size)`，則這個連通分量即為「完全連通分量」。

```typescript
let completeComponents = 0;
for (let i = 0; i < n; i++) {
  if (parents[i] === i) { // i 為根節點
    if (edgeCount[i] === getCompleteEdgeCount(size[i])) {
      completeComponents++;
    }
  }
}
return completeComponents;
```

## 時間複雜度

- **合併操作**：對每條邊執行 `union`，均攜帶優化（路徑縮減與按大小合併），均攤時間複雜度近似 $O(α(n))$（α 為反阿克曼函數，實際可視為常數）。
- **遍歷所有節點**：$O(n)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- **parents, size, edgeCount 數組**：需要額外 $O(n)$ 的空間。
- 其他輔助變數僅為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
