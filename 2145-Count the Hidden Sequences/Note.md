# 2145. Count the Hidden Sequences

You are given a 0-indexed array of `n` integers `differences`, 
which describes the differences between each pair of consecutive integers of a hidden sequence of length `(n + 1)`. 
More formally, call the hidden sequence `hidden`, then we have that `differences[i] = hidden[i + 1] - hidden[i]`.

You are further given two integers `lower` and `upper` that describe the inclusive range of values `[lower, upper]` 
that the hidden sequence can contain.

- For example, given `differences = [1, -3, 4]`, `lower = 1`, `upper = 6`, 
  the hidden sequence is a sequence of length 4 whose elements are in between `1` and `6` (inclusive).
  - `[3, 4, 1, 5]` and `[4, 5, 2, 6]` are possible hidden sequences.
  - `[5, 6, 3, 7]` is not possible since it contains an element greater than `6`.
  - `[1, 2, 3, 4]` is not possible since the differences are not correct.

Return the number of possible hidden sequences there are. If there are no possible sequences, return `0`.

**Constraints:**

- `n == differences.length`
- `1 <= n <= 10^5`
- `-10^5 <= differences[i] <= 10^5`
- `-10^5 <= lower <= upper <= 10^5`

## 基礎思路

題目給定一個差分陣列 `differences`，代表某個隱藏數列中連續兩數之間的差值，並給出該隱藏數列所有元素的上下界 `[lower, upper]`。

我們要判斷：『符合給定差分的數列共有幾種可能的初始值（數列的第一個數字）？』。一旦數列的第一個數字確定，其餘數字可透過差分陣列直接推算。因此問題核心即：找出合法的初始值範圍。

解題步驟為：

1. 計算差分數列的**前綴和**（Prefix Sum）：
   - 因為給定的數列是差分形式，前綴和代表隱藏數列每個數字相對初始值的偏移量。
2. 追蹤前綴和過程中的最大值與最小值：
   - 透過最大與最小前綴和，我們能確定初始值的合法範圍。
3. 檢查範圍是否合法，計算範圍內整數的個數作為最終答案。

## 解題步驟

### Step 1：初始化變數與資料結構

首先，我們需要以下變數：

- `prefixSum`：紀錄差分數列的累計和。
- `minimumPrefixSum`、`maximumPrefixSum`：分別追蹤累計和過程中的最小值與最大值，初始值皆設為 `0`（因為還未加總前，累計偏移量為0）。
- `maxAllowedRange`：根據題目提供的上下界，計算可能的最大允許範圍，即 `upper - lower`。

```typescript
const arr = differences;
const length = arr.length;

// Initialize prefix sum and its min/max trackers
let prefixSum = 0;
let minimumPrefixSum = 0;
let maximumPrefixSum = 0;

// Compute maximum allowed range based on given lower and upper bounds
const maxAllowedRange = upper - lower;
```

### Step 2：計算前綴和並更新最值

接著我們遍歷 `differences` 陣列，逐步累加每個差分值到 `prefixSum` 上，並持續更新 `minimumPrefixSum` 與 `maximumPrefixSum`。

在遍歷過程中，我們加入一個**優化**：  
如果某個時刻，最大與最小前綴和之間的差值超過了允許的最大範圍，則代表**不存在任何合法的數列**，直接返回 `0` 即可。

```typescript
for (let i = 0; i < length; ++i) {
  prefixSum += arr[i];

  // Update minimum and maximum prefix sums encountered
  if (prefixSum < minimumPrefixSum) {
    minimumPrefixSum = prefixSum;
  } else if (prefixSum > maximumPrefixSum) {
    maximumPrefixSum = prefixSum;
  }

  // Early exit check: if prefix sum span exceeds allowed range
  if (maximumPrefixSum - minimumPrefixSum > maxAllowedRange) {
    return 0;
  }
}
```

這一步的核心是：
- 持續追蹤 prefixSum（前綴和）的上下限，以確保生成的序列必定在合法範圍內。
- 提前判斷可行性，優化運行效率。

### Step 3：計算可能初始值的個數（最終答案）

完成上述遍歷後，我們知道了累加過程中的最小與最大前綴和範圍。此時初始值的合法範圍為：

$$\text{(upper - lower)} - (\text{maximumPrefixSum} - \text{minimumPrefixSum}) + 1$$

- 上式代表初始值的選擇區間數量。
- 加上 `1` 的原因是範圍包含上下界。

最後將計算結果回傳：

```typescript
// Calculate how many valid starting values are left
const span = maxAllowedRange - (maximumPrefixSum - minimumPrefixSum) + 1;
return span > 0 ? span : 0;
```

## 時間複雜度

- **前綴和計算迴圈**：僅遍歷一次長度為 $n$ 的陣列，每次計算皆為常數時間，因此整體時間複雜度為 $O(n)$。
- **最小值與最大值更新**：每次迴圈中，更新最小值與最大值的操作皆為常數時間，因此不影響整體複雜度。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數個額外變數，無需額外陣列空間，因此空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
