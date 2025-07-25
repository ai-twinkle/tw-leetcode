# 3487. Maximum Unique Subarray Sum After Deletion

You are given an integer array `nums`.

You are allowed to delete any number of elements from `nums` without making it empty. 
After performing the deletions, select a subarray of `nums` such that:

1. All elements in the subarray are unique.
2. The sum of the elements in the subarray is maximized.

Return the maximum sum of such a subarray.

**Constraints:**

- `1 <= nums.length <= 100`
- `-100 <= nums[i] <= 100`

## 基礎思路

本題的核心思考點是：如何透過「任意刪除元素」的機制，最終選出一段「沒有重複元素」的子陣列，使得子陣列的數字總和能達到最大值。

要滿足題目要求，我們觀察有兩種可能的情況：

- 如果陣列中存在正數，那麼只要我們刪除所有重複的正數以及非正數元素，保留每種正數元素各一個，這樣選出的子陣列和便可達到最大值。
- 如果陣列中完全不存在正數（即所有元素皆為負數或0），則我們只能選取其中最大的那個數值（數值最接近零），才能獲得最大和。

根據上述兩種情況，可以規劃出明確的解題策略：

- 遍歷一次陣列：

    - 若元素為正數，且尚未計算過，則將它加入總和。
    - 同時追蹤整個陣列的最大元素（用於完全無正數的情況）。
- 最終回傳：

    - 若存在正數，返回所有唯一正數之和。
    - 若無正數，返回最大元素。

## 解題步驟

### Step 1：初始化所需輔助變數

我們首先準備以下三個輔助變數：

- `presenceArray`：大小固定為101的陣列，用來高效地標記哪些正整數已經被計算過（數值範圍為1\~100）。
- `positiveSum`：用於記錄所有唯一正數的總和。
- `maxElement`：用於追蹤整個陣列中的最大元素，以處理沒有正數的情況。

```typescript
// 使用 TypedArray 高效追蹤已計算的正整數。
// 索引 1～100 對應值 1～100。
const presenceArray = new Uint8Array(101);

// 儲存陣列中所有獨特正整數的總和。
let positiveSum = 0;

// 在原始陣列中追蹤最大元素，以處理所有元素皆非正數的情況。
let maxElement = nums[0];
```

### Step 2：逐步遍歷陣列並更新狀態

接著，我們對輸入陣列進行一次完整的遍歷：

- 若當前元素為正數，且未被計算過（透過`presenceArray`判斷），則將該元素值加入`positiveSum`，並標記為已計算。
- 無論元素為正負，都要持續更新`maxElement`，以確保我們記錄到陣列中的最大數值。

```typescript
// 遍歷輸入陣列中的每個數字。
for (let i = 0, n = nums.length; i < n; ++i) {
  const current = nums[i];

  // 若當前數字為正且尚未被計算，將其加入總和。
  if (current > 0) {
    if (presenceArray[current] === 0) {
      presenceArray[current] = 1;
      positiveSum += current;
    }
  }

  // 永遠更新目前為止的最大元素。
  if (current > maxElement) {
    maxElement = current;
  }
}
```

### Step 3：根據狀態回傳最終答案

遍歷結束後：

- 若我們的`positiveSum`大於零，代表陣列中存在至少一個正數，回傳`positiveSum`即為答案。
- 否則（代表無正數），回傳陣列中的最大數值`maxElement`。

```typescript
// 如果發現任何正數，返回其總和。否則，返回最大元素。
return positiveSum > 0 ? positiveSum : maxElement;
```

## 時間複雜度

- 僅需遍歷一次長度為 $n$ 的陣列，每次操作皆為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小的陣列（大小為101），不隨輸入規模變動而變化。
- 其他變數皆為常數數量，無額外動態配置空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
