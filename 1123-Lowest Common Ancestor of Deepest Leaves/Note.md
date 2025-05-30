# 1123. Lowest Common Ancestor of Deepest Leaves

Given the root of a binary tree, return the lowest common ancestor of its deepest leaves.

Recall that:

- The node of a binary tree is a leaf if and only if it has no children
- The depth of the root of the tree is `0`. 
  if the depth of a node is `d`, the depth of each of its children is `d + 1`.
- The lowest common ancestor of a set `S` of nodes, is the node `A` with the largest depth such 
  that every node in `S` is in the subtree with root `A`.

**Constraints:**

- The number of nodes in the tree will be in the range `[1, 1000]`.
- `0 <= Node.val <= 1000`
- The values of the nodes in the tree are unique.

## 基礎思路

這題要求找到一棵二叉樹中，**所有深度最大的葉子節點**之間的**最低共同祖先 (Lowest Common Ancestor, LCA)**。

要完成這個任務，可以透過**深度優先搜尋 (DFS)** 來遍歷整棵樹。在遍歷時，我們會記錄每個節點的**左右子樹能達到的最大深度**：

- 若某節點的**左右子樹深度相同**，表示該節點正好是這些最深葉子節點的共同祖先，我們就需要記錄它。
- 若有多個這樣的節點，因為我們從上往下遍歷，最後被記錄的節點一定是**最深**（即離葉子最近）的共同祖先。

最終，透過這樣的方式，就能成功找到並返回最低的共同祖先節點 (`lca`)。

## 解題步驟

### Step 1：初始化全局變數

在主函數 `lcaDeepestLeaves` 中，首先定義兩個全局變數：

- **maxDepth**：用來記錄遍歷過程中出現的最大深度。
- **lca**：用來存放目前找到的最低共同祖先節點。

```typescript
let maxDepth = 0;
let lca: TreeNode | null = null;
```

### Step 2.1：定義 DFS 遞迴函數並處理邊界條件

接著定義一個內部函數 `dfs`，用來遍歷二叉樹，並在遍歷的同時計算從當前節點開始能到達的最大深度。
- 當遇到 `null` 節點（即到達葉子的下一層）時，返回當前深度，表示該分支的終點。

```typescript
function dfs(node: TreeNode | null, depth: number): number {
  if (!node) return depth;
  
  //...
}
```

### Step 2.2：遞迴計算左右子樹的深度

對於非空節點，我們分別對其左子樹和右子樹進行遞迴呼叫，並將深度加 1。

- 這裡 `leftDepth` 與 `rightDepth` 分別代表左、右子樹中的最大深度，而 `currentMax` 則為當前節點子樹中的最深層次。

```typescript
function dfs(node: TreeNode | null, depth: number): number {
  // Step 2.1：定義 DFS 遞迴函數並處理邊界條件 ...

  const leftDepth = dfs(node.left, depth + 1);
  const rightDepth = dfs(node.right, depth + 1);
  const currentMax = Math.max(leftDepth, rightDepth);
  
  // ...
}
```

### Step 2.3：更新最低共同祖先

當左右子樹的深度相等時，表示當前節點為所有最深葉子節點的共同祖先；同時若此深度大於等於當前記錄的 `maxDepth`，則更新 `maxDepth` 與 `lca`。

- 此判斷邏輯確保只有當左右深度相同，且達到（或超過）全局最大深度時，才將當前節點視為新的最低共同祖先。

```typescript
function dfs(node: TreeNode | null, depth: number): number {
  // Step 2.1：定義 DFS 遞迴函數並處理邊界條件 ...

  // Step 2.2：遞迴計算左右子樹的深度 ...

  if (leftDepth === rightDepth && currentMax >= maxDepth) {
    maxDepth = currentMax;
    lca = node;
  }

  return currentMax;
}
```

### Step 3：啟動 DFS 遍歷並返回結果

從根節點開始呼叫 `dfs`，並最終返回更新後的全局變數 `lca` 作為結果。

```typescript
dfs(root, 0);
return lca;
```

## 時間複雜度

- **DFS 遍歷**：每個節點僅被訪問一次，因此總體時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **遞迴堆疊**：在最壞情況下（例如樹呈鏈狀），遞迴深度可能達到 $O(n)$。
- 其他變數僅佔用常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
