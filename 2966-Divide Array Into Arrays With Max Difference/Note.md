# 2966. Divide Array Into Arrays With Max Difference

You are given an integer array `nums` of size `n` where `n` is a multiple of 3 and a positive integer `k`.

Divide the array `nums` into `n / 3` arrays of size 3 satisfying the following condition:

- The difference between any two elements in one array is less than or equal to `k`.

Return a 2D array containing the arrays. If it is impossible to satisfy the conditions, return an empty array. 
And if there are multiple answers, return any of them.

**Constraints:**

- `n == nums.length`
- `1 <= n <= 10^5`
- `n` is a multiple of 3
- `1 <= nums[i] <= 10^5`
- `1 <= k <= 10^5`

## 基礎思路

本題的核心在於如何將給定的數字陣列精確地分割成數個包含 3 個數字的小組，並滿足每一組內最大值與最小值之間的差距不超過指定的數值 `k`。要解決這個問題，必須先觀察以下兩個重要特性：

1. **排序的必要性**：
   因為要求每一組內數字差距最小，因此將整個數列排序後，再從最小值開始分組，能確保差距最小化。

2. **貪婪策略的適用性**：
   排序後，直接從最小的數字開始，依序每 3 個數字作為一組，即為最佳策略。如果任一組無法滿足題目限制（組內最大值與最小值之差大於 `k`），即代表題目無法解決。

基於以上特性，我們可以透過以下步驟來實現解題：

- 先透過計數排序（Counting Sort）的方式，有效地將數字由小到大排序。
- 排序後，以每次取連續的 3 個數字為一組的方式進行分組，並逐組檢查條件。
- 若任何一組不符條件，立即返回空陣列，否則返回最終結果。

## 解題步驟

### Step 1：檢查數量合法性

首先確認輸入陣列長度是否能夠被 $3$ 整除，若否則直接返回空陣列：

```typescript
const totalElements = nums.length;
if (totalElements % 3 !== 0) {
  return [];
}
```

### Step 2：單次遍歷找到最大值和最小值

為了快速排序，必須找出數值範圍的最大值和最小值：

```typescript
let minimumValue = nums[0];
let maximumValue = nums[0];

for (let i = 1; i < totalElements; i++) {
  const value = nums[i];
  if (value < minimumValue) {
    minimumValue = value;
  } else if (value > maximumValue) {
    maximumValue = value;
  }
}
```

### Step 3：建立並填充計數陣列（Counting Sort）

透過計數排序快速整理所有數值：

```typescript
const rangeSize = maximumValue - minimumValue + 1;
const countArray = new Uint32Array(rangeSize);

for (let i = 0; i < totalElements; i++) {
  countArray[nums[i] - minimumValue]++;
}
```

### Step 4：準備結果的儲存空間

預先建立足夠空間來儲存分組的結果：

```typescript
const numberOfGroups = totalElements / 3;
const resultGroups: number[][] = new Array(numberOfGroups);
```

### Step 5：貪婪地逐組取值並檢驗條件

利用游標循序從計數陣列中取得每組的數值：

```typescript
let cursorOffset = 0;  // 指向 countArray 的索引位置

for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
  // 第一個數字
  while (cursorOffset < rangeSize && countArray[cursorOffset] === 0) {
    cursorOffset++;
  }
  if (cursorOffset === rangeSize) {
    return [];  // 沒有數值可用
  }
  const firstValue = cursorOffset + minimumValue;
  countArray[cursorOffset]--;

  // 第二個數字
  while (cursorOffset < rangeSize && countArray[cursorOffset] === 0) {
    cursorOffset++;
  }
  if (cursorOffset === rangeSize) {
    return [];
  }
  const secondValue = cursorOffset + minimumValue;
  countArray[cursorOffset]--;

  // 第三個數字
  while (cursorOffset < rangeSize && countArray[cursorOffset] === 0) {
    cursorOffset++;
  }
  if (cursorOffset === rangeSize) {
    return [];
  }
  const thirdValue = cursorOffset + minimumValue;
  countArray[cursorOffset]--;

  // 驗證組內最大值與最小值差距是否小於等於 k
  if (thirdValue - firstValue > k) {
    return [];
  }

  // 將符合條件的三元組放入結果陣列
  resultGroups[groupIndex] = [firstValue, secondValue, thirdValue];
}
```

### Step 6：返回最終分組結果

成功通過所有條件檢查後，返回所有分組結果：

```typescript
return resultGroups;
```

## 時間複雜度

- 一次遍歷找到最大與最小值：$O(n)$
- 填充計數排序的陣列：$O(n)$
- 貪婪組合的掃描取值：$O(n + R)$（其中 $R = \max(nums) - \min(nums) + 1$）
- 總時間複雜度為 $O(n + R)$。

> $O(n + R)$

## 空間複雜度

- 計數陣列需要額外空間 $O(R)$
- 其他輔助空間為常數 $O(1)$
- 總空間複雜度為 $O(R)$。

> $O(R)$
