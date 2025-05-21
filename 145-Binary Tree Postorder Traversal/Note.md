# 145. Binary Tree Postorder Traversal

Given the root of a binary tree, return the postorder traversal of its nodes' values.

## 基礎思路

這題是經典的 Tree Traversal 題目，我們可以使用遞迴的方式來解決這個問題。
遞迴的方式依序遍歷左子樹結果、右子樹結果，最後再加上根節點 (也可是子樹的"根"節點)。

**Constraints:**

- The number of the nodes in the tree is in the range `[0, 100]`.
- `-100 <= Node.val <= 100`

## 解題步驟

### Step 1: 直接返回遞迴結果

```typescript
return root ? [...postorderTraversal(root.left), ...postorderTraversal(root.right), root.val] : []
```
須注意由於 root 可能為 null，因此在遞迴的過程中，需要先判斷 root 是否為 null。(這也是遞迴的終止條件)
然後把左子樹的結果展開，再把右子樹的結果展開，最後再加上根節點的值。

## 時間複雜度

- 每個節點都會被訪問一次，因此時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 最壞的情況下，遞迴的深度為 $O(n)$，最好的情況下，遞迴的深度為 $O(\log n)$。
- 保存結果的空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
