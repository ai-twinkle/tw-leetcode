# 2401. Longest Nice Subarray

You are given an array `nums` consisting of positive integers.

We call a subarray of `nums` nice if the bitwise AND of every pair of elements 
that are in different positions in the subarray is equal to `0`.

Return the length of the longest nice subarray.

A subarray is a contiguous part of an array.

Note that subarrays of length `1` are always considered nice.

## 基礎思路

一個比較直觀的方式是比對兩兩元素的 `AND` 運算結果，但是這會需要 $O(n^2)$ 的時間複雜度。

我們觀察發現如果發現 conflict 的情況，可以直接跳過剩餘的元素，因為題目要求的是最長的 subarray。

最後，我們逐步更新最長的 subarray 長度，就可以得到答案。

## 解題步驟

### Step 1: 檢查特殊情況

雖然題目保證 `nums` 至少有一個元素，但是為了程式碼的完整性，我們還是需要檢查一下。

```typescript
if (nums.length === 0) {
  return 0;
}
```

### Step 2: 比對兩兩元素的 `AND` 運算結果

我們使用兩個迴圈，第一個迴圈從 `0` 到 `nums.length - 1`，第二個迴圈從 `i + 1` 到 `nums.length - 1`。
當我們找到衝突的情況時，我們就可以跳過剩餘的元素。

```typescript
let max = 1;

for (let i = 0; i < nums.length; i++) {
  let count = 1;
  let currentBitmask = nums[i];

  for (let j = i + 1; j < nums.length; j++) {
    if ((currentBitmask & nums[j]) === 0) {
      // 如果沒有衝突，則更新 count 和 currentBitmask
      count++;
      currentBitmask |= nums[j];
    } else {
      // 如果有衝突，則跳過剩餘的元素
      break;
    }
  }
  max = Math.max(max, count);
}
```

## 時間複雜度

- 比對兩兩元素的 `AND` 運算結果的時間複雜度為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 我們只使用了常數個變數，因此空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
