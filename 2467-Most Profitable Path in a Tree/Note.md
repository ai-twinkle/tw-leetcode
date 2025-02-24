# 2467. Most Profitable Path in a Tree

There is an undirected tree with n nodes labeled from `0` to `n - 1`, rooted at node `0`. 
You are given a 2D integer array edges of length `n - 1` 
where `edges[i] = [a_i, b_i]` indicates that there is an edge between nodes `a_i` and `b_i` in the tree.

At every node `i`, there is a gate. 
You are also given an array of even integers amount, where `amount[i]` represents:

- the price needed to open the gate at node `i`, if `amount[i]` is negative, or,
- the cash reward obtained on opening the gate at node `i`, otherwise.\

The game goes on as follows:

- Initially, Alice is at node `0` and Bob is at node `bob`.
- At every second, Alice and Bob each move to an adjacent node. Alice moves towards some leaf node, while Bob moves towards node `0`.
- For every node along their path, Alice and Bob either spend money to open the gate at that node, or accept the reward. 
  Note that:
  - If the gate is already open, no price will be required, nor will there be any cash reward.
  - If Alice and Bob reach the node simultaneously, they share the price/reward for opening the gate there. 
    In other words, if the price to open the gate is `c`, then both Alice and Bob pay `c / 2` each. 
    Similarly, if the reward at the gate is `c`, both of them receive `c / 2` each.
  - If Alice reaches a leaf node, she stops moving. Similarly, if Bob reaches node `0`, he stops moving. 
    Note that these events are independent of each other.

Return the maximum net income Alice can have if she travels towards the optimal leaf node.

## 基礎思路

我們可以換個方式思考，可以拆解成兩個問題：

- Bob 從起始節點出發沿著唯一的路徑向根節點移動，所以每個節點上的 Bob 到達時間可以理解為從 Bob 到該節點的最短步數。
- Alice 從根節點出發，沿著各條路徑走到葉子，每到一個節點就根據該節點 Bob 的到達時間與自己的步數（也就是當前 DFS 深度）進行收益計算，
並且在路徑中只取收益最大的那一條（因為 Alice 只會選擇一條路徑）。

我們固然可以分別做 Depth First Search 來計算 Bob 到達時間和 Alice 的最大收益，但是這樣會有重複計算的問題。

我們可以合併這兩個過程，方法如下：

- 當我們從根開始 DFS 時，遞迴向下時我們可以同時從子樹中回傳 Bob 的最短距離信息，
  並用該信息更新當前節點的 bob 到達時間（bobDist[node] = min(bobDist[node], bobDist[child] + 1)）。
- 遞迴過程中就能根據當前 DFS 深度（代表 Alice 到達該節點的時間）與該節點的 Bob 到達時間進行收益計算，這樣就不會有重複計算的問題。

這樣經過遍歷整棵樹，就能得到 Alice 的最大收益。

## 解題步驟

### Step 1: 初始化暫存與變數

我們須先建立 Adjacency List 來存儲樹的結構，並初始化 Bob 的距離為最大值。

```typescript
const n = amount.length;
const adj: number[][] = Array.from({ length: n }, () => []);
const bobDist: number[] = new Array(n).fill(n);
```

### Step 2: 建立 Adjacency List

轉換 Edges 陣列為 Adjacency List，這樣能方便接下來步驟使用。

```typescript
for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}
```

### Step 3: 遞迴計算 Bob 到達時間

進行 DFS 遞迴，計算 Bob 到達時間。
- 如果該節點是 Bob 的起點，則設定到達時間為 0。
- 遍歷所有子節點，更新 Bob 到達時間。
- 當知道 Bob 到達時間後，就能計算該節點 Alice 的收益。
- 最後，如果是葉子節點，則返回該節點的收益。反之則把子節點的最大收益加上當前節點的收益。

```typescript
function dfs(node: number, parent: number, depth: number): number {
  // 如果該節點是 Bob 的起點，則設定到達時間為 0。
  if (node === bob) {
    bobDist[node] = 0;
  }

  let bestChildProfit = -Infinity;
  let profitHere = 0;

  // 訪問所有子節點。
  for (let child of adj[node]) {
    if (child === parent) continue;
    const childProfit = dfs(child, node, depth + 1);
    bestChildProfit = childProfit > bestChildProfit ? childProfit : bestChildProfit;
    // 更新 Bob 到達時間。
    bobDist[node] = Math.min(bobDist[node], bobDist[child] + 1);
  }

  // 更新當前節點的收益:
  if (depth < bobDist[node]) {
    // 如果 Alice (depth) 比 Bob (bobDist[node]) 早到，則她可以獲得全部收益。
    profitHere += amount[node];
  } else if (depth === bobDist[node]) {
    // 如果 Alice 和 Bob 同時到達，則她只能獲得一半收益。
    profitHere += (amount[node] >> 1);  // 等效於 Math.floor(amount[node]/2)
  }

  // 如果沒有子節點貢獻收益（也就是葉子節點），則返回 profitHere。
  // 否則，加上最大子節點的收益。
  return bestChildProfit === -Infinity ? profitHere : profitHere + bestChildProfit;
}
```

## 時間複雜度

- 在建立 Adjacency List 時，需要遍歷所有邊，所以時間複雜度為 $O(n)$。
- 進行 Depth First Search 時，每個節點只會被訪問一次，所以時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- Adjacency List 需要 $O(n)$ 空間。
- 紀錄 Bob 到達時間的陣列需要 $O(n)$ 空間。
- 其他變數需要 $O(1)$ 空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
