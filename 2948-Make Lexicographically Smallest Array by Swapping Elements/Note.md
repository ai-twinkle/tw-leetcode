# 2948. Make Lexicographically Smallest Array by Swapping Elements

You are given a 0-indexed array of positive integers `nums` and a positive integer `limit`.

In one operation, you can choose any two indices `i` and `j` and swap `nums[i]` and `nums[j]` 
if `|nums[i] - nums[j]| <= limit`.

Return the lexicographically smallest array that can be obtained by performing the operation any number of times.

An array `a` is lexicographically smaller than an array `b` 
if in the first position where `a` and `b` differ, 
array `a` has an element that is less than the corresponding element in `b`. 
For example, the array `[2,10,3]` is lexicographically smaller than the array `[10,2,3]` because 
they differ at index `0` and `2 < 10`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= limit <= 10^9`

## 基礎思路

最理想狀況是把陣列整體排序（由小到大），但因為每次交換都受限於 `limit`，只能交換差值不超過 `limit` 的元素。
因此，我們的做法是**將所有可以互換的元素分組**，對每一組內進行排序，最後將排序後的值寫回對應位置。

此題在數據量很大時容易 TLE（Time Limit Exceeded），因此**如何有效分組並排序組內元素**成為關鍵。
使用「數值排序後的索引表」是高效解決這類分組問題的技巧。

## 解題步驟

### Step 1: 紀錄長度 n

```typescript
const n: number = nums.length;
```

### Step 2: 將 nums 進行索引排序

```typescript
const sortedIndices: number[] = Array.from({ length: n }, (_, index) => index);
sortedIndices.sort((a, b) => nums[a] - nums[b]);
```
這是透過 `sortedIndices` 來紀錄以數值排序後的原始陣列索引。

### Step 3: 依照 limit 進行分組

### Step 3.1 找到分組結束索引

終止條件式我們已經移動到最後一個索引。

```typescript
let groupStart: number = 0;
while (groupStart < n) {
  // 初始化分組結束索引
  let groupEnd: number = groupStart + 1;
  
  // 找到分組結束索引
  // 這需要滿足不超出陣列範圍 `n` 且差值不超過 limit
  // 我們從較小的數字開始，利用索引表持續找尋直到不符合條件，代表該分組結束，此時 groupEnd 即為分組結束索引
  while (groupEnd < n && nums[sortedIndices[groupEnd]] - nums[sortedIndices[groupEnd - 1]] <= limit) {
    groupEnd++;
  }
  
  // ...
}
```

### Step 3.2 對分組進行排序

```typescript
// Process each group of indices with values within the "limit" difference
let groupStart: number = 0;
while (groupStart < n) {
  // 3.1 找到分組結束索引

  // 我們取得分組的索引
  const groupIndices: number[] = sortedIndices
    .slice(groupStart, groupEnd)
    .sort((a, b) => a - b);

  // 我們僅對分組進行排序
  const sortedValues: number[] = groupIndices
    .map(index => nums[index])
    .sort((a, b) => a - b);
  
  // ...
}
```

### Step 3.3 將排序後的值寫回原始陣列

```typescript
// Process each group of indices with values within the "limit" difference
let groupStart: number = 0;
while (groupStart < n) {
  // 3.1 找到分組結束索引

  // 3.2 對分組進行排序
  
  // 將排序後的值寫到結果陣列
  for (let i = 0; i < groupIndices.length; i++) {
    result[groupIndices[i]] = sortedValues[i];
  }

  // 我們移動到下一個分組起始索引，繼續檢查其他的分組
  groupStart = groupEnd;
}
```

## 時間複雜度

- 排序索引的操作耗費 $O(n \log n)$
- 分組和結果更新共耗費 $O(n)$
- 分組內排序耗費 $O(n \log n)$
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 額外空間包含排序操作的臨時數據 ($O(n)$)
- 結果陣列 ($O(n)$)
- 分組索引與值的臨時存儲 ($O(n)$)
- 總空間複雜度為 $O(n)$。

> $O(n)$
