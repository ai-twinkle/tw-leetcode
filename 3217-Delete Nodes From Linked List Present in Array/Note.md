# 3217. Delete Nodes From Linked List Present in Array

You are given an array of integers `nums` and the `head` of a linked list. 
Return the `head` of the modified linked list after removing all nodes from the linked list that have a value that exists in `nums`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^5`
- All elements in `nums` are unique.
- The number of nodes in the given list is in the range `[1, 10^5]`.
- `1 <= Node.val <= 10^5`
- The input is generated such that there is at least one node in the linked list that has a value not present in `nums`.

## 基礎思路

本題要求我們從一條單向鏈結串列中，**移除所有其值存在於指定陣列 `nums` 中的節點**，並回傳修改後的鏈首（`head`）。

在思考解法時，我們需要特別注意幾個重點：

- `nums` 與鏈結串列的長度皆可達 $10^5$，若在每次節點檢查時用線性搜尋（如 `nums.includes(val)`）會造成 $O(n^2)$ 的效能災難；
- 我們需確保刪除節點時能正確維護鏈結結構，尤其是刪除鏈首或連續節點時；
- 由於節點值與 `nums[i]` 均介於 `[1, 10^5]`，可利用**固定長度的存在表（presence array）**進行快速查詢；
- 設計上應避免過多動態配置（如 `Set`、`Map`）帶來的額外開銷。

為了解決這個問題，我們採取以下策略：

- **建立存在表（Presence Array）**：以 `Uint8Array` 儲存 `nums` 中每個值的出現情況，使查詢成本降至 $O(1)$；
- **使用虛擬頭節點（Dummy Node）**：方便統一處理刪除鏈首節點的情況；
- **雙指標遍歷**：利用 `previousNode` 與 `currentNode` 指標逐一檢查節點，若該值存在於 `nums`，則跳過該節點；
- **固定記憶體訪問模式**：僅進行必要的節點連接操作，避免多餘的屬性存取以提升效能。

此設計確保整體時間與空間皆維持在線性等級，滿足題目上限約束。

## 解題步驟

### Step 1：處理空鏈結情況

若輸入的 `head` 為 `null`，代表鏈表為空，直接回傳 `null`。

```typescript
// 若輸入鏈結串列為空，直接回傳 null
if (head === null) {
  return null;
}
```

### Step 2：建立存在表以快速查詢

使用 TypedArray `Uint8Array` 建立固定長度的存在表，索引即為數值，值為 `1` 代表該數出現在 `nums` 中。

```typescript
// 題目上限：節點值與 nums[i] 皆不超過 100000
const MAX_VALUE = 100000;

// 建立固定長度的存在表（值為 1 表示該數存在於 nums 中）
const presenceArray = new Uint8Array(MAX_VALUE + 1);
```

### Step 3：標記 nums 中的所有數值

透過傳統 `for` 迴圈遍歷 `nums`，將每個數值標記於存在表中。

```typescript
// 將 nums 中出現的值標記於 presenceArray 中
for (let index = 0; index < nums.length; index++) {
  const value = nums[index];
  // 題目保證數值範圍合法，故無需邊界檢查
  presenceArray[value] = 1;
}
```

### Step 4：建立虛擬頭節點以簡化刪除流程

為處理刪除鏈首節點的情況，我們新增一個虛擬頭節點，指向原始 `head`。

```typescript
// 建立虛擬頭節點（dummy node）以簡化刪除操作
const dummyNode = new ListNode(0, head);
```

### Step 5：初始化雙指標

使用 `previousNode` 指向上個保留節點，`currentNode` 逐一遍歷整條鏈表。

```typescript
// 初始化雙指標：previousNode 起點為 dummy，currentNode 起點為 head
let previousNode: ListNode = dummyNode;
let currentNode: ListNode | null = head;
```

### Step 6：遍歷鏈表並刪除指定值節點

當前節點值存在於 `nums`（presenceArray 對應索引為 1）時，跳過該節點；否則保留並前進。

```typescript
// 遍歷整條鏈表，刪除存在於 nums 中的節點
while (currentNode !== null) {
  // 預先快取 next 節點以避免重複屬性訪問
  const nextNode = currentNode.next as ListNode | null;
  const valueToCheck = currentNode.val;

  if (presenceArray[valueToCheck] === 1) {
    // 該節點值存在於 nums 中，需刪除：讓 previousNode 指向 nextNode
    previousNode.next = nextNode;
    // currentNode 移動到下一節點，previousNode 不變
    currentNode = nextNode;
  } else {
    // 該節點值不在 nums 中，保留並同步推進兩指標
    previousNode = currentNode;
    currentNode = nextNode;
  }
}
```

### Step 7：返回更新後的鏈首

最終回傳虛擬頭節點的 `next`，即為刪除後的新鏈首。

```typescript
// 返回刪除後的新鏈首（跳過虛擬節點）
return dummyNode.next;
```

## 時間複雜度

- 構建存在表：遍歷 `nums` 長度為 $m$ → $O(m)$
- 遍歷鏈結串列：長度為 $n$ → $O(n)$
- 查表操作為常數時間 $O(1)$。
- 總時間複雜度為 $O(m + n)$。

> $O(m + n)$

## 空間複雜度

- 存在表 `presenceArray` 需固定 $O(k)$ 空間，其中 $k = 10^5$（常數上限）。
- 其餘僅使用常數額外變數。
- 總空間複雜度為 $O(k)$，可視為 $O(1)$ 常數級別。

> $O(1)$
