# 1339. Maximum Product of Splitted Binary Tree

Given the `root` of a binary tree, split the binary tree into two subtrees by removing one edge such that the product of the sums of the subtrees is maximized.

Return the maximum product of the sums of the two subtrees. 
Since the answer may be too large, return it modulo `10^9 + 7`.

Note that you need to maximize the answer before taking the mod and not after taking it.

**Constraints:**

- The number of nodes in the tree is in the range `[2, 5 * 10^4]`.
- `1 <= Node.val <= 10^4`

## 基礎思路

本題要在二元樹中「移除一條邊」把樹分成兩棵子樹，並最大化兩棵子樹節點值總和的乘積。
若整棵樹總和為 `T`，當切下一棵子樹的總和為 `s` 時，乘積就是 `s * (T - s)`。因此我們的目標等價於：

* **找出所有可能子樹總和 `s`**（對應每一條可切的邊）
* 在所有 `s` 中選出使 `s * (T - s)` 最大者

由於 `s * (T - s)` 在 `s` 越接近 `T / 2` 時越大，因此可以轉成「找最接近一半總和的子樹」這個優化目標。

整體策略可分為兩個核心步驟：

* **先計算整棵樹總和 `T`，同時取得節點的後序處理順序**，以便後續能在計算子樹總和時確保子節點先完成。
* **依後序順序計算每個節點的子樹總和 `s`**，對於每個非根節點（代表切掉連到父節點那條邊），用 `s` 更新「最接近 `T/2`」的候選，最後再用最大候選算出最大乘積並在最後取模。

如此可以在節點數上限 `5 * 10^4` 下，以線性時間完成。

## 解題步驟

### Step 1：處理空樹與初始化常數、容器

空樹直接回傳 0；並初始化模數、遍歷用堆疊、後序序列容器，以及總和累加器。

```typescript
if (root === null) {
  return 0;
}

const MODULO_BIGINT = 1000000007n;

const traversalStack: TreeNode[] = [root];
let traversalStackSize = 1;

const postorderNodes: TreeNode[] = [];
let postorderNodesSize = 0;

let totalSum = 0;
```

### Step 2：迭代遍歷 — 收集反後序節點序列並同時計算總和

用堆疊進行迭代遍歷，把節點收集成「反後序序列」，並在同一趟累加整棵樹總和。

```typescript
// 以一次遍歷收集反後序序列（root-right-left），並同步計算總和
while (traversalStackSize !== 0) {
  const currentNode = traversalStack[--traversalStackSize];

  postorderNodes[postorderNodesSize++] = currentNode;
  totalSum += currentNode.val;

  const leftChild = currentNode.left;
  if (leftChild !== null) {
    traversalStack[traversalStackSize++] = leftChild;
  }

  const rightChild = currentNode.right;
  if (rightChild !== null) {
    traversalStack[traversalStackSize++] = rightChild;
  }
}
```

### Step 3：準備子樹總和堆疊與最佳候選追蹤變數

建立用來存放已計算完成的子樹總和堆疊，並用兩個變數追蹤最佳子樹總和與其與 `T/2` 的距離（用 `|T - 2s|` 衡量）。

```typescript
const subtreeSumStack = new Int32Array(postorderNodesSize);
let subtreeSumStackSize = 0;

let bestSubtreeSum = 0;
let bestAbsoluteDifference = 2147483647;
```

### Step 4：主後序掃描迴圈骨架 — 由反後序倒掃得到真正後序

倒著掃描反後序序列即可得到真正的後序處理順序，確保子節點先於父節點計算完成。

```typescript
// 由反後序序列倒掃即可得到真正後序（left-right-root）
for (let index = postorderNodesSize - 1; index >= 0; index--) {
  const currentNode = postorderNodes[index];

  // ...
}
```

### Step 5：在後序迴圈中取出右子樹與左子樹的總和

因為後序計算時子樹總和會先被推入堆疊，父節點要使用時需從堆疊彈出。
此程式依照左右子樹是否存在決定是否彈出，並且先彈右子樹再彈左子樹，符合堆疊頂端順序。

```typescript
for (let index = postorderNodesSize - 1; index >= 0; index--) {
  // Step 4：主後序掃描迴圈骨架 — 由反後序倒掃得到真正後序

  const currentNode = postorderNodes[index];

  // 先彈出右子樹總和，因為它後計算、位於堆疊頂端
  let rightSubtreeSum = 0;
  if (currentNode.right !== null) {
    rightSubtreeSum = subtreeSumStack[--subtreeSumStackSize];
  }

  // 再彈出左子樹總和，對應 left-right-root 的消耗順序
  let leftSubtreeSum = 0;
  if (currentNode.left !== null) {
    leftSubtreeSum = subtreeSumStack[--subtreeSumStackSize];
  }

  // ...
}
```

### Step 6：計算當前節點子樹總和並推回堆疊

將目前節點值與左右子樹總和相加得到 `subtreeSum`，並推入堆疊供父節點使用。

```typescript
for (let index = postorderNodesSize - 1; index >= 0; index--) {
  // Step 4：主後序掃描迴圈骨架 — 由反後序倒掃得到真正後序

  // Step 5：在後序迴圈中取出右子樹與左子樹的總和

  const subtreeSum = currentNode.val + leftSubtreeSum + rightSubtreeSum;
  subtreeSumStack[subtreeSumStackSize++] = subtreeSum;

  // ...
}
```

### Step 7：更新最佳切割候選（跳過根節點）

對每個非根節點，其子樹總和 `s` 都代表「切掉與父節點的那條邊」後的一側子樹。
利用 `|T - 2s|` 追蹤最接近 `T/2` 的 `s`，並更新最佳候選。

```typescript
for (let index = postorderNodesSize - 1; index >= 0; index--) {
  // Step 4：主後序掃描迴圈骨架 — 由反後序倒掃得到真正後序

  // Step 5：在後序迴圈中取出右子樹與左子樹的總和

  // Step 6：計算當前節點子樹總和並推回堆疊

  // 選擇使 s * (T - s) 最大的 s，即最接近 T / 2 的子樹總和
  if (currentNode !== root) {
    let difference = totalSum - (subtreeSum * 2);
    if (difference < 0) {
      difference = -difference;
    }

    if (difference < bestAbsoluteDifference) {
      bestAbsoluteDifference = difference;
      bestSubtreeSum = subtreeSum;
    }
  }
}
```

### Step 8：以 BigInt 計算最大乘積並在最後取模

必須先在未取模狀態下求最大乘積，再取 `10^9 + 7` 的模數回傳。

```typescript
// 使用 BigInt 計算精確乘積，最後才取模
const totalSumBigInt = BigInt(totalSum);
const bestSubtreeSumBigInt = BigInt(bestSubtreeSum);

const maximumProductBigInt =
  bestSubtreeSumBigInt * (totalSumBigInt - bestSubtreeSumBigInt);

return Number(maximumProductBigInt % MODULO_BIGINT);
```

## 時間複雜度

- 設 `n` 為樹的節點數。
- 第一次 `while` 迭代遍歷：每個節點入堆疊與出堆疊各一次，且常數次子指標檢查，為 $O(n)$。
- 第二次 `for` 後序掃描：每個節點恆定次數的堆疊彈出/推入與差值比較，為 $O(n)$。
- BigInt 乘法與取模僅做一次，視為常數次操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- `traversalStack` 最壞情況下可能同時存放樹的一條路徑上的節點，最壞為 $O(n)$。
- `postorderNodes` 儲存全部節點，為 $O(n)$。
- `subtreeSumStack` 長度為 `n` 的陣列，為 $O(n)$。
- 其餘變數為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
