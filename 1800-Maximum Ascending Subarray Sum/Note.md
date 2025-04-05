# 1800. Maximum Ascending Subarray Sum

Given an array of positive integers `nums`, return the maximum possible sum of an ascending subarray in `nums`.

A subarray is defined as a contiguous sequence of numbers in an array.

A subarray $[\text{nums}_{l}, \text{nums}_{l+1}, ..., \text{nums}_{r-1}, \text{nums}_{r}]$ is ascending if for all `i` 
where $l <= i < r, \text{nums}_i < \text{nums}_{i+1}$. 
Note that a subarray of size `1` is ascending.

## 基礎思路

我們數組當前位置 `i` 與前一個位置 `i-1` 比較:
- 如果當前位置 `i` 大於前一個位置 `i-1`，則將當前位置 `i` 加入到當前的子數組的和中
- 否則重置當前的子數組和為當前位置 `i` 的值

然後比較當前的子數組和與最大子數組和，取最大值

## 解題步驟

### Step 1: 初始化當前子數組和與最大子數組和

```typescript
let maxSum = nums[0];
let currentSum = nums[0];
```

### Step 2: 從第二個位置開始遍歷數組

```typescript
for (let i = 1; i < nums.length; i++) {
  if (nums[i] > nums[i - 1]) {
    // 若持續遞增，則將當前位置加入到當前子數組和中
    currentSum += nums[i];
  } else {
    // 否則重置當前子數組和為當前位置的值
    currentSum = nums[i];
  }
  
  // 比較當前子數組和與最大子數組和，取最大值
  if (currentSum > maxSum) {
    maxSum = currentSum;
  }
}
```

## 時間複雜度

- 需要訪問每個元素一次，故時間複雜度為 $O(n)$
- 總體時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 僅使用了常數個變量，故空間複雜度為 $O(1)$
- 總體空間複雜度為 $O(1)$

> $O(1)$
