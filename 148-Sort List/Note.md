# 148. Sort List

Given the `head` of a linked list, return the list after sorting it in ascending order.

**Constraints:**

- The number of nodes in the list is in the range `[0, 5 * 10^4]`.
- `-10^5 <= Node.val <= 10^5`

## 基礎思路

本題要求將一個給定的單向鏈結串列（Linked List）以**遞增順序排序**後返回。

由於鏈結串列不支援隨機存取且操作節點的指標調整複雜，一般基於比較的排序法（如快速排序、堆積排序等）在此情境下不夠高效。

因此，我們應當選擇一種更適合鏈結串列且考量題目給定的數值範圍（$-10^5$ 到 $10^5$）與鏈結串列長度（最多 $5 \times 10^4$）的排序方法。
「桶排序」（Bucket/Counting Sort）在此情境下特別適合，因為其步驟清晰，效率高，且能巧妙地利用給定的範圍限制：

1. 首次遍歷找出串列中的最小值與最大值，確定排序所需的範圍。
2. 透過第二次遍歷，以計數方式記錄每個數值出現的次數。
3. 第三次遍歷，直接將統計出的排序結果回寫到原鏈結串列中。

此方法的好處是**完全不用調整節點的連結方式，也不需新分配節點，僅透過節點值覆寫即可完成排序**，高效且簡潔。

## 解題步驟

### Step 1：處理特殊情況（空鏈結串列或單節點）

首先檢查給定的鏈結串列是否為空或僅包含單節點，因這兩種情況已天然符合排序要求：

```typescript
// 鏈結串列為空或僅有單節點，直接返回
if (head === null || head.next === null) {
  return head;
}
```

### Step 2：首次遍歷找出鏈結串列數值的最大與最小值

透過首次遍歷確認鏈結串列數值的範圍：

- 初始化兩個變數 `minimumValue` 與 `maximumValue` 以 head 的值作為起始值。
- 使用 `currentNode` 遍歷每個節點，隨時更新最小與最大值。

```typescript
let minimumValue = head.val;
let maximumValue = head.val;
let currentNode: ListNode | null = head;

while (currentNode !== null) {
  const value = currentNode.val;
  // 更新目前找到的最小值
  if (value < minimumValue) {
    minimumValue = value;
  // 更新目前找到的最大值
  } else if (value > maximumValue) {
    maximumValue = value;
  }
  currentNode = currentNode.next;
}
```

### Step 3：建立並初始化桶（計數陣列）

* 透過已知的最大與最小值，計算出桶的大小 (`bucketCount`)。
* 為避免負數索引，利用 `valueOffset` 調整索引。
* 使用 Uint32Array（高效數值陣列）作為桶，初始每個元素值為 0。

```typescript
const valueOffset = -minimumValue; // 調整負值索引的偏移量
const bucketCount = maximumValue - minimumValue + 1; // 計數桶數量
const frequencyCounts = new Uint32Array(bucketCount); // 初始化計數桶
```

### Step 4：第二次遍歷統計每個數值的出現次數

透過第二次遍歷將每個數值的出現次數記錄於對應的桶（計數陣列）中：

```typescript
currentNode = head;
while (currentNode !== null) {
  // 將目前數值的出現次數加一
  frequencyCounts[currentNode.val + valueOffset]++;
  currentNode = currentNode.next;
}
```

### Step 5：第三次遍歷，將桶中的排序結果回寫到鏈結串列中

* 使用 `writePointer` 指向鏈結串列頭節點。
* 依序檢查每個桶（計數陣列），若有出現次數，則將對應數值逐一覆寫回鏈結串列的節點值中。

```typescript
let writePointer = head;
for (let bucketIndex = 0; bucketIndex < bucketCount; ++bucketIndex) {
  let occurrences = frequencyCounts[bucketIndex];
  // 若此桶數值沒有出現過，則跳過
  if (occurrences === 0) {
    continue;
  }
  const sortedValue = bucketIndex - valueOffset; // 取回真實數值
  // 根據出現次數，逐一覆寫回鏈結串列
  while (occurrences-- > 0) {
    writePointer.val = sortedValue;
    writePointer = writePointer.next!;  // 此處保證 writePointer 非 null
  }
}
```

### Step 6：返回排序完成的鏈結串列

當所有數值已依序寫回鏈結串列中，回傳原來的頭節點即為排序完成的結果：

```typescript
return head;
```

## 時間複雜度

- 第一次遍歷尋找最小與最大值：$O(n)$，$n$ 為鏈結串列長度。
- 第二次遍歷進行計數：$O(n)$。
- 第三次遍歷寫回排序結果：$O(n + R)$，$R$ 為數值範圍（$2 \times 10^5$）。
- 總時間複雜度為：$O(n + R)$。

> $O(n + R)$

實務上 $n$ 通常小於 $R$，因此可視為線性時間複雜度。

## 空間複雜度

- 額外需要桶陣列（計數陣列）的空間，大小為數值範圍 $R$（此題最大為 $2 \times 10^5$）。
- 其他變數僅需常數空間。
- 總空間複雜度為：$O(R)$。

> $O(R)$
