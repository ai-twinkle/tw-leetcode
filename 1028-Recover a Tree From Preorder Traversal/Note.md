# 1028. Recover a Tree From Preorder Traversal

We run a preorder depth-first search (DFS) on the `root` of a binary tree.

At each node in this traversal, 
we output `D` dashes (where `D` is the depth of this node), then we output the value of this node.  
If the depth of a node is `D`, the depth of its immediate child is `D + 1`.  The depth of the `root` node is `0`.

If a node has only one child, that child is guaranteed to be the left child.

Given the output `traversal` of this traversal, recover the tree and return its `root`.

**Constraints:**

- The number of nodes in the original tree is in the range `[1, 1000]`.
- `1 <= Node.val <= 10^9`

## 基礎思路

這題的關鍵在於「二元樹節點值的還原」和「高效查找」。
原樹每個節點的值都依規則唯一決定，因此我們可以利用 DFS 或 BFS，從根節點依序恢復所有節點的值，並記錄每個值以便查詢。

我們須考慮到以下幾點：

- 樹的還原（Recover）： 根據題目給定的規則，若已知父節點值 $x$，則左子節點值為 $2x+1$，右子節點值為 $2x+2$。我們從根節點值 $0$ 開始遞迴或疊代地為每個節點恢復正確值。
- 高效查找（Find）： 若每次查找都要遍歷樹，時間複雜度過高。因此，我們可以用一個集合（如 Set）將所有已恢復節點值存起來，使得 find 操作變成 $O(1)$。

這樣，初始化時只需 $O(n)$ 遍歷樹一次，之後所有查找都可在 $O(1)$ 時間內完成，達到高效需求。

### 圖示

Input: traversal = "1-2--3---4-5--6---7"

**步驟 1：處理 `"1"`（深度 0）**

- 建立根節點 1。

```
[1]
```
```
1
```

**步驟 2：處理 `"-2"`（深度 1）**

- 預期深度為 1，將節點 2 作為 1 的左子節點。

```
[1, 2]
```
```
  1
 /
2
```

**步驟 3：處理 `"--3"`（深度 2）**

- 預期深度為 2，將節點 3 作為 2 的左子節點。

```
[1, 2, null, 3]
```
```
    1
   /
  2
 /
3
```

**步驟 4：處理 `"---4"`（深度 3）**

- 預期深度為 3，將節點 4 作為 3 的左子節點。

```
[1, 2, null, 3, null, null, null, 4]
```
```
      1
     /
    2
   /
  3
 /
4
```
**步驟 5：處理 `"-5"`（深度 1）**

**步驟 5.1：嘗試在節點 4 兩側處理子節點**

- 下一個子字串是 `"-5"`（深度 1），但節點 4 預期的子節點深度應為 4。
- 對節點 4：
  - 嘗試建立左子節點（深度 4）→ 但遇到深度 1，不符 → 回傳 null。
  - 嘗試建立右子節點（深度 4）→ 同樣不符 → 回傳 null。
- 從節點 4 回溯到它的父節點（節點 3）。

```
[1, 2, null, 3, null, null, null, 4]
```

**步驟 5.2：嘗試在節點 3 處處理右子節點**

- 節點 3 的右子節點應為深度 3。
- 仍然看到 `"-5"`（深度 1）→ 不符合 → 節點 3 的右子節點為 null。
- 回溯從節點 3 到節點 2。

```
[1, 2, null, 3, null, null, null, 4]
```

**步驟 5.3：在節點 2 處處理右子節點**

- 節點 2 的右子節點應為深度 2。
- 依然遇到 `"-5"`（深度 1）→ 不符合 → 節點 2 的右子節點為 null。
- 回溯從節點 2 到根節點（節點 1）。

```
[1, 2, null, 3, null, null, null, 4]
```

**步驟 5.4：在節點 1處處理右子節點**

- 根節點 1 的右子節點應為深度 1。
- 現在 `"-5"` 的深度 1 與預期吻合 → 建立節點 5，並作為 1 的右子節點。

```
[1, 2, 5, 3, null, null, null, 4]
```
```
      1
     / \
    2   5
   /
  3
 /
4
```

**步驟 6：處理節點 5 的左子節點 `"--6"`（深度 2）**

- 期深度為 2，將節點 6 作為 5 的左子節點。

```
[1, 2, 5, 3, null, 6, null, 4]
```
```
      1
     / \
    2   5
   /   /
  3   6
 /
4
```

**步驟 7：處理節點 6 的左子節點 `"---7"`（深度 3）**

- 預期深度為 3，將節點 7 作為 6 的左子節點。

```
[1, 2, 5, 3, null, 6, null, 4, null, 7]
```
```
      1
     / \
    2   5
   /   /
  3   6
 /   /
4   7
```

**步驟 8：結束遍歷**
- 字串處理完畢，Tree 此時為 `[1, 2, 5, 3, null, 6, null, 4, null, 7]`。

## 解題步驟

### Step 1: 初始化定值與當前檢查字串的索引

```typescript
let i = 0;
const n = traversal.length;
```

### Step 2: 定義遞迴函數 `parseNode`

#### 2.1: 計算當前節點的深度並移動索引

我們需要計算當前節點的深度，以及移動索引到下一個節點的開始位置。
如果當前節點的深度與預期深度不符，我們需要回溯到上一個節點。

```typescript
function parseNode(expectedDepth: number): TreeNode | null {
  let start = i;
  // 計算 `-` 的數量來得到節點的深度
  let depth = 0;
  while (i < n && traversal[i] === '-') {
    depth++;
    i++;
  }
  if (depth !== expectedDepth) {
    // 如果深度不符，回溯到上一個節點
    i = start; // 回溯索引
    return null;
  }
  
  //...
}
```

#### 2.2: 解析節點的值

由於我們不知道數字有幾位數，所以我們需要一個迴圈來解析節點的值。
這邊利用 ASCII 碼來計算數字。

```typescript
function parseNode(expectedDepth: number): TreeNode | null {
  //2.1: 計算當前節點的深度並移動索引
  
  // 解析節點的值
  let num = 0;
  while (i < n && traversal[i] >= '0' && traversal[i] <= '9') {
    // 這裡我們把所有找到的數字合併成一個整數
    num = num * 10 + (traversal[i].charCodeAt(0) - 48);
    i++;
  }
  
  //...
}
```

#### 2.3: 建立節點

當取得節點的值後，我們就可以建立一個新的節點。
並將它的值設定為剛剛解析的數字。
然後遞迴處理左右子節點。

```typescript
function parseNode(expectedDepth: number): TreeNode | null {
  // 2.1: 計算當前節點的深度並移動索引
  
  // 2.2: 解析節點的值
  
  // 建立節點
  const node = new TreeNode(num);

  // 遞迴處理左右子節點
  node.left = parseNode(expectedDepth + 1);
  node.right = parseNode(expectedDepth + 1);
  
  // 回傳節點
  return node;
}
```

### Step 3: 呼叫遞迴函數 `parseNode`

最後，我們只需要呼叫遞迴函數 `parseNode` 並回傳根節點。

```typescript
return parseNode(0);
```

## 時間複雜度

- 算法只需對輸入字串進行一次遍歷，每個字符只被處理一次，故時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 如果是一個平衡二叉樹，遞迴深度最多為 $O(\log n)$。
- 在最壞情況下，遞迴深度可能達到 $O(n)$，因此空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
