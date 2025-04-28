# 2302. Count Subarrays With Score Less Than K

The score of an array is defined as the product of its sum and its length.

- For example, the score of `[1, 2, 3, 4, 5]` is `(1 + 2 + 3 + 4 + 5) * 5 = 75`.

Given a positive integer array `nums` and an integer `k`, 
return the number of non-empty subarrays of `nums` whose score is strictly less than `k`.

A subarray is a contiguous sequence of elements within an array.

## 基礎思路

題目要求計算陣列中所有子陣列的「分數」小於指定數值 `k` 的數量，其中子陣列的分數定義為其元素總和乘以子陣列的長度：

$$
\text{score} = (\text{子陣列元素總和}) \times (\text{子陣列長度})
$$

由於陣列內所有元素皆為正整數，因此可以採用滑動窗口（雙指標）的方式，有效地在單次遍歷內找出所有符合條件的子陣列。具體步驟如下：

- 使用兩個指標 (`leftPointer` 和 `rightPointer`) 建立窗口範圍，並計算窗口內元素總和。
- 當前窗口的分數若小於 `k`，表示從窗口起點到終點的所有子陣列均有效，可一次計算並累加至答案。
- 若當前窗口的分數大於等於 `k`，則需縮小窗口範圍，透過左指標右移降低窗口分數。

透過上述方式，可以高效地在單一循環內完成問題求解。

## 解題步驟

### Step 1：初始化與資料結構

首先，我們需要建立必要的變數以便操作滑動窗口，包括窗口左右邊界指標、窗口元素總和，以及記錄符合條件子陣列的計數器：

```typescript
const n = nums.length;

// 滑動窗口範圍為 nums[leftPointer..rightPointer]
let leftPointer = 0;
let rightPointer = 0;

// 目前窗口內元素的總和
let windowSum = nums[0];

// 符合條件的子陣列數量
let totalSubarrays = 0;
```

### Step 2：滑動窗口動態調整範圍

透過 `rightPointer` 不斷向右擴展窗口，並根據當前窗口的分數動態決定是否需要調整窗口大小：

- **計算當前窗口長度與分數**
- **分數若小於 `k`，則計算以右指標結尾的有效子陣列數量並右移窗口**
- **分數若大於等於 `k`，則透過左指標右移縮小窗口**


```typescript
while (rightPointer < n) {
  // 計算當前窗口長度與分數
  const windowLength = rightPointer - leftPointer + 1;
  const windowScore = windowLength * windowSum;

  if (windowScore < k) {
    // 從 leftPointer 到 rightPointer 的所有子陣列皆符合條件
    totalSubarrays += windowLength;

    // 向右擴展窗口
    rightPointer++;
    windowSum += nums[rightPointer];
  } else {
    // 從左側縮小窗口
    windowSum -= nums[leftPointer];
    leftPointer++;
  }
}
```

### Step 3：返回最終結果

最終答案即為滑動窗口遍歷後得到的子陣列總數量：

```typescript
return totalSubarrays;
```

## 時間複雜度

- **滑動窗口**：左右指標各最多移動 $n$ 次，每次操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **額外使用的變數**：僅需要固定的幾個指標及數值變數，不需額外陣列空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
