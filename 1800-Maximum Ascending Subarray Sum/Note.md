# 1800. Maximum Ascending Subarray Sum

Given an array of positive integers `nums`, return the maximum possible sum of an ascending subarray in `nums`.

A subarray is defined as a contiguous sequence of numbers in an array.

A subarray $[\text{nums}_{l}, \text{nums}_{l+1}, ..., \text{nums}_{r-1}, \text{nums}_{r}]$ is ascending if for all `i` 
where $l <= i < r, \text{nums}_i < \text{nums}_{i+1}$. 
Note that a subarray of size `1` is ascending.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題要求我們 **找出陣列中連續遞增子陣列的最大和**。

仔細觀察題目後，我們發現只要能正確 **維護每一段連續遞增的子陣列和**，就能有效解決這個問題。

核心分析如下：

- 每遇到一個新元素，就檢查它是否比前一個元素大：
    - **若是**，則說明遞增區間持續，把它加進目前的累積和。
    - **若否**，代表前一個遞增區間已結束，需重新以當前元素開始新的區間。

- 每處理一個元素時，都需要比較目前區間和與歷史最大值，隨時記錄最大和。

這種 **一次線性掃描（滑動視窗）** 就能即時獲得最終答案，不需窮舉所有子陣列。

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
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 僅使用了常數個變量，故空間複雜度為 $O(1)$
- 總空間複雜度為 $O(1)$

> $O(1)$
