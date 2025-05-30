# 1261. Find Elements in a Contaminated Binary Tree

Given a binary tree with the following rules:

1. `root.val == 0`
2. For any treeNode:
   1. If `treeNode.val` has a value `x` and `treeNode.left != null`, then `treeNode.left.val == 2 * x + 1`
   2. If `treeNode.val` has a value `x` and `treeNode.right != null`, then `treeNode.right.val == 2 * x + 2`

Now the binary tree is contaminated, which means all `treeNode.val` have been changed to `-1`.

Implement the `FindElements` class:

- `FindElements(TreeNode* root)` Initializes the object with a contaminated binary tree and recovers it.
- `bool find(int target)` Returns `true` if the `target` value exists in the recovered binary tree.

**Constraints:**

- `TreeNode.val == -1`
- The height of the binary tree is less than or equal to `20`
- The total number of nodes is between `[1, 10^4]`
- Total calls of find() is between `[1, 10^4]`
- `0 <= target <= 10^6`

## 基礎思路

這題的本質是在於復原已知規則的二元樹結構，並支援高效查找任一節點是否存在。

已知規則如下：

- 根節點值為 $0$。
- 對於任何節點值 $x$，左子節點值為 $2x+1$，右子節點值為 $2x+2$。

但所有節點值都被污染成 $-1$，所以我們必須依據規則遞迴還原所有正確節點值。

此外，考慮到 `find(target)` 查找次數可達 $10^4$，若每次都從根節點往下搜尋，會導致效能瓶頸。
因此，我們在復原的同時，直接將所有節點值存入一個雜湊集合（Set），
如此查找任一值只需 $O(1)$ 時間，大幅提升查找效率。

我們可以利用數學規則和 DFS **一次性「重建+備份」**，換取未來每次查詢的秒查效率。

## 解題步驟

### Step 1: 初始化 `recoveredSet`

我們需要一個 `recoveredSet` 來存儲所有的數據，這樣查找的時間複雜度就會降低到 $O(1)$。

```typescript
class FindElements {
  private readonly recoveredSet: Set<number>;
  
  // ...
}
```

### Step 2: 構造函數

在構造函數中，我們需要恢復數據，並且存儲到 `recoveredSet` 中。

```typescript
class FindElements {
  // Step 1: 初始化 `recoveredSet`
  
  constructor(root: TreeNode | null) {
    this.recoveredSet = new Set();
    // 我們從根節點開始恢復數據
    this.recover(root, 0);
  }

  private recover(node: TreeNode | null, val: number): void {
    if (!node) {
      // 如果節點為空，則返回
      return;
    }
    
    // 恢復數據
    node.val = val;
    
    // 將數據存儲到 recoveredSet 中
    this.recoveredSet.add(val);
    
    // 遞歸恢復左右子樹
    this.recover(node.left, 2 * val + 1);
    this.recover(node.right, 2 * val + 2);
  }
  
  // ...
}
```

### Step 3: 查找函數

查找函數只需要查找 `recoveredSet` 是否包含 `target` 即可。

```typescript
class FindElements {
  // Step 1: 初始化 `recoveredSet`
   
  // Step 2: 構造函數

  find(target: number): boolean {
    return this.recoveredSet.has(target);
  }
}
```

## 時間複雜度

- 初始化時，我們需要遍歷所有的節點，因此時間複雜度為 $O(n)$。
- 查找時，我們只需要查找 `recoveredSet` 是否包含 `target`，因此時間複雜度為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們需要一個 `recoveredSet` 來存儲所有的數據，因此空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
