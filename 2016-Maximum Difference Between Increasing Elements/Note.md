# 2016. Maximum Difference Between Increasing Elements

Given a 0-indexed integer array `nums` of size `n`, 
find the maximum difference between `nums[i]` and `nums[j]` (i.e., `nums[j] - nums[i]`), 
such that `0 <= i < j < n` and `nums[i] < nums[j]`.

Return the maximum difference. 
If no such `i` and `j` exists, return `-1`.

**Constraints:**

- `n == nums.length`
- `2 <= n <= 1000`
- `1 <= nums[i] <= 10^9`

## 基礎思路

本題的核心目標是透過單次陣列掃描找出符合條件（索引滿足 $0 \le i < j < n$ 且值滿足 $nums[i] < nums[j]$）的最大差值。

我們直觀的想法是在每個位置找尋「至目前為止」的最小數字。

- 當掃描到位置 $j$ 時，若 $nums[j]$ 大於「至目前為止的最小數字」，便能更新最大差值。
- 若掃描過程中，未發現可更新的情形，則回傳 `-1`。

## 解題步驟

### Step 1：初始化變數並處理邊界條件

首先，處理特殊情形（陣列長度小於 2）：

```typescript
const lengthOfNums = nums.length;
if (lengthOfNums < 2) {
  return -1;
}

let minimumSoFar = nums[0];       // 目前發現的最小值
let maximumDifferenceFound = -1;  // 目前找到的最大差值
```

### Step 2：單次遍歷陣列找出最大差值

從第二個元素開始遍歷陣列，對每個位置進行檢查：

```typescript
for (let currentIndex = 1; currentIndex < lengthOfNums; currentIndex++) {
  const currentValue = nums[currentIndex];

  if (currentValue > minimumSoFar) {
    // 僅考慮比目前最小值嚴格更大的情況
    const potentialDifference = currentValue - minimumSoFar;
    if (potentialDifference > maximumDifferenceFound) {
      maximumDifferenceFound = potentialDifference;
    }
  } else if (currentValue < minimumSoFar) {
    // 更新目前的最小值
    minimumSoFar = currentValue;
  }
}
```

### Step 3：回傳最終結果

結束遍歷後，回傳得到的最大差值：

```typescript
return maximumDifferenceFound;
```

## 時間複雜度

- 單次遍歷，對每個元素進行常數時間判斷。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的輔助變數，沒有使用額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
