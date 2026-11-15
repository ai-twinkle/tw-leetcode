# 19. Remove Nth Node From End of List

Given the `head` of a linked list, remove the `n^{th}` node from the end of the list and return its head.

**Constraints:**

- The number of nodes in the list is `sz`.
- `1 <= sz <= 30`
- `0 <= Node.val <= 100`
- `1 <= n <= sz`

## 基礎思路

本題要求從單向鏈結串列中，移除倒數第 `n` 個節點，並回傳修改後的串列頭節點。由於單向鏈結串列只能由前往後走訪，無法直接從尾端倒數，因此需要用其他方式確定目標節點的位置。

在思考解法時，可掌握以下核心觀察：

- **倒數位置可轉換為固定間距**：
  若兩個指標之間保持固定的距離，當前方指標抵達串列尾端時，後方指標恰好落在距尾端固定距離之處，因此能將「倒數第幾個」轉換為「相對位置」。

- **刪除節點需要停在其前一個節點**：
  在單向鏈結串列中，要移除某節點，必須修改其前驅節點的連結，因此後方指標應停在目標節點的前一個位置。

- **目標為頭節點時需特別處理**：
  若倒數位置恰好等於串列長度，目標即為頭節點，此時不存在前驅節點，只能直接以下一個節點作為新的頭。

依據以上特性，可以採用以下策略：

- **先讓前方指標領先指定步數**，建立兩指標間的固定間距。
- **若前方指標已走出串列，代表要移除的是頭節點，直接回傳第二個節點**。
- **否則讓兩指標同步前進，直到前方指標抵達最後一個節點**，此時後方指標即位於目標節點之前。
- **跳過目標節點完成刪除**。

此策略只需走訪串列一次，即可完成刪除操作。

## 解題步驟

### Step 1：鏈結串列節點的定義

題目提供的單向鏈結串列節點結構，每個節點包含數值與指向下一個節點的連結。

```typescript
/**
 * 單向鏈結串列的定義。
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */
```

### Step 2：讓前方指標先行前進 n 步

前方指標從頭節點出發，先往後移動 `n` 次，與之後才出發的後方指標拉開固定為 `n` 的間距。

```typescript
let leadingNode = head!;

// 將前方指標先移動 n 個節點，使兩指標之間的間距為 n
for (let step = 0; step < n; step++) {
  leadingNode = leadingNode.next!;
}
```

### Step 3：若前方指標已走出串列，代表要移除的是頭節點

若前方指標此時為 `null`，表示 `n` 等於串列長度，目標正是頭節點。由於頭節點沒有前驅節點，直接回傳第二個節點作為新的頭。

```typescript
// 若前方指標已走出串列尾端，要移除的節點即為頭節點本身
if (leadingNode === null) {
  return head!.next;
}
```

### Step 4：讓兩指標同步前進直到前方指標抵達最後一個節點

後方指標從頭節點出發。兩指標每輪各前進一步，間距維持不變。當前方指標停在最後一個節點時，後方指標恰好位於目標節點的前一個位置。

```typescript
let trailingNode = head!;

// 同步推進兩個指標，直到前方指標抵達最後一個節點
while (leadingNode.next !== null) {
  leadingNode = leadingNode.next;
  trailingNode = trailingNode.next!;
}
```

### Step 5：跳過目標節點完成刪除

後方指標的下一個節點即為目標節點。將其連結改為指向目標節點的下一個節點，目標節點便從串列中移除。

```typescript
// 後方指標此時位於目標節點之前，因此直接跳過目標節點
trailingNode.next = trailingNode.next!.next;
```

### Step 6：回傳串列頭節點

頭節點未被移除，因此原本的 `head` 仍為串列的頭，直接回傳。

```typescript
return head;
```

## 時間複雜度

- 前方指標先行前進 `n` 步，之後兩指標同步前進直到串列尾端；
- 前方指標全程最多走訪整條串列一次，設串列長度為 $sz$；
- 總時間複雜度為 $O(sz)$。

> $O(sz)$

## 空間複雜度

- 僅使用兩個指標與迴圈計數變數；
- 未配置任何額外的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
