# 1462. Course Schedule IV

There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. 
You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that 
you must take course `a_i` first if you want to take course `b_i`.

For example, the pair `[0, 1]` indicates that you have to take course `0` before you can take course `1`.
Prerequisites can also be indirect. 
If course `a` is a prerequisite of course `b`, 
and course `b` is a prerequisite of course `c`, then course `a` is a prerequisite of course `c`.

You are also given an array `queries` where `queries[j] = [uj, vj]`. 
For the `j_th` query, you should answer whether course `u_j` is a prerequisite of course `v_j` or not.

Return a boolean array answer, where `answer[j]` is the answer to the `j_th` query.

## 基礎思路
這題需要構建關聯表，然後查詢是否有關聯。我們可以把這題轉化成一個有向圖，然後查詢是否有路徑。
在這題我將採取深度優先搜索的方式來解決這個問題。

## 解題步驟

### Step 1: 初始化圖，並將直接關聯的節點加入圖中

```typescript
// 圖會是一個二維數組，用來記錄每個節點的關聯性
const graph: number[][] = Array.from({ length: numCourses }, () => []);

// 先把直接關聯的節點加入圖中
for (const [u, v] of prerequisites) {
   graph[u].push(v);
}
```

### Step 2: 深度優先搜索

```typescript
// 定義可到達的節點
const reachable = Array.from({ length: numCourses }, () => new Set<number>());

// 深度優先搜索
const dfs = (node: number) => {
   for (const neighbor of graph[node]) {
      // 如果已經建構過這個節點的關聯性，則跳過
      if (reachable[node].has(neighbor)) {
         continue;
      }

      // 新增節點到可到達的節點中
      reachable[node].add(neighbor);

      // 遞迴搜索其鄰居
      dfs(neighbor);

      // 新增鄰居的可到達節點到當前節點的可到達節點中
      for (const n of reachable[neighbor]) {
         reachable[node].add(n);
      }
   }
};
```

### Step 3: 遍歷所有節點，並進行深度優先搜索

```typescript
for (let i = 0; i < numCourses; i++) {
  dfs(i);
}
```

### Step 4: 查詢是否有關聯

```typescript
return queries.map(([u, v]) => reachable[u].has(v));
```

## 時間複雜度
- **建圖成本：**
   - 用鄰接表建圖的時間複雜度是 $O(m)$，這是所有預修課程所構成的邊的數量。

- **DFS 及可達性集合 (Union 操作)：**
   - **DFS 遍歷的部分：** 每次從一個節點開始進行 DFS，在遍歷的過程中，每條邊最多被訪問一次，所以這部分的遍歷成本為 $O(m)$。
   - **更新集合的部分：** 每次進行集合合併操作時，可能需要將 $reachable[neighbor]$ 的所有節點合併到 $reachable[node]$。在最壞情況下，這個集合可能包含最多 $O(n)$ 節點。  
     因此，每次合併的成本是 $O(n)$，而且每條邊的操作成本因此變為 $O(n)$。  
     DFS 和集合合併操作的總成本是：  
     $$
     O(n \cdot (n + m)) = O(n^2 + n \cdot m)
     $$  
     因為我們需要對每個節點執行 DFS，總成本乘以 $n$，得到：
     $$
     O(n \cdot (n^2 + n \cdot m)) = O(n^3 + n^2 \cdot m)
     $$

- **查詢成本：**  
   每次查詢 $reachable[u]$ 是否包含 $v$ 是 $O(1)$，對於 $q$ 個查詢，總成本是 $O(q)$。

> $O(n^3 + n^2 \cdot m + m + q) \approx O(n^3 + n^2 \cdot m)$

## 空間複雜度

- **鄰接表儲存空間：** $O(n + m)$。
- **Reachable 集合儲存空間：** $O(n^2)$，因為每個節點最多需要儲存 $n$ 個可達節點。
- **遞歸堆疊：** 最深可能達到 $O(n)$。

> $O(n^2 + m)$
