# 61. Rotate List

Given the `head` of a linked list, rotate the list to the right by `k` places.

**Constraints:**

- The number of nodes in the list is in the range `[0, 500]`.
- `-100 <= Node.val <= 100`
- `0 <= k <= 2 * 10^9`

## 基礎思路

本題要求將一個單向鏈結串列向右旋轉 `k` 個位置，也就是將尾端的若干節點移動到串列前端。由於 `k` 可能遠大於串列長度，需要考慮如何有效處理重複旋轉的情況。

在思考解法時，可掌握以下核心觀察：

- **旋轉具有週期性**：
  向右旋轉長度為 `n` 的串列 `n` 次，結果與原串列相同。因此有效旋轉次數為 `k mod n`，可大幅減少不必要的運算。

- **旋轉本質為切割與重接**：
  向右旋轉 `k` 次等價於找到新的頭節點位置，將串列分為前後兩段再重新拼接，而非真正逐步移動每一個節點。

- **以環狀結構簡化重接操作**：
  先將尾節點指向頭節點形成環，之後只需找到新的尾節點位置，斷開環即可完成旋轉，避免額外的指標操作。

- **新尾節點的位置可由長度推算**：
  旋轉後的新頭節點為原本第 `n - k` 個節點（從 1 起算），其前一個節點即為新尾節點，可透過一次線性走訪定位。

依據以上特性，可以採用以下策略：

- **第一次走訪**：同時計算串列長度並定位原始尾節點。
- **利用模運算縮減旋轉次數**：排除整數倍週期後取有效旋轉量。
- **形成暫時環狀串列後，定位新尾節點並斷開**，以 $O(n)$ 時間完成整個旋轉。

此策略僅需兩次線性走訪，無需額外空間，且能正確處理所有邊界情況。

## 解題步驟

### Step 1：處理不需旋轉的邊界情況

若串列為空、只有一個節點，或旋轉量為零，結果與原串列相同，可直接回傳。

```typescript
// 若串列為空、只有一個節點或旋轉次數為零，直接回傳
if (head === null || head.next === null || k === 0) {
  return head;
}
```

### Step 2：走訪串列以取得尾節點與串列長度

從頭節點出發，逐步走到尾端，同時計算節點總數，為後續計算有效旋轉量做準備。

```typescript
// 第一次走訪：同時找到尾節點並計算串列長度
let tail = head;
let length = 1;
while (tail.next !== null) {
  tail = tail.next;
  length++;
}
```

### Step 3：計算有效旋轉次數並排除零旋轉情況

將 `k` 對串列長度取模，去除整數倍週期後得到真正需要旋轉的次數；
若結果為零，代表無需任何旋轉，直接回傳。

```typescript
// 將 k 縮減為有效旋轉次數，若 k 已小於長度則不需取模
let effectiveRotation = k;
if (effectiveRotation >= length) {
  effectiveRotation = effectiveRotation % length;
}

// 有效旋轉次數為零時，無需任何操作
if (effectiveRotation === 0) {
  return head;
}
```

### Step 4：將尾節點接回頭節點形成暫時環狀串列

將尾節點的 `next` 指向頭節點，構成一個環，讓後續的斷點操作更為直觀。

```typescript
// 將尾節點連接至頭節點，形成暫時的環狀串列
tail.next = head;
```

### Step 5：走訪至新尾節點的位置

旋轉後的新頭節點為原本從頭算起第 `length - effectiveRotation` 個節點，
其前一個節點即為新尾節點，需從原頭節點走訪 `length - effectiveRotation - 1` 步到達。

```typescript
// 計算需要走到新尾節點的步數
const stepsToNewTail = length - effectiveRotation - 1;
let newTail = head;
for (let stepIndex = 0; stepIndex < stepsToNewTail; stepIndex++) {
  newTail = newTail.next!;
}
```

### Step 6：斷開環狀串列並回傳新頭節點

新尾節點的下一個節點即為新頭節點；
將新尾節點的 `next` 設為 `null` 斷開環，完成旋轉後回傳新頭節點。

```typescript
// 斷開環狀連結並記錄新頭節點
const newHead = newTail.next!;
newTail.next = null;

return newHead;
```

## 時間複雜度

- 第一次走訪串列以取得長度與尾節點，需 $O(n)$；
- 第二次走訪至新尾節點位置，最多 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的指標與計數變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
