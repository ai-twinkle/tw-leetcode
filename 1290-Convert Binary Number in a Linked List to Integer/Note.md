# 1290. Convert Binary Number in a Linked List to Integer

Given `head` which is a reference node to a singly-linked list. 
The value of each node in the linked list is either `0` or `1`. 
The linked list holds the binary representation of a number.

Return the decimal value of the number in the linked list.

The most significant bit is at the head of the linked list.

**Constraints:**

- The Linked List is not empty.
- Number of nodes will not exceed `30`.
- Each node's value is either `0` or `1`.

## 基礎思路

本題的核心任務為將一個以單向鏈結串列表示的二進位數字，轉換為對應的十進位整數。
考量到鏈結串列的頭節點表示二進位數的最高位元（Most Significant Bit, MSB），我們可以透過以下方式來實現轉換：

* **從鏈結串列的頭節點開始逐步向後遍歷**，每走過一個節點，即代表讀取一個新的二進位位元。
* 將累積的數值左移一個位元（代表將當前數字乘以2），再將目前節點的值加入最低位。
* 透過不斷地左移與位元運算，最終可一次遍歷完成數字的轉換，獲得正確的十進位結果。

此方法可避免額外空間使用與重複計算，符合本題的最佳解法。

## 解題步驟

### Step 1：初始化變數

首先建立兩個輔助變數：

- `accumulatedValue`：作為結果累積器，初始值為 0。
- `currentNode`：用來逐步遍歷鏈結串列，初始指向鏈結串列的頭節點 `head`。

```typescript
let accumulatedValue = 0;    // 儲存轉換後的十進位結果
let currentNode = head;      // 指向目前處理中的節點
```

### Step 2：遍歷鏈結串列並累積數值

從鏈結串列頭節點開始逐一處理每個節點，直到遍歷至串列結尾（`currentNode === null`）：

- 每次將累積的數值往左位移一位（相當於數值乘以 2）。
- 將當前節點的值（`0` 或 `1`）以位元 OR 運算加入至最低位，更新累積數值。
- 將節點指標向後移動，繼續處理下一個節點。

```typescript
while (currentNode !== null) {
  // 將累積值左移一位並加入當前位元的值
  accumulatedValue = (accumulatedValue << 1) | currentNode.val;
  
  // 移動到下一個節點
  currentNode = currentNode.next;
}
```

### Step 3：回傳最終累積結果

完成所有節點的遍歷後，累積器內儲存的數值即為最終的十進位數值，回傳即可：

```typescript
return accumulatedValue;
```

## 時間複雜度

- 只需要完整遍歷一次鏈結串列，且每個節點僅進行固定次數的位元運算，因此為 $O(n)$，其中 $n$ 為鏈結串列的節點數目。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只額外使用固定數量的變數進行計算，沒有使用其他與輸入大小相關的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
