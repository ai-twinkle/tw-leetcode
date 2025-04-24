# 2799. Count Complete Subarrays in an Array

You are given an array `nums` consisting of positive integers.

We call a subarray of an array complete if the following condition is satisfied:

The number of distinct elements in the subarray is equal to the number of distinct elements in the whole array.
Return the number of complete subarrays.

A subarray is a contiguous non-empty part of an array.

## 基礎思路

題目要求找出所有「完整子陣列」的數量，其中「完整子陣列」的定義為：

> 子陣列中不同元素的數量，與原陣列中不同元素的數量相同。

為了解決這個問題，我們可以利用**滑動窗口（Sliding Window）**的策略：

1. 首先計算整個陣列中「不同元素」的總數。
2. 接著，透過維護一個滑動窗口，逐漸擴展窗口右端，並記錄窗口內的元素頻率。
3. 當窗口包含所有不同元素時，透過移動窗口左端縮小範圍，計算並累積符合條件的子陣列數量。

我們將使用固定大小的陣列作為頻率紀錄，因為題目限制數字範圍為 $1 \leq nums[i] \leq 2000$，能高效管理頻率。

## 解題步驟

### Step 1：初始化資料結構

首先建立兩個頻率陣列：

- `frequency`：記錄目前滑動窗口內每個數字的出現次數。
- `seenGlobal`：記錄整個陣列中每個數字是否出現過。

兩個陣列的大小均為 `2001`，因為數值範圍為 $1 \leq nums[i] \leq 2000$：

```typescript
const MAX_VALUE = 2000;
const frequency = new Uint16Array(MAX_VALUE + 1);
const seenGlobal = new Uint8Array(MAX_VALUE + 1);
```

### Step 2：計算整個陣列的不同元素數量

接著，我們遍歷整個陣列，計算不同元素的總數量 `totalDistinct`：

```typescript
let totalDistinct = 0;
for (const value of nums) {
  if (seenGlobal[value] === 0) {
    seenGlobal[value] = 1;
    totalDistinct++;
  }
}
```

### Step 3：透過滑動窗口找出完整子陣列

接下來，我們開始使用滑動窗口策略。初始化兩個指標：

- `leftIndex`：窗口左端起始位置。
- `distinctInWindow`：窗口內目前不同元素的數量。
- `resultCount`：累計完整子陣列的總數量。
- `n`：原始陣列的長度。

```typescript
let leftIndex = 0;
let distinctInWindow = 0;
let resultCount = 0;
const n = nums.length;
```

接著，逐步擴展右端指標（`rightIndex`）：

```typescript
for (let rightIndex = 0; rightIndex < n; rightIndex++) {
  const v = nums[rightIndex];

  // 若窗口第一次包含這個數字，則不同元素數量增加
  if (frequency[v] === 0) {
    distinctInWindow++;
  }
  frequency[v]++;

  // 當窗口內包含所有不同元素時，進行窗口收縮
  while (distinctInWindow === totalDistinct) {
    // 此時，[leftIndex..rightIndex]、[leftIndex..rightIndex+1]、... [leftIndex..n-1] 都是完整子陣列
    resultCount += (n - rightIndex);

    // 縮小窗口左側，並調整頻率與不同元素數量
    const leftValue = nums[leftIndex];
    frequency[leftValue]--;

    if (frequency[leftValue] === 0) {
      distinctInWindow--;
    }
    leftIndex++;
  }
}
```

### Step 4：返回最終結果

當所有可能的窗口皆檢查完畢後，回傳 `resultCount` 作為答案：

```typescript
return resultCount;
```

## 時間複雜度

本題的主要運算分為以下幾部分：

- 計算全局不同元素數量：遍歷整個陣列一次，複雜度為 $O(n)$。
- 滑動窗口：`rightIndex` 與 `leftIndex` 皆最多移動 $n$ 次，複雜度為 $O(n + n) = O(n)$。
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

本題的額外空間用於：

- 頻率陣列 (`frequency`) 與全局出現陣列 (`seenGlobal`)：固定大小 2001，為 $O(1)$。
- 其他變數僅需常數空間。
- 總空間複雜度為 $O(1)$

> $O(1)$
