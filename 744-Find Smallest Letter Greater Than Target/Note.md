# 744. Find Smallest Letter Greater Than Target

You are given an array of characters `letters` that is sorted in non-decreasing order, and a character `target`. 
There are at least two different characters in `letters`.

Return the smallest character in `letters` that is lexicographically greater than `target`. 
If such a character does not exist, return the first character in `letters`.

**Constraints:**

- `2 <= letters.length <= 10^4`
- `letters[i]` is a lowercase English letter.
- `letters` is sorted in non-decreasing order.
- `letters` contains at least two different characters.
- `target` is a lowercase English letter.

## 基礎思路

本題給定一個已排序（非遞減）的字元陣列 `letters` 與一個字元 `target`，要求回傳陣列中**字典序嚴格大於** `target` 的最小字元；若不存在，則需**環狀回到第一個字元**。

在思考解法時，我們需要注意幾個重點：

* **已排序性質**：`letters` 已按字典序排序，因此「第一個大於 target 的位置」具有單調性，可用二分搜尋快速定位。
* **嚴格大於**：要找的是 `>` 而不是 `>=`，因此比較條件要確保跳過所有 `<= target` 的元素。
* **環狀回繞（wrap-around）**：若 `target` 大於等於最後一個字元，則答案必定回到 `letters[0]`；同理，若 `target` 小於第一個字元，答案也直接是 `letters[0]`。
* **目標等價於 lower_bound**：本題可視為在排序陣列中找「第一個 > target」的索引，若索引落在界外則回傳首元素。

因此，我們可採用以下策略：

* **先做邊界快判**：利用首尾元素處理 wrap-around 的情況，避免多做二分。
* **二分搜尋第一個 > target 的索引**：維持一個半開區間 `[left, right)`，每次縮小區間，最後 `left` 即為答案位置。

## 解題步驟

### Step 1：初始化長度並處理 wrap-around 的快速判斷

先取得陣列長度。若 `target >= 最後元素` 或 `target < 第一元素`，依題意答案必為 `letters[0]`，可直接回傳。

```typescript
const lettersCount = letters.length;

// 快速環狀回繞：若 target >= 最後一個，或小於第一個，答案就是第一個
if (target >= letters[lettersCount - 1] || target < letters[0]) {
  return letters[0];
}
```

### Step 2：初始化二分搜尋區間

設定 `leftIndex` 與 `rightIndex`，並讓 `rightIndex` 為**不含**的上界（exclusive），方便寫標準 lower_bound 形式的二分。

```typescript
let leftIndex = 0;
let rightIndex = lettersCount; // 不含的上界
```

### Step 3：在最外層 while 迴圈中，計算中點並做比較分支

以二分搜尋找出「第一個 > target」的位置。
若 `letters[middleIndex] <= target`，代表答案必在右側；否則答案在左側（含 middle）。

```typescript
while (leftIndex < rightIndex) {
  const middleIndex = (leftIndex + rightIndex) >>> 1;

  if (letters[middleIndex] <= target) {
    leftIndex = middleIndex + 1;
  } else {
    rightIndex = middleIndex;
  }
}
```

### Step 4：二分結束後，處理落在界外的情況並回傳答案

二分結束時，`leftIndex` 即為第一個 `letters[leftIndex] > target` 的索引。
若剛好等於 `lettersCount`，代表不存在更大的字元，需回到 `letters[0]`；否則回傳 `letters[leftIndex]`。

```typescript
// leftIndex 是第一個滿足 letters[leftIndex] > target 的位置
if (leftIndex === lettersCount) {
  return letters[0];
}

return letters[leftIndex];
```

## 時間複雜度

- Step 1 的邊界判斷為常數時間。
- 二分搜尋在區間大小為 `lettersCount = n` 的情況下，每次迴圈將搜尋區間至少縮小一半。
- while 迴圈最多執行 `⌈log2(n)⌉` 次，每次迴圈內皆為常數操作。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 僅使用固定數量的變數（`lettersCount`, `leftIndex`, `rightIndex`, `middleIndex`），不依賴輸入大小成長。
- 總空間複雜度為 $O(1)$。

> $O(1)$
