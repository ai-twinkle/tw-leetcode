# 2095. Delete the Middle Node of a Linked List

You are given the `head` of a linked list. 
Delete the middle node, and return the `head` of the modified linked list.

The middle node of a linked list of size `n` is the $⌊n / 2⌋^{th}$ node from the start using 0-based indexing, 
where `⌊x⌋` denotes the largest integer less than or equal to `x`.

For `n` = `1`, `2`, `3`, `4`, and `5`, the middle nodes are `0`, `1`, `1`, `2`, and `2`, respectively.

**Constraints:**

- The number of nodes in the list is in the range `[1, 10^5]`.
- `1 <= Node.val <= 10^5`

## 基礎思路

本題要求在單向鏈結串列中刪除中間節點，其中「中間節點」依照 0-based 索引定義為第 $⌊n/2⌋$ 個節點。在解題時需注意單向鏈結串列僅能向前遍歷的特性，因此若要刪除某節點，必須先取得其「前一個節點」才能透過指標重新連接完成刪除。

在思考解法時，可掌握以下核心觀察：

- **單向鏈結串列無法回頭**：
  必須在抵達中間節點之前，先掌握其前驅節點的位置，才能以 $O(1)$ 完成刪除動作。

- **長度未知且不必額外計算**：
  若先走一次計算長度、再走第二次定位中間節點，雖然可行但需要兩次遍歷；可考慮以雙指針同時推進，於一次遍歷中完成定位。

- **快慢指針的速度差具關鍵作用**：
  若慢指針每次走一步、快指針每次走兩步，則當快指針到達尾端時，慢指針恰落於串列的中間位置。

- **以起始偏移取代額外判斷**：
  若讓快指針一開始就提前兩個節點出發，當快指針走不下去時，慢指針所在位置剛好是中間節點的「前一個節點」，可直接進行刪除，避免後續再做位置修正。

依據以上特性，可以採用以下策略：

- **預先處理長度過短的特例**，當串列僅有 0 或 1 個節點時，刪除中間節點後即為空。
- **使用偏移後的雙指針同步推進**，快指針起始提前兩步，使慢指針自然停留在中間節點的前驅位置。
- **以指標重接的方式跳過中間節點**，達成 $O(1)$ 的刪除動作。

此策略可在一次遍歷內完成中間節點的定位與刪除，邏輯簡潔且效率最佳。

## 解題步驟

### Step 1：處理長度不足的特例

若串列為空，或僅有一個節點，那麼該唯一節點本身即為中間節點，刪除後不再剩任何節點，可直接回傳 `null`。

```typescript
// 若節點數為 0 或 1，刪除唯一節點 / 中間節點後將不剩任何節點
if (head === null || head.next === null) {
  return null
}
```

### Step 2：初始化快慢指針，並讓快指針提前兩格出發

慢指針自 `head` 開始；快指針則直接從 `head.next.next` 出發，相當於比慢指針預先前進兩個節點。這個偏移是後續能在一次遍歷內讓慢指針停留於「中間節點之前一個節點」的關鍵。

```typescript
// 慢指針每次推進一個節點；快指針每次推進兩個節點，且起始位置已提前兩個節點
let slowPointer: ListNode = head
let fastPointer: ListNode | null = head.next.next
```

### Step 3：透過雙指針同步推進，定位中間節點的前驅

只要快指針仍能繼續往前走兩步，就讓兩個指針一起前進；當快指針已無法再向前推進兩步時，慢指針恰好停留在中間節點的前一個節點上，無論串列長度為奇數或偶數都成立。

```typescript
// 當快指針已無法再前進兩步時，慢指針恰好停留在中間節點的前一個節點
while (fastPointer !== null && fastPointer.next !== null) {
  slowPointer = slowPointer.next as ListNode
  fastPointer = fastPointer.next.next
}
```

### Step 4：跳過中間節點完成刪除，並回傳串列頭

讓慢指針的 `next` 直接指向「中間節點的下一個節點」，等同於把中間節點從串列中移除；由於頭節點未被更動，最後直接回傳原本的 `head` 即可。

```typescript
// 透過略過中間節點來以 O(1) 完成刪除
slowPointer.next = (slowPointer.next as ListNode).next

return head
```

## 時間複雜度

- 快指針每輪推進兩個節點，最多走過約 $n/2$ 步即抵達串列尾端；
- 慢指針隨之推進，整體仍為線性次數的指標移動；
- 其餘皆為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的指標變數（快指針與慢指針）；
- 未配置任何額外的陣列或輔助結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
