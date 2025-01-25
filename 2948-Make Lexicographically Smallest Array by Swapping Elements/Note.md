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

## 基礎思路
我們可以觀測到，最理想情況是由小排到大。
但是因為有 limit 的限制，能被交換不得超過 limit。
那麼我們將 nums 可進行交換的分組，對每個分組進行排序，最後再寫回該分組位置。

> Tips
> 這題也是非常容易炸掉 Time Limit 的題目，所以我們需要找到一個最佳解法。
> 一個有效解決這種分組組內排序的方法是使用 "已排序的索引" 來進行排序。

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

```typescript
let groupStart: number = 0;
while (groupStart < n) {

}
```
終止條件式我們已經移動到最後一個索引。

### Step 3.1 找到分組結束索引

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
