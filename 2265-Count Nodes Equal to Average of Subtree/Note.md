# 2265. Count Nodes Equal to Average of Subtree

Given the `root` of a binary tree, 
return the number of nodes where the value of the node is equal to the average of the values in its subtree.

Note:

- The average of `n` elements is the sum of the `n` elements divided by `n` and rounded down to the nearest integer.
- A subtree of `root` is a tree consisting of `root` and all of its descendants.

**Constraints:**

- The number of nodes in the tree is in the range `[1, 1000]`.
- `0 <= Node.val <= 1000`

## 基礎思路

本題要求統計二元樹中有多少節點，其自身數值恰好等於「以該節點為根的子樹」所有數值的向下取整平均。由於每個節點的判斷都依賴其整棵子樹的資訊，因此關鍵在於如何以最少的遍歷次數取得每棵子樹的彙總資料。

在思考解法時，可掌握以下核心觀察：

- **子樹資訊具有由下而上的累積性**：
  一個節點的子樹總和與節點總數，等於自身加上左右子樹的對應結果，因此後序遍歷天然符合此依賴順序，一次走訪即可完成全部計算。

- **判斷條件只需總和與節點數兩項資訊**：
  平均值的判斷並不需要保留子樹中的每個元素，僅需彙總後的兩個數量即可，故遞迴的回傳內容可以極度精簡。

- **兩項彙總值可合併為單一整數傳遞**：
  節點數受題目上限約束，可用固定位元寬度容納；而總和的上界亦有限，兩者拼接後仍落在引擎的小整數範圍內，因此可用位元位移與遮罩把兩個回傳值壓縮成一個，省去建立物件或陣列的開銷。

- **向下取整的比較可改寫為純整數運算**：
  「總和除以節點數後向下取整等於節點值」等價於「總和減去節點值乘以節點數的餘量落在零與節點數之間」，如此便能完全避開除法與浮點誤差。

依據以上特性，可以採用以下策略：

- **以後序遍歷由葉往根彙整子樹的總和與節點數**，確保每個節點只被走訪一次。
- **將兩項彙總值以位元打包成單一整數回傳**，降低遞迴過程的配置成本。
- **在每個節點回傳之前，以純整數不等式判斷是否符合條件，並累加至共用計數器**，避免遞迴額外攜帶回傳值。

此策略能在單次遍歷內完成全部統計，且全程只使用整數運算，兼顧效率與精確性。

## 解題步驟

### Step 1：預先定義位元打包所需的常數

節點數上限為 1000，以固定位元寬度即可容納；同時定義對應的遮罩，供後續拆解打包整數時取出節點數使用。

```typescript
// 節點數最多為 1000，因此 10 個位元（最大 1023）已足以容納
const COUNT_BITS = 10;
const COUNT_MASK = (1 << COUNT_BITS) - 1;
```

### Step 2：宣告共用的符合條件節點計數器

以模組層級的共用計數器記錄符合條件的節點數量，如此遞迴便無須額外的閉包或多餘的回傳值。

```typescript
// 共用計數器，讓遞迴不需要閉包或額外的回傳值
let matchingNodeCount = 0;
```

### Step 3：建立後序遍歷函數並初始化當前節點的彙總值

進入遞迴後，先以當前節點自身的數值與計數作為起點，之後再逐步併入左右子樹的結果。

```typescript
/**
 * 後序遍歷，回傳子樹總和與節點數打包後的單一整數。
 * 總和最大為 1000 * 1000 = 1e6，且 (1e6 << 10) | 1023 仍小於 2^30，因此數值可維持為 V8 的小整數。
 * @param node - 當前非空的樹節點。
 * @returns 子樹總和左移 COUNT_BITS 後，與子樹節點數進行位元 OR 的結果。
 */
function collectSubtree(node: TreeNode): number {
  const nodeValue = node.val;
  let subtreeSum = nodeValue;
  let subtreeCount = 1;

  // ...
}
```

### Step 4：遞迴併入左右子樹的總和與節點數

分別對左右子節點遞迴，並將回傳的打包整數以位移取出總和、以遮罩取出節點數後累加；若子節點為空則直接略過，省去一次函數呼叫的開銷。

```typescript
function collectSubtree(node: TreeNode): number {
  // Step 3：初始化當前節點的彙總值

  // 子節點為空時直接略過呼叫，以節省函數呼叫開銷
  if (node.left !== null) {
    const packedLeft = collectSubtree(node.left);
    subtreeSum += packedLeft >> COUNT_BITS;
    subtreeCount += packedLeft & COUNT_MASK;
  }

  if (node.right !== null) {
    const packedRight = collectSubtree(node.right);
    subtreeSum += packedRight >> COUNT_BITS;
    subtreeCount += packedRight & COUNT_MASK;
  }

  // ...
}
```

### Step 5：以純整數不等式判斷是否符合條件

將向下取整的平均比較改寫為餘量的區間判斷，避免除法運算；若餘量落在合法範圍內，代表當前節點符合條件，累加共用計數器。

```typescript
function collectSubtree(node: TreeNode): number {
  // Step 3：初始化當前節點的彙總值

  // Step 4：遞迴併入左右子樹的結果

  // floor(sum / count) === value  <=>  0 <= sum - value * count < count（純整數檢查，不需除法）
  const remainder = subtreeSum - nodeValue * subtreeCount;
  if (remainder >= 0 && remainder < subtreeCount) {
    matchingNodeCount++;
  }

  // ...
}
```

### Step 6：將彙總結果打包後回傳

將子樹總和左移固定位元後與節點數進行位元 OR，把兩項資訊合併為單一整數回傳給上層。

```typescript
function collectSubtree(node: TreeNode): number {
  // Step 3：初始化當前節點的彙總值

  // Step 4：遞迴併入左右子樹的結果

  // Step 5：判斷是否符合條件

  return (subtreeSum << COUNT_BITS) | subtreeCount;
}
```

### Step 7：主流程先處理空樹的邊界情況

若根節點為空，樹中不存在任何節點，符合條件的數量必為零，可直接回傳。

```typescript
if (root === null) {
  return 0;
}
```

### Step 8：重置共用計數器並啟動後序遍歷

由於計數器為共用狀態，每次呼叫前都需先歸零，以確保各次呼叫互不干擾；接著自根節點展開整棵樹的後序遍歷。

```typescript
// 每次獨立呼叫前重置共用計數器
matchingNodeCount = 0;
collectSubtree(root);
```

### Step 9：回傳統計結果

遍歷結束後，共用計數器已累計所有符合條件的節點數量，直接回傳。

```typescript
return matchingNodeCount;
```

## 時間複雜度

- 後序遍歷對每個節點恰好走訪一次；
- 每個節點內的彙整、判斷與打包皆為常數時間的整數運算；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 除固定數量的變數外，未使用任何額外的陣列或動態結構；
- 遞迴呼叫堆疊的深度取決於樹高，最差情況下樹退化為鏈狀，深度達節點總數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
