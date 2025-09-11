# 2. Add Two Numbers

You are given two non-empty linked lists representing two non-negative integers. 
The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Constraints:**

- The number of nodes in each linked list is in the range `[1, 100]`.
- `0 <= Node.val <= 9`
- It is guaranteed that the list represents a number that does not have leading zeros.

## 基礎思路

本題要求將兩個反向儲存的數字（以鏈結串列表示）加總，並回傳結果同樣以反向儲存的鏈結串列表示。
這就像是在紙上做「直式加法」，從個位數開始逐位計算。

為了完成這件事，我們可以採用以下策略：

- 每次同時讀取兩個串列當前位的數字進行相加，若某一方已走到底則補 0。
- 使用一個變數 `carry` 紀錄每次相加是否產生進位。
- 將每位加總結果建立成新節點，依序串接到結果串列後方。
- 為了簡化操作，使用一個「虛擬頭節點」來建立結果串列，避免特殊處理第一個節點。
- 加總結束後，若仍有進位，須額外補上一節點。

這些操作都能在一次遍歷中完成，空間上只需要建一條新的串列，額外變數使用極少，因此效率也很高。

## 解題步驟

### Step 1：處理空串列的邊界情況

若其中一條輸入串列為空，則結果等於另一條串列。

```typescript
// 處理其中一條串列為空的邊界情況
if (l1 === null) {
  return l2;
}
if (l2 === null) {
  return l1;
}
```

### Step 2：建立虛擬頭節點與初始化尾指標

使用 dummy head 方便後續統一插入節點的邏輯，避免判斷是否為第一個節點。

```typescript
// 以虛擬頭節點簡化結果串列的建立，並維護尾指標以便追加新節點
const dummyHeadNode = new ListNode(0);
let resultTailNode = dummyHeadNode;
```

### Step 3：初始化指標與進位變數

設置用來遍歷兩條輸入串列的指標，並初始化進位變數為 0。

```typescript
// 初始化走訪指標與進位（處理位數進位）
let list1Pointer: ListNode | null = l1;
let list2Pointer: ListNode | null = l2;
let carryOver = 0;
```

### Step 4：遍歷兩條串列，逐位計算並建立新節點

此步驟進行主邏輯：同步走訪兩串列，計算每一位的總和與進位，並建立對應節點加入結果串列。

```typescript
// 同步走訪兩串列直到所有位元處理完畢
while (list1Pointer !== null || list2Pointer !== null) {
  // 取得當前位數字（較短的串列視為 0）
  const digitFromList1 = list1Pointer ? list1Pointer.val : 0;
  const digitFromList2 = list2Pointer ? list2Pointer.val : 0;

  // 計算兩位數字加上前一次進位的總和
  const sumOfDigits = digitFromList1 + digitFromList2 + carryOver;

  // 以新節點記錄本位數值，並更新進位
  if (sumOfDigits >= 10) {
    resultTailNode.next = new ListNode(sumOfDigits - 10);
    carryOver = 1;
  } else {
    resultTailNode.next = new ListNode(sumOfDigits);
    carryOver = 0;
  }

  // 推進尾指標與輸入串列的走訪指標
  resultTailNode = resultTailNode.next!;
  if (list1Pointer !== null) {
    list1Pointer = list1Pointer.next;
  }
  if (list2Pointer !== null) {
    list2Pointer = list2Pointer.next;
  }
}
```

### Step 5：處理最終進位（若有）

若最後仍有進位，代表需補上一個進位節點。

```typescript
// 若處理完後仍有進位，將其以新節點補到尾端
if (carryOver !== 0) {
  resultTailNode.next = new ListNode(carryOver);
}
```

### Step 6：回傳實際結果的頭節點

跳過 dummy 頭節點，回傳真正的加總結果。

```typescript
// 回傳實際結果頭節點（跳過虛擬頭）
return dummyHeadNode.next;
```

## 時間複雜度

- 需要同時走訪兩條鏈結串列，遍歷過程中每個節點只處理一次。
- 每次節點操作（加總、建立節點、串接、指標移動）皆為常數時間。
- 總時間複雜度為 $O(n)$，其中 $n$ 為兩條輸入串列中較長者的節點數。

> $O(n)$

## 空間複雜度

- 在整個加總過程中僅使用了固定數量的指標與變數，因此額外使用的空間為常數。
- 此外建立了一條新的結果鏈結串列，其長度最多為兩條輸入串列長度中較大的那一個加 1。
- 總空間複雜度為 $O(n)$，其中 $n$ 為輸出鏈結串列的節點數。

> $O(n)$
