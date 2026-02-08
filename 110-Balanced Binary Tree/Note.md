# 110. Balanced Binary Tree

Given a binary tree, determine if it is height-balanced.

**Constraints:**

- The number of nodes in the tree is in the range `[0, 5000]`.
- `-10^4 <= Node.val <= 10^4`

## 基礎思路

本題要判斷一棵二元樹是否為「高度平衡樹」。
高度平衡的定義是：**任一節點的左右子樹高度差不超過 1**，且左右子樹本身也都必須高度平衡。

在思考解法時，我們需要注意幾個核心觀察：

* **局部條件會影響全域判斷**：只要某個節點失衡，整棵樹就一定不平衡，因此可以「提早停止」後續計算。
* **高度計算與平衡檢查可合併**：如果每個節點都先計算左右子樹高度再判斷，會自然形成後序（post-order）流程：先處理子樹，再處理自己。
* **用特殊值傳遞失衡狀態**：當子樹已經失衡時，不必再回傳高度；可以回傳一個特殊標記代表「已失衡」，並一路向上傳遞，達成早停。

因此策略是：以遞迴後序方式同時計算子樹高度與平衡性；
一旦發現失衡，就立即向上回傳失衡標記，最終以根節點是否失衡決定答案。

## 解題步驟

### Step 1：定義輔助函式 `computeHeight` 與空節點高度

建立一個回傳高度的遞迴函式；若子樹不平衡則回傳 `-1` 作為失衡標記。空節點高度定義為 0。

```typescript
/**
 * 回傳子樹高度；若不平衡則回傳 -1。
 * @param node 目前樹節點。
 */
function computeHeight(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }

  // ...
}
```

### Step 2：遞迴計算左子樹高度，並支援失衡早停

先取得左子樹高度；若左子樹已回傳 `-1`，代表左側已失衡，可直接向上回傳 `-1`。

```typescript
/**
 * 回傳子樹高度；若不平衡則回傳 -1。
 * @param node 目前樹節點。
 */
function computeHeight(node: TreeNode | null): number {
  // Step 1：定義輔助函式 `computeHeight` 與空節點高度

  const leftHeight = computeHeight(node.left);
  if (leftHeight === -1) {
    return -1;
  }

  // ...
}
```

### Step 3：遞迴計算右子樹高度，並支援失衡早停

同樣計算右子樹高度；若右子樹失衡，直接回傳 `-1`。

```typescript
/**
 * 回傳子樹高度；若不平衡則回傳 -1。
 * @param node 目前樹節點。
 */
function computeHeight(node: TreeNode | null): number {
  // Step 1：定義輔助函式 `computeHeight` 與空節點高度

  // Step 2：遞迴計算左子樹高度，並支援失衡早停

  const rightHeight = computeHeight(node.right);
  if (rightHeight === -1) {
    return -1;
  }

  // ...
}
```

### Step 4：檢查當前節點是否失衡，並回傳子樹高度

計算左右高度差；若差值超過 1（含 -1 方向），則當前節點失衡，回傳 `-1`。
否則回傳此節點子樹高度：`max(leftHeight, rightHeight) + 1`。

```typescript
/**
 * 回傳子樹高度；若不平衡則回傳 -1。
 * @param node 目前樹節點。
 */
function computeHeight(node: TreeNode | null): number {
  // Step 1：定義輔助函式 `computeHeight` 與空節點高度

  // Step 2：遞迴計算左子樹高度，並支援失衡早停

  // Step 3：遞迴計算右子樹高度，並支援失衡早停

  // 內聯絕對值差，避免呼叫 Math.abs 的額外開銷
  const heightDifference = leftHeight - rightHeight;
  if (heightDifference > 1 || heightDifference < -1) {
    return -1;
  }

  // 回傳目前子樹高度
  return (leftHeight > rightHeight ? leftHeight : rightHeight) + 1;
}
```

### Step 5：以根節點回傳值判斷是否平衡

呼叫 `computeHeight(root)`；若結果不是 `-1`，代表全樹平衡。

```typescript
return computeHeight(root) !== -1;
```

## 時間複雜度

- 令 `n` 為節點數。最壞情況下需要對每個節點做一次後序處理（每個節點的工作為常數：兩次遞迴回傳值檢查、一次差值檢查、一次取最大值），因此最壞時間為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 令 `h` 為樹高。遞迴呼叫堆疊最深會到 `h` 層，因此額外空間為 $O(h)$（不含輸入樹本身）。
- 在最壞情況（樹退化成鏈）時，`h = n`，因此最壞空間為 $O(n)$；在最佳平衡狀況下 `h = O(\log n)`，因此空間為 $O(\log n)$。
- 總空間複雜度為 $O(h)$。

> $O(h)$
