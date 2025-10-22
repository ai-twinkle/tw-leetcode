# 3347. Maximum Frequency of an Element After Performing Operations II

You are given an integer array `nums` and two integers `k` and `numOperations`.

You must perform an operation `numOperations` times on `nums`, where in each operation you:

- Select an index `i` that was not selected in any previous operations.
- Add an integer in the range `[-k, k]` to `nums[i]`.

Return the maximum possible frequency of any element in `nums` after performing the operations.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `0 <= k <= 10^9`
- `0 <= numOperations <= nums.length`

## 基礎思路

本題要我們在一個整數陣列中進行最多 `numOperations` 次操作。每次操作可選擇一個**未被選過的索引** `i`，並將 `nums[i]` 加上一個介於 `[-k, k]` 的整數。最終需找出任意元素能達到的**最高出現頻率**。

在思考解法時，我們需要特別注意幾個要點：

- 每次操作只能對**不同索引**進行一次；
- 每個元素的值可在範圍 `[nums[i] - k, nums[i] + k]` 內自由調整；
- 若兩個數值區間有重疊，就可能被調整成相同的數；
- 我們希望透過最多 `numOperations` 次調整，讓某個數值的出現頻率最大化。

為了解決這個問題，可以採取以下策略：

1. **排序後分析鄰近關係**：因為相近的數值較容易透過調整重合，所以先排序以方便使用滑動視窗。
2. **滑動視窗找最大可重疊範圍**：找出在區間長度不超過 `2k` 的最大子集，代表這些元素可被調成同一值。
3. **考慮現有元素為目標值的情況**：對每個不同數值，計算多少數在 `[value - k, value + k]` 範圍內可被轉為該值。
4. **結合兩種情境**：
    - 一種是任意目標（可自由選目標值）；
    - 另一種是選用現有元素作為目標；
      最後取兩者的最大值作為答案。

## 解題步驟

### Step 1：處理空陣列的特例

若陣列為空，直接回傳 0。

```typescript
// 若陣列為空，無法形成頻率，直接回傳 0
if (nums.length === 0) {
  return 0;
}
```

### Step 2：初始化排序陣列

使用 `Int32Array` 儲存並排序，確保運算一致且利於滑動視窗。

```typescript
// 建立型別化陣列以提升數值處理效率，並排序（遞增）
const arr = Int32Array.from(nums);
arr.sort();

const n = arr.length;
```

### Step 3：Case A — 任意目標值（可自由調整成同一區間內）

使用滑動視窗找出最大範圍，使最大值與最小值差不超過 `2k`。
這代表所有這些數都可被調整至同一數值。

```typescript
// 使用滑動視窗找出最大範圍 (max - min ≤ 2k)
let leftPointer = 0;
let maxWithinRange = 1;

for (let rightPointer = 0; rightPointer < n; rightPointer++) {
  // 若視窗寬度超出 2k，向右收縮左指標
  while (arr[rightPointer] - arr[leftPointer] > 2 * k) {
    leftPointer += 1;
  }
  const windowSize = rightPointer - leftPointer + 1;
  if (windowSize > maxWithinRange) {
    maxWithinRange = windowSize; // 更新最大區間長度
  }
}

// 根據操作上限取最小值（不能超過 numOperations）
const bestArbitrary = Math.min(maxWithinRange, numOperations);
```

### Step 4：Case B — 以現有元素作為目標值

逐一考慮每個不同數值 `v`，找出所有可被轉為 `v` 的元素數量。
統計當前值的出現次數、在 `[v - k, v + k]` 範圍內的總元素數，並計算可能轉換數量。

```typescript
// 初始化最佳結果與雙指標
let bestExisting = 1;
let leftBound = 0;
let rightBound = -1;
let startIndex = 0;

// 逐一處理每個不同的數值群組
while (startIndex < n) {
  let endIndex = startIndex;
  const value = arr[startIndex];

  // 找出同值的群組範圍
  while (endIndex + 1 < n && arr[endIndex + 1] === value) {
    endIndex += 1;
  }

  // 定義可轉換範圍 [value - k, value + k]
  const minAllowed = value - k;
  const maxAllowed = value + k;

  // 向右移動 leftBound，確保 arr[leftBound] >= minAllowed
  while (leftBound < n && arr[leftBound] < minAllowed) {
    leftBound += 1;
  }

  // 擴展 rightBound，直到 arr[rightBound] > maxAllowed
  while (rightBound + 1 < n && arr[rightBound + 1] <= maxAllowed) {
    rightBound += 1;
  }

  // 當前值出現次數
  const countEqual = endIndex - startIndex + 1;

  // 在可轉換範圍內的總元素數
  const totalWithin = rightBound >= leftBound ? (rightBound - leftBound + 1) : 0;

  // 可被轉換成當前值的數量
  const convertible = totalWithin > countEqual ? (totalWithin - countEqual) : 0;

  // 計算選此值為目標時可達最大頻率
  const candidate = countEqual + Math.min(numOperations, convertible);
  if (candidate > bestExisting) {
    bestExisting = candidate; // 更新最佳結果
  }

  // 移動至下一組不同數值
  startIndex = endIndex + 1;
}
```

### Step 5：合併兩種情境並回傳最終結果

取兩種策略的最大值，且不得超過陣列長度。

```typescript
// 結合兩種策略結果，並確保不超過 n
const best = Math.max(bestExisting, bestArbitrary);
return best < n ? best : n;
```

## 時間複雜度

- 排序需 $O(n \log n)$；
- Case A 與 Case B 各使用滑動視窗掃描一次，皆為 $O(n)$；
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用一份排序陣列與少量指標變數；
- 其餘操作皆為原地運算，額外空間為常數級。
- 總空間複雜度為 $O(n)$（主要來自複製陣列）。

> $O(n)$
