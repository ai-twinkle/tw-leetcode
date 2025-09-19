# 3108. Minimum Cost Walk in Weighted Graph

There is an undirected weighted graph with n vertices labeled from `0` to `n - 1`.

You are given the integer `n` and an array `edges`, 
where $\text{edges}[i] = [u_i, v_i, w_i]$ indicates that there is an edge between vertices $u_i$ and $v_i$ with a weight of $w_i$.

A walk on a graph is a sequence of vertices and edges. 
The walk starts and ends with a vertex, and each edge connects the vertex that comes before it and the vertex that comes after it. 
It's important to note that a walk may visit the same edge or vertex more than once.

The cost of a walk starting at node `u` and ending at node `v` is defined as the bitwise AND of the weights of the `edges` traversed during the walk. 
In other words, if the sequence of edge weights encountered during the walk is $w_0, w_1, w_2, ..., w_k$, 
then the cost is calculated as $w_0 \& w_1 \& w_2 \& ... \& w_k$, where `&` denotes the bitwise AND operator.

You are also given a 2D array query, where $\text{query}[i] = [s_i, t_i]$. 
For each query, you need to find the minimum cost of the walk starting at vertex $s_i$ and ending at vertex $t_i$. 
If there exists no such walk, the answer is `-1`.

Return the array `answer`, where `answer[i]` denotes the minimum cost of a walk for query `i`.

**Constraints:**

- `3 <= nums.length <= 10^5`
- `0 <= nums[i] <= 1`

## 基礎思路

這題的核心是使用 Disjoint Set Union（DSU），也稱為 Union-Find，來快速查詢與合併節點之間的連通性與成本。

最初，每個節點獨立成為一個集合，成本初始設為 `131071`（二進位下 17 個 1 的數字）。
我們會依序處理每一條邊，將邊的兩端節點所在的集合合併起來，同時更新集合的成本。

成本的更新規則是：將兩個集合原本的成本與當前邊的成本進行位元 AND 運算（`&`），得到新的成本。
透過位元運算可以保留兩個集合以及當前邊的共有特性，作為該集合的最終成本。

最後，針對每次查詢，檢查兩個節點是否位於同一集合中：

- 若在同一集合，回傳該集合累積的成本。
- 若不在同一集合，代表兩節點無法連通，回傳 `-1`。
- 若查詢的兩個節點相同，回傳 `0`。

## 解題步驟

### Step 1: 初始化 DSU 結構

初始時，每個節點都是自己的父節點，成本設為初始值 `131071`。

```typescript
const parent: number[] = [];
const costs: number[] = [];
const initialCost = 131071;

for (let i = 0; i < n; i++) {
  parent[i] = i;
  costs[i] = initialCost;
}
```

### Step 2: 實現 DSU 查詢函數（merge）

透過遞迴實現集合代表的查找，並且透過路徑壓縮（path compression）優化。

```typescript
const merge = (v: number): number => {
  if (parent[v] !== v) {
    parent[v] = merge(parent[v]);
  }
  return parent[v];
};
```

### Step 3: 處理邊並合併集合

依序處理每個邊，合併不同的集合，並更新集合的成本：

```typescript
for (const [u, v, w] of edges) {
  const rootU = merge(u);
  const rootV = merge(v);
  
  // 合併兩個集合
  parent[rootU] = rootV;
  
  // 更新成本：將兩集合成本及邊權重位元 AND
  costs[rootU] = costs[rootV] = costs[rootU] & costs[rootV] & w;
}
```

### Step 4: 扁平化 DSU 結構

為確保後續查詢快速，將每個節點的父節點直接指向最終集合代表：

```typescript
for (let i = 0; i < n; i++) {
  parent[i] = merge(i);
}
```

### Step 5: 處理查詢並返回結果

對每個查詢，依照下列規則返回結果：

- 若兩節點相同，返回 `0`。
- 若兩節點位於同一集合，返回集合累積的成本。
- 若兩節點不在同一集合，返回 `-1`。

```typescript
const result: number[] = [];

for (const [s, t] of queries) {
  if (s === t) {
    result.push(0);
  } else if (parent[s] === parent[t]) {
    result.push(costs[parent[s]]);
  } else {
    result.push(-1);
  }
}

return result;
```

## 時間複雜度

- 初始化 DSU 結構需遍歷全部節點一次，時間複雜度為 $O(n)$。
- 處理邊的過程中，每條邊合併操作經由 DSU 的路徑壓縮，平均單次近似 $O(α(n))$（逆阿克曼函數，近似常數時間）。總邊處理近似 $O(mα(n)) \approx O(m)$。
- 處理查詢需遍歷所有節點一次進行壓縮，時間複雜度為 $O(nα(n)) \approx O(n)$。
- 查詢階段，單次查詢為 $O(1)$，總共 $q$ 次查詢為 $O(q)$。
- 總時間複雜度為 $O(n + m + q)$。

> $O(n + m + q)$

## 空間複雜度

- 使用了三個大小為節點數目的陣列（`parent`, `costs`），空間複雜度為 $O(n)$。
- 此外僅使用常數額外變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
