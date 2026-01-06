# 1161. Maximum Level Sum of a Binary Tree

Given the `root` of a binary tree, the level of its root is `1`, the level of its children is `2`, and so on.

Return the smallest level `x` such that the sum of all the values of nodes at level `x` is maximal.

**Constraints:**

- The number of nodes in the tree is in the range `[1, 10^4]`.
- `-10^5 <= Node.val <= 10^5`

## 基礎思路

本題要找出「層級總和最大」的最小層級編號。由於每個節點都有明確層級（根為第 1 層，子節點第 2 層…），我們需要同時做到：

* **逐層累加節點值**：對每一層，把該層所有節點值加總得到層級總和。
* **比較並保留最佳答案**：若某層的總和嚴格大於目前最大值，就更新最大值與對應層號；若相等則不更新，才能確保回傳的是「最小層級」。
* **避免重複掃描**：樹的節點數最多 10^4，應用一次遍歷就完成所有層級的統計與比較。

最直接且效率穩定的策略是使用**廣度優先遍歷（BFS）逐層處理**：
每次取出一整層的節點，計算該層總和，同時把下一層節點加入待處理序列。如此能自然對應層級，並在單次遍歷內求出答案。

## 解題步驟

### Step 1：空樹快速處理與初始化佇列

若根節點為空，直接回傳 0（雖題目保證至少一個節點，但仍保留安全性）。
接著建立固定容量的佇列結構，並以 head/tail 指標管理取出與加入位置，避免使用 shift 造成額外成本。

```typescript
// 快速處理：雖然題目保證至少 1 個節點，但仍保留空樹保護
if (root === null) {
  return 0;
}

// 使用預先配置的佇列（大小 <= 節點數）避免 push/shift 額外開銷
// 1e4 節點足夠容納，並保持記憶體可預期
const nodeQueue = new Array<TreeNode>(10000);
let head = 0;
let tail = 0;

nodeQueue[tail++] = root;
```

### Step 2：初始化層級追蹤與最佳答案

準備層級計數器與目前最佳層級與最佳總和。
最佳總和用負無限初始化，確保第一層一定能被更新。

```typescript
let currentLevel = 0;
let bestLevel = 1;
let bestSum = -Infinity;
```

### Step 3：外層 while — 逐層處理 BFS

只要佇列尚有節點，就代表還有層級未處理。每次迴圈代表處理一整層。

```typescript
while (head < tail) {
  currentLevel++;

  // ...
}
```

### Step 4：取得當層邊界並累加層級總和

在進入該層處理前，先記錄該層結束位置（levelEnd），確保本層只處理既有節點。
然後在內層 while 中依序取出節點、累加值，並把左右子節點加入佇列作為下一層。

```typescript
while (head < tail) {
  // Step 3：外層 while — 逐層處理 BFS

  // 只抓取本層的結束位置（避免在迴圈中讀取 queue.length）
  const levelEnd = tail;
  let levelSum = 0;

  while (head < levelEnd) {
    const node = nodeQueue[head++];

    levelSum += node.val;

    const leftNode = node.left;
    if (leftNode !== null) {
      nodeQueue[tail++] = leftNode;
    }

    const rightNode = node.right;
    if (rightNode !== null) {
      nodeQueue[tail++] = rightNode;
    }
  }

  // ...
}
```

### Step 5：更新最佳層級（保證取到最小層級）

每層完成後，將該層總和與目前最佳總和比較：
只有在「嚴格大於」時更新，才能確保若有多層同最大值時回傳最小層級。

```typescript
while (head < tail) {
  // Step 3：外層 while — 逐層處理 BFS

  // Step 4：取得當層邊界並累加層級總和

  // 每層只做一次比較，並保留最早達到最大值的層級
  if (levelSum > bestSum) {
    bestSum = levelSum;
    bestLevel = currentLevel;
  }
}
```

### Step 6：回傳答案

整棵樹遍歷完成後，`bestLevel` 即為層級總和最大且最小層級的答案。

```typescript
return bestLevel;
```

## 時間複雜度

- 每個節點在 BFS 中**恰好出佇列一次、入佇列至多一次**，並進行常數次操作（加總、左右子節點判斷與可能入隊）。
- 因此總操作次數與節點數量成正比。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 佇列在最壞情況下可能同時容納最多的節點數量，且本實作預先配置大小為 10000 的陣列，對應到節點上限。
- 除佇列外僅使用常數額外變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
