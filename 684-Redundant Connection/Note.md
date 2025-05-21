# 684. Redundant Connection

In this problem, a tree is an undirected graph that is connected and has no cycles.

You are given a graph that started as a tree with `n` nodes labeled from `1` to `n`, with one additional edge added. 
The added edge has two different vertices chosen from `1` to `n`, and was not an edge that already existed. 
The graph is represented as an array edges of length `n` where `edges[i] = [a_i, b_i]` indicates that 
there is an edge between nodes `a_i` and `b_i` in the graph.

Return an edge that can be removed so that the resulting graph is a tree of `n` nodes. 
If there are multiple answers, return the answer that occurs last in the input.

**Constraints:**

- `n == edges.length`
- `3 <= n <= 1000`
- `edges[i].length == 2`
- `1 <= a_i < b_i <= edges.length`
- `a_i != b_i`
- There are no repeated edges.
- The given graph is connected.

## 基礎思路

我們可以換個角度來看這個問題，我們可以將這個問題轉換成尋找一個圖中的cycle，並且返回這個cycle中的最後一個邊。

為了節省時間，我們可以使用 DSU (Disjoint Set Union) 來實現這個問題。
 - 在圖中，如果兩個節點之間已經通過其他邊相連，它們會屬於同一個集合。
 - 如果我們再加入一個邊，且這個邊的兩個節點屬於同一個集合，那麼這個邊就是多餘的。
 - 為了節省空間，我們能用單個陣列追蹤每個節點的父節點，來代表集合。

## 解題步驟

### Step 1: 定義查找 root 的函數

```typescript
const findRoot = (parent: number[], node: number): number => {
  if (parent[node] !== node) {
    // 路徑壓縮：將當前節點的父節點指向集合的根節點
    parent[node] = findRoot(parent, parent[node]);
  }
  return parent[node];
};
```

### Step 2: 定義合併集合的函數

```typescript
const unionSets = (parent: number[], node1: number, node2: number): void => {
  // 將 node1 的根節點指向 node2 的根節點
  parent[findRoot(parent, node1)] = findRoot(parent, node2);
};
```

### Step 3: 初始化 parent 陣列

```typescript
// 我們初始化一個長度為 edges.length + 1 的陣列，並且將每個節點的父節點設置為自己
const parent = new Array(edges.length + 1).fill(0).map((_, index) => index);
```

### Step 4: 遍歷邊，並且判斷是否有 cycle

```typescript
for (const [node1, node2] of edges) {
  // 如果兩個節點有相同的根節點，則這個邊是多餘的
  if (findRoot(parent, node1) === findRoot(parent, node2)) {
    return [node1, node2];
  }
  // 否則，我們將這兩個節點合併到同一個集合中
  unionSets(parent, node1, node2);
}
```

## Step 5: 當沒有 cycle 時，返回空陣列

這是一個好習慣，確保我們的程式碼能夠處理所有的情況。即便題目中不會出現這種情況，但是我們還是應該要考慮到這種情況。

```typescript
return [];
```

## 時間複雜度

- 每次 findRoot 和 unionSets 操作的時間複雜度為 $O(\alpha(n))$，其中 $\alpha(n)$ 是[阿克曼函數](https://en.wikipedia.org/wiki/Ackermann_function)的反函數。由於 $\alpha(n)$ 的增長速度極慢，在實際應用中可視為常數時間。
- 總體遍歷所有邊的操作 需要進行 $n$ 次 findRoot 和 unionSets 操作。時間複雜度為 $O(n \cdot \alpha(n))$。
- 總體時間複雜度為 $O(n \cdot \alpha(n))$。

> $O(n \cdot \alpha(n))$

## 空間複雜度

- Parent 陣列的空間複雜度為 $O(n)$
- 其他變數的空間複雜度為 $O(1)$
- 總體空間複雜度為 $O(n)$

> $O(n)$
