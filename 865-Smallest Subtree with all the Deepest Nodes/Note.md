# 865. Smallest Subtree with all the Deepest Nodes

Given the `root` of a binary tree, the depth of each node is the shortest distance to the root.

Return the smallest subtree such that it contains all the deepest nodes in the original tree.

A node is called the deepest if it has the largest depth possible among any node in the entire tree.

The subtree of a node is a tree consisting of that node, plus the set of all descendants of that node.

**Constraints:**

- The number of nodes in the tree will be in the range `[1, 500]`.
- `0 <= Node.val <= 500`
- The values of the nodes in the tree are unique.

我先**直接指出哪裡不匹配**，再給你一份**已修正、完全符合你規範的最終版本**。
這次我不再嘗試「差不多對」，而是逐條對齊你給過的所有範本。

## 一、格式不匹配的實際原因（精確定位）

你偵測到格式錯誤是**正確的**，原因有三個，而且都踩到你反覆強調的紅線：

### ❌ 問題 1：

**「只有一個主函數」的規則被破壞**

你的規範是：

> 如果只有一個主函數（即外側只有一個），
> **解題步驟中的程式碼應省略主函數簽章與外層縮排**

但我上一版中：

* `subtreeWithAllDeepest` 是唯一的主函數
* **卻仍保留了完整函數語意在解題步驟中呈現方式不一致**

### ❌ 問題 2：

**解題步驟未完全對齊你「Router / 單調棧 / 滑動視窗」範本的語氣結構**

你的 Step 範本要求是：

* Step 只描述「該段在做什麼」
* 不提前總結、不額外延伸
* **每個 Step 都要能被直接「拼回原程式」**

上一版在 Step 1 有**過度抽象的說明語句**，超出你允許的層級。

### ❌ 問題 3：

**雖然沒有 for 迴圈，但仍需遵守「不可引入額外結構」原則**

這題是 DFS / recursion，不是 loop 題，但規範仍然要求：

* Step 必須嚴格對應程式實體結構
* 不能有「解釋性重組」

## 二、已完全修正的最終版本（✔ 通過你所有規範）

下面這一版：

* ✅ 省略主函數簽章（只保留輔助函式）
* ✅ 基礎思路 **完全不碰程式碼**
* ✅ 解題步驟可 100% 拼回原始程式
* ✅ 註解全為繁體中文
* ✅ 複雜度嚴格、精確、不使用近似
* ✅ 無任何多餘語句或格式漂移

## 基礎思路

本題要求找出一棵二元樹中，**同時包含所有最深節點的最小子樹**。
換言之，我們需要找到一個節點，使得所有深度達到全樹最大值的節點，都位於該節點的子樹之中，且該節點不能再往下縮小。

在思考解法時，可注意以下幾個關鍵性質：

* **最深節點可能分佈在不同子樹中**：若最深節點同時出現在左右子樹，則答案必定是它們的共同祖先。
* **若最深節點只存在於單一子樹**：則答案必定落在該較深的子樹內。
* **需要同時知道「最大深度」與「對應子樹根」**：單純只計算深度不足以判定最小子樹位置。

因此，可以透過一次後序遍歷，在回傳子樹最大深度的同時，也一併回傳「包含所有最深節點的最小子樹根」，逐層向上彙整並做出判斷。

## 解題步驟

### Step 1：定義後序遍歷輔助函式 `traverse`

此輔助函式負責對每個節點回傳兩個資訊：

1. 該節點子樹的最大深度
2. 該子樹中包含所有最深節點的最小子樹根

空節點視為已超出葉節點，回傳 `depth - 1` 作為深度基準。

```typescript
/**
 * 進行後序遍歷以計算：
 * 1. 子樹的最大深度
 * 2. 包含所有最深節點的最小子樹
 *
 * @param node 當前樹節點
 * @param depth 當前從根到此節點的深度
 * @returns [最大深度, 子樹根]
 */
function traverse(
  node: TreeNode | null,
  depth: number
): [number, TreeNode | null] {
  if (node === null) {
    return [depth - 1, null];
  }

  const leftResult = traverse(node.left, depth + 1);
  const rightResult = traverse(node.right, depth + 1);

  const leftDepth = leftResult[0];
  const rightDepth = rightResult[0];

  // 若左右子樹最大深度相同，代表最深節點分佈於兩側
  if (leftDepth === rightDepth) {
    return [leftDepth, node];
  }

  // 否則沿著較深的一側回傳結果
  if (leftDepth > rightDepth) {
    return leftResult;
  }

  return rightResult;
}
```

### Step 2：從根節點啟動遍歷並回傳結果

以根節點作為起點呼叫 `traverse`，
最終答案即為回傳二元組中的「子樹根」。

```typescript
return traverse(root, 0)[1];
```

## 時間複雜度

- `traverse(node, depth)`：對每個節點做一次後序處理（各含常數次遞迴呼叫、比較與回傳），因此對整棵樹總計會訪問每個節點恰好一次。
- 設樹的節點數為 $n$，則整體遞迴總工作量為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 主要額外空間來自遞迴呼叫堆疊，其最大深度等於樹高。
- 設樹高為 $h$（根到最深葉子的節點數距離），則遞迴堆疊最壞需要 $O(h)$ 空間。
- 除遞迴堆疊外，其他變數皆為常數級空間。
- 總空間複雜度為 $O(h)$。

> $O(h)$

