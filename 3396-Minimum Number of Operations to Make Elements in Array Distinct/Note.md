# 3396. Minimum Number of Operations to Make Elements in Array Distinct

You are given an integer array `nums`. 
You need to ensure that the elements in the array are distinct. 
To achieve this, you can perform the following operation any number of times:

- Remove 3 elements from the beginning of the array. 
  If the array has fewer than 3 elements, remove all remaining elements.

Note that an empty array is considered to have distinct elements. 
Return the minimum number of operations needed to make the elements in the array distinct.

## 基礎思路

題目要求透過移除陣列前三個元素的操作（若元素不足三個，則全數移除），來達成陣列內元素皆為不重複的目標，問最少需要多少次這樣的操作。

要使陣列元素不重複，我們可先考慮從陣列的末尾往前查看，找出從尾端起往前最長的一段**連續不重複子陣列（unique suffix）**，接著所有重複元素就必須透過前述的「移除前三個元素」來刪除，直到不重複為止。

因此，核心算法可以轉化為：

1. **從陣列末端向前遍歷**，用一個布林陣列（或Set）來紀錄元素是否已經出現過。
2. 一旦找到重複元素，代表從該位置以前的所有元素都必須移除（每次最多移除3個），計算需要多少次移除即可。

## 解題步驟

### Step 1：建立狀態紀錄結構

為了追蹤元素是否已經出現過，這裡使用大小為101（題目限制數字範圍內）的布林陣列，初始值全為`false`：

```typescript
const seen = new Array<boolean>(101).fill(false);
```

我們另外定義變數`firstDuplicateIndex`，用於紀錄從末尾開始第一次出現重複元素的位置，預設為陣列的長度：

```typescript
let firstDuplicateIndex = nums.length;
```

### Step 2：從尾到頭找出最長的不重複子陣列

從陣列尾端開始往前掃描，若某個元素已經出現，則停止迴圈，記下目前索引位置作為重複位置的邊界；否則就把該元素標記為已出現：

```typescript
for (let i = nums.length - 1; i >= 0; i--) {
  const num = nums[i];

  // 如果元素已經出現過，表示從此處之前需進行刪除
  if (seen[num]) {
    break;
  }

  // 否則標記為已見過此元素
  seen[num] = true;

  // 更新不重複子陣列的起始位置
  firstDuplicateIndex = i;
}
```

迴圈結束後，`firstDuplicateIndex` 即表示從該索引開始到陣列末尾為連續的不重複子陣列。

### Step 3：計算所需操作次數

每次操作可以移除前三個元素，因此所需的操作次數為：

```typescript
return ((firstDuplicateIndex + 2) / 3) | 0;
```

此處的 `| 0` 是為了取整數部分，效果等同於 `Math.floor()`。

## 時間複雜度

- 程式中僅有一次從尾端向前的單次遍歷，因此時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了一個固定大小為101的布林陣列，並未隨輸入規模變化，因此空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
