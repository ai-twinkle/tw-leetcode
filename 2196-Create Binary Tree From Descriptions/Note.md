# 2196. Create Binary Tree From Descriptions

You are given a 2D integer array descriptions where `descriptions[i] = [parent_i, child_i, isLeft_i]` indicates 
that `parent_i` is the parent of `child_i` in a binary tree of unique values. Furthermore,

- If `isLeft_i == 1`, then `child_i` is the left child of `parent_i`.
- If `isLeft_i == 0`, then `child_i` is the right child of `parent_i`.

Construct the binary tree described by `descriptions` and return its root.

The test cases will be generated such that the binary tree is valid.

**Constraints:**

- `1 <= descriptions.length <= 10^4`
- `descriptions[i].length == 3`
- `1 <= parent_i, child_i <= 10^5`
- `0 <= isLeft_i <= 1`
- The binary tree described by `descriptions` is valid.

## 基礎思路

本題給定一組 `[父值, 子值, isLeft]` 的描述，要求依此建構一棵二元樹並回傳其根節點。由於資料僅描述「兩節點之間的關係」，因此每個值可能於不同描述中重複出現（一次作為父、一次作為子），我們必須避免重複建立同一節點，並且在所有關係連接完畢後正確辨識出根節點。

在思考解法時，可掌握以下核心觀察：

- **每個值最多對應一個樹節點**：
  同一個值可能在多筆描述中出現於父或子的位置，因此需要以雜湊結構維護「值到節點」的對應，確保節點僅被建立一次。

- **節點可採惰性建立**：
  無論某個值先以父身份或子身份出現，皆可在當下檢查是否已建立；若尚未存在則立即建立，再依關係進行連接。

- **根節點的唯一識別特徵**：
  根節點是唯一一個「曾作為父出現、卻從未作為子出現」的值；因此只要記錄所有曾經作為子的值，再反向過濾即可。

- **數值範圍有限**：
  題目保證所有值落在 `[1, 10^5]` 區間內，因此可採用一個固定大小的扁平陣列來標記「是否曾經作為子」，相較於雜湊集合更為省記憶體且查詢更快。

依據以上特性，可以採用以下策略：

- **以單次掃描建構所有節點與連接關係**：對每筆描述惰性建立父子節點，並依 `isLeft` 將子節點掛接到父節點的正確側。
- **同時記錄哪些值已具有父節點**，以便後續直接排除其作為根節點的可能。
- **再次走訪描述陣列**，找到第一個從未作為子的父值並回傳其對應節點，即為樹的根節點。

此策略只需兩輪線性走訪即可完成建樹與根節點辨識，邏輯清晰且效率良好。

## 解題步驟

### Step 1：建立節點映射與父節點標記容器

先建立一個雜湊表用以保存「值對應的節點」，並使用一個固定大小的扁平位元陣列記錄「哪些值曾出現於子節點位置」，最後紀錄描述總筆數以便後續走訪。

```typescript
const nodeMap = new Map<number, TreeNode>();
// 數值範圍由題目限制保證至多 10^5，因此使用扁平的 Uint8Array
// 可在最小記憶體佔用下提供 O(1) 的成員查詢
const hasParent = new Uint8Array(100001);
const length = descriptions.length;
```

### Step 2：進入單次遍歷並解析每筆描述

以一輪迴圈逐筆處理 `descriptions`，先把當前描述拆解為父值、子值與方向旗標，作為後續建立節點與連接關係的依據。

```typescript
// 單次走訪：依序建立節點並串接父子關係
for (let i = 0; i < length; i++) {
  const description = descriptions[i];
  const parentValue = description[0];
  const childValue = description[1];
  const isLeft = description[2];

  // ...
}
```

### Step 3：取得或惰性建立父節點

從雜湊表查找該父值是否已建立節點；若尚未存在，則立即建立並寫入映射，以保證每個值僅對應一個唯一節點實例。

```typescript
for (let i = 0; i < length; i++) {
  // Step 2：提取當前描述中的父值、子值與方向

  // 取得或建立父節點
  let parentNode = nodeMap.get(parentValue);
  if (parentNode === undefined) {
    parentNode = new TreeNode(parentValue);
    nodeMap.set(parentValue, parentNode);
  }

  // ...
}
```

### Step 4：取得或惰性建立子節點

以相同方式處理子值；若雜湊表中尚未存在對應節點則建立並寫入，確保稍後連接時雙方皆為同一份節點實例。

```typescript
for (let i = 0; i < length; i++) {
  // Step 2：提取當前描述中的父值、子值與方向

  // Step 3：取得或建立父節點

  // 取得或建立子節點
  let childNode = nodeMap.get(childValue);
  if (childNode === undefined) {
    childNode = new TreeNode(childValue);
    nodeMap.set(childValue, childNode);
  }

  // ...
}
```

### Step 5：依方向旗標將子節點掛接於父節點的正確側

根據 `isLeft` 的值決定子節點掛接位置：為 1 時設為左子節點，否則設為右子節點，從而完成此描述所對應的父子連接。

```typescript
for (let i = 0; i < length; i++) {
  // Step 2：提取當前描述中的父值、子值與方向

  // Step 3：取得或建立父節點

  // Step 4：取得或建立子節點

  // 將子節點連到父節點的正確一側
  if (isLeft === 1) {
    parentNode.left = childNode;
  } else {
    parentNode.right = childNode;
  }

  // ...
}
```

### Step 6：標記此子值已具有父節點

由於該子值已被連接於某個父節點之下，將其於標記陣列中設為 1，使其於後續搜尋根節點時被排除。

```typescript
for (let i = 0; i < length; i++) {
  // Step 2：提取當前描述中的父值、子值與方向

  // Step 3：取得或建立父節點

  // Step 4：取得或建立子節點

  // Step 5：將子節點掛接於父節點的正確側

  // 標記此值已具有父節點，後續用以排除其作為根節點的可能
  hasParent[childValue] = 1;
}
```

### Step 7：反向掃描以辨識並回傳根節點

再次走訪描述陣列，找出第一個「曾作為父出現卻從未作為子出現」的值，其對應節點即為樹的根節點；若理論上不存在則回傳 `null` 作為防禦性結果。

```typescript
// 根節點為唯一從未出現於子節點位置的父值
for (let i = 0; i < length; i++) {
  const parentValue = descriptions[i][0];
  if (hasParent[parentValue] === 0) {
    return nodeMap.get(parentValue) ?? null;
  }
}

return null;
```

## 時間複雜度

- 第一輪迴圈遍歷所有描述，每筆執行常數次的 Map 查詢與寫入，以及陣列存取，總計 $O(n)$；
- 第二輪迴圈最多再走訪 n 筆描述以尋找根節點，亦為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 節點映射 `nodeMap` 最多儲存 $O(n)$ 個節點；
- 父節點標記陣列 `hasParent` 大小固定為 $V = 10^5$，佔用 $O(V)$；
- 總空間複雜度為 $O(n + V)$。

> $O(n + V)$
