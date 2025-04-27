# 3392. Count Subarrays of Length Three With a Condition

Given an integer array `nums`, return the number of subarrays of length 3 such that 
the sum of the first and third numbers equals exactly half of the second number.

## 基礎思路

題目要求計算所有長度為 3 的子陣列 `[a, b, c]` 中，滿足以下條件的子陣列數量：

$$
a + c = \frac{b}{2}
$$

由於子陣列長度固定為 3，因此可以直接透過單次遍歷，對每個可能的中心位置進行檢查，即可快速求解。

## 解題步驟

### Step 1：初始化變數

首先，取得陣列的長度 `lengthOfNums`，並設定計數器 `validSubarrayCount` 為 0，用來記錄符合條件的子陣列數量。

```typescript
const lengthOfNums = nums.length;
let validSubarrayCount = 0;
```

### Step 2：遍歷陣列，檢查子陣列條件

從陣列索引為 `1` 的位置開始，直到倒數第二個元素，逐一檢查長度為 3 的子陣列：

- 當索引為 `centerIndex` 時，前一個元素為 `nums[centerIndex - 1]`，後一個元素為 `nums[centerIndex + 1]`。
- 檢查條件是否成立：

$$
nums[centerIndex - 1] + nums[centerIndex + 1] = \frac{nums[centerIndex]}{2}
$$

若成立，則 `validSubarrayCount` 加一。

```typescript
// iterate so that [centerIndex-1, centerIndex, centerIndex+1] are always valid indices
for (let centerIndex = 1; centerIndex < lengthOfNums - 1; ++centerIndex) {
  if (nums[centerIndex - 1] + nums[centerIndex + 1] === nums[centerIndex] / 2) {
    validSubarrayCount++;
  }
}
```

### Step 3：返回結果

遍歷完成後，返回最終累積的結果。

```typescript
return validSubarrayCount;
```

## 時間複雜度

- 一次線性遍歷，共進行約 $n - 2$ 次常數時間的檢查，總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數數量的額外變數，未使用額外的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
