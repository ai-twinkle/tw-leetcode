# 1382. Balance a Binary Search Tree

Given the `root` of a binary search tree, return a balanced binary search tree with the same node values. 
If there is more than one answer, return any of them.

A binary search tree is balanced if the depth of the two subtrees of every node never differs by more than `1`.

**Constraints:**

- The number of nodes in the tree is in the range `[1, 10^4]`.
- `1 <= Node.val <= 10^5`

## 基礎思路

本題要把一棵二元搜尋樹（BST）重新整理成「平衡 BST」，並且保留**完全相同的節點值集合**。平衡的定義是任意節點左右子樹深度差不超過 1。

在思考解法時，有幾個核心觀察：

* **BST 的中序走訪結果必定遞增**：把所有節點依中序順序取出，就能得到「已排序」的節點序列。
* **由排序序列建平衡 BST 的標準做法**：每次選取序列的中間元素當根，左右兩半分別建左子樹與右子樹，就能保證高度差盡量小，達到平衡。
* **避免遞迴走訪過深的風險**：節點數可到 `10^4`，若原 BST 極度不平衡（像鏈狀），遞迴中序可能造成呼叫堆疊過深；因此用迭代式中序走訪更穩定。
* **可重用原節點**：重新接回左右指標即可形成新樹形，不必建立新節點，能節省配置成本。

整體策略就是：**中序取出排序節點序列 → 用「取中點」方式重建平衡 BST**。

## 解題步驟

### Step 1：初始化容器與迭代中序走訪所需狀態

準備一個陣列 `nodes` 來儲存中序走訪後的節點順序；
並使用堆疊與指標來進行**迭代式中序走訪**，避免遞迴過深的風險。

```typescript
const nodes: TreeNode[] = [];

// 迭代式中序走訪（避免最壞情況遞迴深度達 1e4）
const stack: TreeNode[] = [];
let current = root;
```

### Step 2：沿左鏈下探並以中序順序收集節點

使用標準的迭代式中序走訪流程：
外層 `while` 控制整體走訪生命週期，
內層 `while` 負責一路向左下探並推入堆疊；
當左側到底後，彈出節點、加入排序序列，並轉向其右子樹。

```typescript
while (current !== null || stack.length !== 0) {
  // 沿左子樹一路向下，將路徑節點推入堆疊
  while (current !== null) {
    stack.push(current);
    current = current.left;
  }

  // 彈出中序當前節點
  const node = stack.pop()!;
  nodes.push(node);

  // 轉向右子樹繼續中序走訪
  current = node.right;
}
```

### Step 3：輔助函式 `build` — 由排序節點序列重建平衡 BST

對已排序的節點陣列，使用「取中點」策略重建平衡 BST：
中點作為根，左右區間分別遞迴建立左右子樹。
此過程**原地重用節點**，並覆寫左右指標以解除舊樹形。

```typescript
/**
 * 由排序節點序列建立平衡 BST（原地重用節點）。
 *
 * @param leftIndex - 左界（含）
 * @param rightIndex - 右界（含）
 * @return 平衡子樹的根節點
 */
function build(leftIndex: number, rightIndex: number): TreeNode | null {
  if (leftIndex > rightIndex) {
    return null;
  }

  const middleIndex = (leftIndex + rightIndex) >> 1;
  const middleNode = nodes[middleIndex];

  // 覆寫左右指標，建立新的平衡結構
  middleNode.left = build(leftIndex, middleIndex - 1);
  middleNode.right = build(middleIndex + 1, rightIndex);

  return middleNode;
}
```

### Step 4：以完整區間建立平衡 BST 並回傳結果

使用整個排序後的節點區間 `[0, nodes.length - 1]`
重建平衡 BST，並回傳新樹的根節點。

```typescript
return build(0, nodes.length - 1);
```

## 時間複雜度

- 迭代式中序走訪會讓每個節點**進堆疊一次、出堆疊一次**，因此為 $O(n)$。
- 重建平衡 BST 時，每個節點在 `build` 中**恰好被選為中點一次並連結左右子樹一次**，因此為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- `nodes` 需存放全部節點參考，為 $O(n)$。
- 中序走訪的 `stack` 在最壞情況（原樹退化成鏈）會達到 $O(n)$。
- `build` 的遞迴深度等於重建後樹高，平衡情況下為 $O(\log n)$（但不影響主導空間，仍由 `nodes` 主導）。
- 總空間複雜度為 $O(n)$。

> $O(n)$
