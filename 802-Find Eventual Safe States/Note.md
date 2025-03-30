# 802. Find Eventual Safe States

There is a directed graph of `n` nodes with each node labeled from `0` to `n - 1`. 
The graph is represented by a 0-indexed 2D integer array `graph` where 
`graph[i]` is an integer array of nodes adjacent to node `i`, 
meaning there is an edge from node `i` to each node in `graph[i]`.

A node is a terminal node if there are no outgoing edges. 
A node is a safe node if every possible path starting from that node leads to a terminal node (or another safe node).

Return an array containing all the safe nodes of the graph. The answer should be sorted in ascending order.

## 基礎思路
對於每個 Node 做 DFS，為了減少重複運算，我們用一個 visited 陣列來記錄每個 Node 的狀態，分為三種狀態：

- 0: 未訪問
- 1: 訪問中繼點
- 2: 安全

我們只對未訪問的 Node 做 DFS，如果 DFS 過程中遇到訪問中繼點，則表示有環，此 Node 不安全，直接回傳 false，並把該 Node 設為不安全。
如果 DFS 過程中沒有遇到不安全的 Node，則會把該 Node 設為安全，表示到達此解點的路徑都是安全的。

## 解題步驟

### Step 1: 紀錄 Graph 長度

```typescript
const n = graph.length;
```

### Step 2: 初始化 visited 陣列

```typescript
// 0: 未訪問, 1: 訪問中繼點, 2: 安全
const visited = new Array(n).fill(0);
```

### Step 3: 定義 DFS 函數

```typescript
function dfs(node: number): boolean {
  // 如果該 Node 已經訪問過，則直接回傳該 Node 是否是安全
  if (visited[node] > 0) {
    return visited[node] === 2;
  }

  // 設定該 Node 為訪問中繼點
  visited[node] = 1;

  // 持續檢查下一個 Node 是否安全
  // Note: 如果陣列是空的，則不會進入迴圈，會直接跳過 for 迴圈
  for (const next of graph[node]) {
    // 如果下一個 Node 不安全，則設定當前 Node 為不安全
    if (!dfs(next)) {
      return false;
    }
  }

  // 設定該 Node 為安全
  visited[node] = 2;
  return true;
}
```

### Step 4: 開始 DFS

```typescript
// 紀錄結果
const result: number[] = [];

// 檢查每個 Node 是否安全
for (let i = 0; i < n; i++) {
  // 如果 Node 是安全的，則加入結果中
  if (dfs(i)) {
    result.push(i);
  }
}
```

## 時間複雜度

- 每個 Node 與 Edge 都只會被訪問一次，所以時間複雜度為 $O(V + E)$

> $O(V + E)$

## 空間複雜度

- 額外使用了 visited 陣列，所以空間複雜度為 $O(V)$

> $O(V)$
