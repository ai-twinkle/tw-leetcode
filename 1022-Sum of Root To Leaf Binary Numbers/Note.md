# 1022. Sum of Root To Leaf Binary Numbers

You are given the `root` of a binary tree where each node has a value `0` or `1`. 
Each root-to-leaf path represents a binary number starting with the most significant bit.

- For example, if the path is `0 -> 1 -> 1 -> 0 -> 1`, then this could represent `01101` in binary, which is `13`.

For all leaves in the tree, consider the numbers represented by the path from the root to that leaf. Return the sum of these numbers.

The test cases are generated so that the answer fits in a 32-bits integer.

**Constraints:**

- The number of nodes in the tree is in the range `[1, 1000]`.
- `Node.val` is `0` or `1`.

## 基礎思路

本題給定一棵二元樹，節點值僅為 `0` 或 `1`，每一條從根到葉的路徑可視為一個二進位數（根為最高位）。要求將所有葉節點對應的路徑數值加總並回傳。

核心觀察與策略如下：

* **路徑數值可用逐步累積表示**：每往下一層，相當於二進位左移一位，再加入當前節點位元，因此能以常數時間更新路徑值。
* **只在葉節點做加總**：根到葉才構成完整二進位數，因此只有在抵達葉節點時才把當前累積值加入總和。
* **以迭代 DFS 取代遞迴**：使用顯式堆疊維護遍歷狀態，避免遞迴深度與呼叫堆疊風險。
* **節點與路徑值需成對保存**：每個待處理節點都必須對應一個「從根到該節點」的累積值，才能在取出時直接判斷是否為葉並累加。

因此採用「迭代 DFS + 路徑值累積」：

* 初始化堆疊，放入根節點與其路徑值。
* 反覆彈出一個節點與其路徑值：

  * 若為葉節點，將路徑值加入總和。
  * 否則把存在的子節點推入堆疊，並在推入時計算好新的路徑值。
* 遍歷結束後回傳總和。

## 解題步驟

### Step 1：處理空樹的邊界情況

若根節點為空，代表沒有任何根到葉路徑可累加，直接回傳 `0`。

```typescript
if (root === null) {
  return 0;
}
```

### Step 2：建立固定容量堆疊保存節點與路徑值

使用兩個同步堆疊分別保存「待處理節點」與「對應路徑累積值」，並以固定容量避免動態擴容成本。

```typescript
// 固定容量堆疊（約束：<= 1000 個節點），避免動態擴容成本。
const maxStackSize = 1024;
const nodeStack = new Array<TreeNode>(maxStackSize);
const pathValueStack = new Int32Array(maxStackSize);

let stackSize = 0;
```

### Step 3：推入根節點並同步存入初始路徑值

在推入根節點時就把「包含該節點位元」的路徑值一併存入，確保後續取出即可直接使用。

```typescript
// 在推入時就存入「包含節點位元」的路徑值。
nodeStack[stackSize] = root;
pathValueStack[stackSize] = root.val;
stackSize++;
```

### Step 4：初始化總和並建立 DFS 迭代處理框架

建立總和累積器，並以堆疊作為迭代 DFS 的控制結構：每次取出一個節點與其對應路徑值，接著依照是否為葉節點決定「累加」或「推入子節點」。

```typescript
let totalSum = 0;

while (stackSize > 0) {
  stackSize--;

  const currentNode = nodeStack[stackSize];
  const currentPathValue = pathValueStack[stackSize];

  const leftNode = currentNode.left;
  const rightNode = currentNode.right;

  // ...
}
```

### Step 5：判斷葉節點並將路徑值加入總和

若左右子節點皆不存在，代表該節點為葉節點，當前累積路徑值即為一個完整二進位數，直接加入總和並跳過後續推入動作。

```typescript
while (stackSize > 0) {
  // Step 4：彈出一筆節點與路徑值狀態

  // 葉節點：將結果累加進總和。
  if (leftNode === null) {
    if (rightNode === null) {
      totalSum += currentPathValue;
      continue;
    }
  }

  // ...
}
```

### Step 6：推入左子節點並預先更新其路徑值

若左子節點存在，將其推入堆疊；新路徑值由「既有路徑值左移一位」再加入子節點位元得到，並在推入時一次計算完成。

```typescript
while (stackSize > 0) {
  // Step 4：彈出一筆節點與路徑值狀態

  // Step 5：判斷葉節點並累加結果

  // 若左子節點存在則推入（預先計算下一個路徑值）。
  if (leftNode !== null) {
    nodeStack[stackSize] = leftNode;
    pathValueStack[stackSize] = (currentPathValue << 1) | leftNode.val;
    stackSize++;
  }

  // ...
}
```

### Step 7：推入右子節點並預先更新其路徑值

若右子節點存在，將其推入堆疊；同樣以「左移一位再加入位元」的方式預先計算路徑值，確保取出時可直接使用。

```typescript
while (stackSize > 0) {
  // Step 4：彈出一筆節點與路徑值狀態

  // Step 5：判斷葉節點並累加結果

  // Step 6：推入左子節點並更新路徑值

  // 若右子節點存在則推入（預先計算下一個路徑值）。
  if (rightNode !== null) {
    nodeStack[stackSize] = rightNode;
    pathValueStack[stackSize] = (currentPathValue << 1) | rightNode.val;
    stackSize++;
  }
}
```

### Step 8：遍歷結束後回傳累加總和

當堆疊清空代表所有根到葉路徑皆已處理完畢，回傳最終總和。

```typescript
return totalSum;
```

## 時間複雜度

- 每個節點最多入堆與出堆各一次，並在出堆時做常數次操作。
- 路徑值更新為位移與 OR，皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 顯式堆疊需保存待處理節點與對應路徑值，最壞情況可達節點數量等級。
- 兩個堆疊皆以固定容量配置，使用量與 $n$ 同階。
- 總空間複雜度為 $O(n)$。

> $O(n)$
