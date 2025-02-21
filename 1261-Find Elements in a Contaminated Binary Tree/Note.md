# 1261. Find Elements in a Contaminated Binary Tree

Given a binary tree with the following rules:

1. `root.val == 0`
2. For any treeNode:
   1. If `treeNode.val` has a value `x` and `treeNode.left != null`, then `treeNode.left.val == 2 * x + 1`
   2. If `treeNode.val` has a value `x` and `treeNode.right != null`, then `treeNode.right.val == 2 * x + 2`

Now the binary tree is contaminated, which means all `treeNode.val` have been changed to `-1`.

Implement the `FindElements` class:

* `FindElements(TreeNode* root)` Initializes the object with a contaminated binary tree and recovers it.
* `bool find(int target)` Returns `true` if the `target` value exists in the recovered binary tree.

## 基礎思路

這題我們需要模擬 `Recover` 的過程，也就是依照上述的規則，恢復數據。
但直接查找的話，時間複雜度會很高，因此我們可以使用 `recoveredSet` 來存儲所有的數據，這樣查找的時間複雜度就會降低到 $O(1)$。

## 解題步驟

### Step 1: 初始化 `recoveredSet`

我們需要一個 `recoveredSet` 來存儲所有的數據，這樣查找的時間複雜度就會降低到 $O(1)$。

```typescript
class FindElements {
  private readonly recoveredSet: Set<number>;
}
```

### Step 2: 構造函數

在構造函數中，我們需要恢復數據，並且存儲到 `recoveredSet` 中。

```typescript
class FindElements {
  // ...
  
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
}
```

### Step 3: 查找函數

查找函數只需要查找 `recoveredSet` 是否包含 `target` 即可。

```typescript
class FindElements {
  // ...

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
