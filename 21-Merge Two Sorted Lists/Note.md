# 21. Merge Two Sorted Lists

You are given the heads of two sorted linked lists `list1` and `list2`.

Merge the two lists into one sorted list. 
The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

**Constraints:**

- The number of nodes in both lists is in the range `[0, 50]`.
- `-100 <= Node.val <= 100`
- Both `list1` and `list2` are sorted in non-decreasing order.

## 基礎思路

本題要求將兩條已依非遞減順序排列的單向鏈結串列合併為一條仍然有序的串列，且必須直接拼接原有節點，而非建立新節點。

在思考解法時，可掌握以下核心觀察：

- **兩條串列皆已有序**：
  合併後串列的下一個節點，必定是兩條串列目前開頭中較小的那一個，因此每一步只需比較兩個開頭節點即可。

- **空串列可直接處理**：
  若其中一條串列為空，合併結果就是另一條串列本身，無需任何運算。

- **首節點可直接決定**：
  合併後的開頭必為兩串列開頭中較小者。先選出首節點，就不需要額外的虛擬節點來簡化串接流程。

- **剩餘部分本身已經有序**：
  當其中一條串列耗盡時，另一條剩下的節點已依序排列，可一次整段接上，不需逐一處理。

依據以上特性，可以採用以下策略：

- **先處理任一串列為空的情況**，直接回傳另一條串列。
- **比較兩開頭選出合併後的首節點**，並以尾端指標記錄目前合併串列的末端。
- **在兩條串列皆有節點時，反覆將較小的開頭節點接到尾端**，並推進對應的串列。
- **其中一條耗盡後，將另一條剩餘部分整段接上**，完成合併。

此策略只需線性走訪一次所有節點，且僅重新連接既有節點，不需額外空間。

## 解題步驟

### Step 1：了解鏈結串列節點的定義

題目所使用的單向鏈結串列節點包含一個數值與指向下一個節點的指標，合併過程只會調整節點之間的連結。

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

### Step 2：處理任一串列為空的情況

若其中一條串列為空，合併結果就是另一條串列，可直接回傳。

```typescript
// 若任一串列為空，則直接回傳另一條串列
if (list1 === null) {
  return list2;
}
if (list2 === null) {
  return list1;
}
```

### Step 3：選出較小的開頭節點作為合併後的首節點

比較兩條串列的開頭，將較小者設為合併串列的首節點，並推進該串列。由於首節點已直接決定，不需要建立虛擬節點。

```typescript
// 直接選出較小的開頭節點，因此不需要虛擬節點
let mergedHead: ListNode;
if (list1.val <= list2.val) {
  mergedHead = list1;
  list1 = list1.next;
} else {
  mergedHead = list2;
  list2 = list2.next;
}
```

### Step 4：初始化合併串列的尾端指標

使用 `mergedTail` 記錄合併串列目前的最後一個節點，之後的新節點都接在它後面。

```typescript
let mergedTail = mergedHead;
```

### Step 5：兩串列皆有節點時，逐一接上較小的開頭節點

當兩條串列都還有節點時，比較兩者開頭，將較小者接到尾端，更新尾端指標，並推進對應的串列。

```typescript
// 當兩條串列皆仍有節點時，接上較小的開頭節點
while (list1 !== null && list2 !== null) {
  if (list1.val <= list2.val) {
    mergedTail.next = list1;
    mergedTail = list1;
    list1 = list1.next;
  } else {
    mergedTail.next = list2;
    mergedTail = list2;
    list2 = list2.next;
  }
}
```

### Step 6：將剩餘部分整段接上

迴圈結束時，至多只有一條串列還有節點。這些節點已經有序，可一次接到合併串列的尾端。

```typescript
// 剩餘部分本身已經有序，因此可一次整段接上
mergedTail.next = list1 !== null ? list1 : list2;
```

### Step 7：回傳合併後串列的首節點

合併完成後，回傳先前決定的首節點。

```typescript
return mergedHead;
```

## 時間複雜度

- 設兩條串列的長度分別為 $n$ 與 $m$；
- 每個節點最多被比較與連接一次；
- 剩餘部分整段接上為常數時間。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 僅使用固定數量的指標變數；
- 直接重新連接原有節點，未建立任何新節點。
- 總空間複雜度為 $O(1)$。

> $O(1)$
