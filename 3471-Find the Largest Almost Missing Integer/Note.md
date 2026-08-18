# 3471. Find the Largest Almost Missing Integer

You are given an integer array `nums` and an integer `k`.

An integer `x` is almost missing from `nums` if `x` appears in exactly one subarray of size `k` within `nums`.

Return the largest almost missing integer from `nums`. 
If no such integer exists, return `-1`.

A subarray is a contiguous sequence of elements within an array.

**Constraints:**

- `1 <= nums.length <= 50`
- `0 <= nums[i] <= 50`
- `1 <= k <= nums.length`

## 基礎思路

本題要求找出「幾乎缺失」的最大整數：一個值必須**恰好只出現在一個長度為 k 的子陣列中**。直觀上似乎需要枚舉所有視窗並統計每個值被多少視窗涵蓋，但只要分析位置與視窗的覆蓋關係，就能將問題大幅簡化。

在思考解法時，可掌握以下核心觀察：

- **覆蓋次數只取決於位置**：
  某個位置被多少個長度固定的視窗涵蓋，完全由它距離兩端的遠近決定；越靠近陣列中央的位置，被涵蓋的視窗數越多。

- **只有頭尾位置可能僅被單一視窗涵蓋**：
  當視窗長度嚴格大於 1 且小於整體長度時，唯有最前與最後的位置只落在一個視窗內，其餘位置至少落入兩個視窗，因此答案只可能來自首、尾兩個值。

- **同值重複出現會破壞唯一性**：
  即使某個值位於邊界，只要它在陣列其他地方也出現過，它就會被額外的視窗涵蓋，因而不再符合條件。

- **兩個極端情形需單獨處理**：
  視窗長度等於整體長度時，全陣列只有唯一一個視窗，所有出現過的值都符合條件，取最大值即可；視窗長度為 1 時，每個位置自成一個視窗，符合條件等價於該值在陣列中恰好出現一次。

- **值域極小可用固定表取代雜湊**：
  題目限制數值上限很小，故可用固定大小的計數表統計出現次數，並由大而小掃描以直接取得最大解。

依據以上特性，可以採用以下策略：

- **先分流兩個極端情形**，各自以最直接的方式求解。
- **一般情形只檢查首尾兩個候選值**，統計它們在整個陣列中的出現次數。
- **僅當候選值全陣列唯一時才視為合法答案**，最後在合法候選中取較大者，若皆不合法則回傳 -1。

此策略避免了枚舉所有視窗的成本，只需常數次線性掃描即可得解。

## 解題步驟

### Step 1：處理視窗長度等於陣列長度的特例

當視窗長度與陣列長度相同時，整個陣列只構成唯一一個視窗，任何出現過的值都恰好被這個視窗涵蓋，因此直接線性掃描取最大值回傳即可。

```typescript
const length = nums.length;

// 恰好只存在一個視窗，因此所有出現過的值都被這個唯一視窗涵蓋。
if (k === length) {
  let maximum = nums[0];
  for (let index = 1; index < length; index++) {
    if (nums[index] > maximum) {
      maximum = nums[index];
    }
  }
  return maximum;
}
```

### Step 2：處理視窗長度為 1 的特例

當視窗長度為 1 時，每個位置各自形成一個視窗，因此一個值符合條件等價於它在陣列中恰好出現一次。我們利用值域上限固定的特性，以固定大小的位元組表統計出現次數，再由大而小掃描，遇到的第一個唯一值即為最大解；若無任何唯一值則回傳 -1。

```typescript
// 視窗長度為 1：每個位置自成一個視窗，故值符合條件等價於它只出現一次。
if (k === 1) {
  // 數值上限為 50，因此以固定大小的位元組表取代任何雜湊結構。
  const occurrences = new Uint8Array(51);
  for (let index = 0; index < length; index++) {
    occurrences[nums[index]]++;
  }
  // 由大而小掃描數值，遇到第一個唯一值即停止。
  for (let value = 50; value >= 0; value--) {
    if (occurrences[value] === 1) {
      return value;
    }
  }
  return -1;
}
```

### Step 3：一般情形下鎖定首尾候選並統計其出現次數

當視窗長度嚴格介於 1 與陣列長度之間時，只有最前與最後的位置僅屬於單一視窗，故候選答案只可能是首、尾兩個值。我們以一次線性掃描，同時統計這兩個值在整個陣列中出現的總次數。

```typescript
// 當 1 < k < length 時，只有頭尾兩個位置僅屬於單一視窗，
// 因此唯一可能的答案就是第一個與最後一個元素。
const firstValue = nums[0];
const lastValue = nums[length - 1];
let firstCount = 0;
let lastCount = 0;
for (let index = 0; index < length; index++) {
  const current = nums[index];
  if (current === firstValue) {
    firstCount++;
  }
  if (current === lastValue) {
    lastCount++;
  }
}
```

### Step 4：依唯一性篩選候選並回傳最大合法答案

邊界值唯有在整個陣列中不再重複出現時才算合法。我們先以首值嘗試更新答案，再以尾值在更大時覆蓋之；若兩者皆不合法，答案維持初始的 -1。

```typescript
// 邊界值唯有在陣列其他位置都不再出現時才合法。
let answer = -1;
if (firstCount === 1) {
  answer = firstValue;
}
if (lastCount === 1 && lastValue > answer) {
  answer = lastValue;
}
return answer;
```

## 時間複雜度

- 三種情形皆只需常數次對陣列的線性掃描，為 $O(n)$；
- 視窗長度為 1 時額外掃描固定大小的計數表，為常數時間；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數；
- 計數表大小由值域上限決定，屬固定常數空間；
- 總空間複雜度為 $O(1)$。

> $O(1)$
