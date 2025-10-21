# 3346. Maximum Frequency of an Element After Performing Operations I

You are given an integer array `nums` and two integers `k` and `numOperations`.

You must perform an operation `numOperations` times on `nums`, where in each operation you:

- Select an index `i` that was not selected in any previous operations.
- Add an integer in the range `[-k, k]` to `nums[i]`. 

Return the maximum possible frequency of any element in `nums` after performing the operations.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^5`
- `0 <= k <= 10^5`
- `0 <= numOperations <= nums.length`

## 基礎思路

本題在一個整數陣列上，最多對 `numOperations` 個**不同索引**分別加上一個介於 `[-k, k]` 的整數，目標是讓陣列中**某個值的出現次數（頻率）最大化**，並回傳該最大頻率。

思考時的關鍵點：

- **一次操作只能動一個索引且不得重複**：可視為我們最多能選出 `numOperations` 個元素，並把它們各自向上或向下「拉近」某個目標值。
- **每個元素的可達區間是閉區間**：原值 `x` 能被調整到任一 `x' ∈ [x-k, x+k]`。
- **目標值可以是兩類**：
    1. **現有值**：若想把更多元素變成某個已存在於陣列的值 `v`，則能加入的元素必須落在 `v` 的可達範圍，即原值 `x` 滿足 `|x - v| ≤ k`；
    2. **任意值**：若目標不必等於現有值，只要某一段連續區間內的元素值的**最大值與最小值之差 ≤ 2k**，就能把它們一併拉到同一個數（每個各自調整 ≤ k）。
- **操作次數限制**：即使一個目標值的可納元素很多，真正能調整的上限仍是 `numOperations`；已有等於目標值者不需花費操作次數。

基於以上觀察，我們可採用二段式策略：

- **策略 A（鎖定現有值）**：對每個不同的現值 `v`，考慮所有距離 `v` 不超過 `k` 的元素，它們中本來就等於 `v` 的免費加入，其餘可用操作數量上限為 `numOperations`。取能達到的最大頻率。
- **策略 B（任意目標值）**：以滑動視窗找出最長子陣列，滿足區間內最大值與最小值之差 ≤ `2k`。此區間中的元素都能被各自調整到同一數，但全部都需要調整，因此能貢獻的頻率最多為 `min(視窗大小, numOperations)`。

最後取兩種策略的較大值即為答案。

## 解題步驟

### Step 1：基本防護、排序、長度記錄與「無操作」早退

說明：先處理空陣列防護（雖然題目保證不會），接著用 TypedArray 排序（提高在 JS/TS 的排序與記憶體區域性效率），若 `numOperations === 0`，只需回傳排序後最長的相等連續段長度。

```typescript
// 防護：即使題目保證非空，仍保持安全
if (nums.length === 0) {
  return 0;
}

// 使用 TypedArray 進行穩定數值排序與較佳區域性
const sorted = Int32Array.from(nums);
sorted.sort();

const length = sorted.length;

// 早退：若沒有可用操作，回傳最長的相同值連續段長度
if (numOperations === 0) {
  let bestFrequency = 1;
  let currentRun = 1;

  for (let index = 1; index < length; index++) {
    if (sorted[index] === sorted[index - 1]) {
      currentRun += 1;
    } else {
      if (currentRun > bestFrequency) {
        bestFrequency = currentRun;
      }
      currentRun = 1;
    }
  }

  if (currentRun > bestFrequency) {
    bestFrequency = currentRun;
  }

  return bestFrequency;
}
```

### Step 2：策略 A 初始化（鎖定現有值為目標）

說明：準備一次「分組掃描」所有相同值的區段，並用雙指標維護「與當前值相差不超過 `k` 的元素視窗」。

```typescript
/**
 * Part A: 以現有值 v 作為目標
 */
let bestUsingExistingTarget = 1;

// 雙指標定義半開區間 [leftIndex, rightIndex)
let leftIndex = 0;
let rightIndex = 0;
```

### Step 3：策略 A 主迴圈（分組 + 雙指標視窗）

說明：對每個不同值 `value` 的連續段，找出所有滿足 `|x - value| ≤ k` 的元素數量（雙指標維護），已等於 `value` 的元素免費加入，其餘至多使用 `numOperations` 次調整，更新最佳答案。

```typescript
for (let groupStart = 0; groupStart < length; ) {
  const value = sorted[groupStart];

  // 尋找此相同值區段的結尾（包含）
  let groupEnd = groupStart;
  while (groupEnd + 1 < length && sorted[groupEnd + 1] === value) {
    groupEnd += 1;
  }

  const runLength = groupEnd - groupStart + 1;

  // 收緊左界，使 sorted[leftIndex] >= value - k
  const lowerBound = value - k;
  while (leftIndex < length && sorted[leftIndex] < lowerBound) {
    leftIndex += 1;
  }

  // 擴張右界，使 sorted[rightIndex - 1] <= value + k
  const upperBound = value + k;
  while (rightIndex < length && sorted[rightIndex] <= upperBound) {
    rightIndex += 1;
  }

  // 視窗 [leftIndex, rightIndex) 內皆滿足 |x - value| ≤ k
  const windowCount = rightIndex - leftIndex;

  // 非 value 的需花操作數；可用的上限為 numOperations
  const convertible = windowCount - runLength;
  const usable = convertible < numOperations ? convertible : numOperations;

  const candidate = runLength + (usable > 0 ? usable : 0);
  if (candidate > bestUsingExistingTarget) {
    bestUsingExistingTarget = candidate;
  }

  // 前進到下一個不同值的區段
  groupStart = groupEnd + 1;
}
```

### Step 4：策略 B（任意目標值）：找最大 `max - min ≤ 2k` 的視窗

說明：若目標值不限於現有值，則同一視窗內只要最大值與最小值差不超過 `2k`，即可把視窗內所有元素各自調整到同一個數；但這些元素都需要花費操作，因此能實現的頻率受 `numOperations` 限制。

```typescript
/**
 * Part B: 目標可以是任意整數（不一定在原陣列）
 * -> 尋找最大視窗，使得 max - min ≤ 2k
 */
let bestWindowSize = 1;
let windowLeft = 0;

const spreadLimit = k * 2;

for (let windowRight = 0; windowRight < length; windowRight++) {
  // 當視窗內差值超過 2k，從左側收縮
  while (sorted[windowRight] - sorted[windowLeft] > spreadLimit) {
    windowLeft += 1;
  }

  const windowSize = windowRight - windowLeft + 1;
  if (windowSize > bestWindowSize) {
    bestWindowSize = windowSize;
  }
}
```

### Step 5：策略 B 計算可達頻率、彙整兩策略並回傳答案

說明：若目標非現值，視窗內的元素都必須被調整，因此可達頻率為 `min(bestWindowSize, numOperations)`；最後取策略 A 與策略 B 的較大者回傳。

```typescript
// 若目標不是現有值，視窗內每個貢獻者都需消耗一次操作
const bestUsingArbitraryTarget =
  numOperations < bestWindowSize ? numOperations : bestWindowSize;

// 最終答案：取兩種策略的最大值
return bestUsingExistingTarget > bestUsingArbitraryTarget
  ? bestUsingExistingTarget
  : bestUsingArbitraryTarget;
```

## 時間複雜度

- 排序耗時為 `O(n log n)`，其中 `n = nums.length`。
- 之後所有雙指標與分組掃描皆為 `O(n)`。
- 總時間複雜度為 `O(n log n)`。

> $O(n \log n)$

## 空間複雜度

- 額外建立一份排序用的 `Int32Array`，需要 `O(n)` 空間；其餘僅用到少量變數。
- 總空間複雜度為 `O(n)`。

> $O(n)$
