# 2845. Count of Interesting Subarrays

You are given a 0-indexed integer array `nums`, an integer `modulo`, and an integer `k`.

Your task is to find the count of subarrays that are interesting.

A subarray `nums[l..r]` is interesting if the following condition holds:

- Let `cnt` be the number of indices `i` in the range `[l, r]` such that `nums[i] % modulo == k`. 
  Then, `cnt % modulo == k`.

Return an integer denoting the count of interesting subarrays.

Note: A subarray is a contiguous non-empty sequence of elements within an array.

## 基礎思路

題目要求計算「有趣子陣列」(interesting subarrays) 的數量，一個子陣列被稱為「有趣」，當且僅當滿足以下條件：

- 對於子陣列 `nums[l..r]`，設 `cnt` 為區間內滿足 `nums[i] % modulo == k` 的元素個數。
- 子陣列若滿足條件，則必須有 `cnt % modulo == k`。

直觀上，以「前綴和 (prefix sum)」的思想來處理較為高效：

- 定義「符合條件元素」的前綴個數 (cumulativeMatchCount)。
- 若目前前綴和為 `cumulativeMatchCount`，我們需要找到之前前綴出現次數中有多少個滿足：

  $$
  (\text{cumulativeMatchCount} - \text{previousRemainder}) \% \text{modulo} = k
  $$

轉換此式子得：

$$
\text{previousRemainder} \equiv (\text{cumulativeMatchCount} - k) \mod \text{modulo}
$$

透過此方法，我們即可快速地計算出答案。

## 解題步驟

### Step 1：初始化與資料結構

首先，定義數組長度 `n`，接著決定前綴餘數的最大可能範圍：

- 如果 `modulo <= n`，餘數的最大值為 `modulo - 1`。
- 如果 `modulo > n`，餘數範圍則為 `[0, n]`。

```typescript
const n = nums.length;
const maxRemainderValue = modulo <= n ? modulo : n + 1;
```

並建立 `frequencyOfPrefixRemainder` 陣列，用於記錄各餘數的出現頻率：

- 初始狀態（空前綴）餘數為 0，設定出現次數為 1。

```typescript
const frequencyOfPrefixRemainder = new Uint32Array(maxRemainderValue);
frequencyOfPrefixRemainder[0] = 1;  // 空前綴餘數為 0
```

接著，初始化兩個重要變數：

- `cumulativeMatchCount`：追蹤目前的前綴餘數（符合 `nums[i] % modulo === k` 的數量）。
- `totalInterestingSubarrays`：記錄符合條件子陣列的總數量。

```typescript
let cumulativeMatchCount = 0;
let totalInterestingSubarrays = 0;
```

### Step 2：逐一處理陣列元素

從頭到尾遍歷陣列，逐一更新狀態：

```typescript
for (let index = 0; index < n; index++) {
  // 當前元素若符合 nums[index] % modulo === k，則 matchIndicator 為 1；否則為 0
  const matchIndicator = (nums[index] % modulo === k) ? 1 : 0;

  // 更新 cumulativeMatchCount，並適當取餘避免溢出
  cumulativeMatchCount += matchIndicator;
  if (cumulativeMatchCount >= modulo) {
    cumulativeMatchCount -= modulo;
  }

  // 計算所需的 previousRemainder，使 (cumulativeMatchCount - previousRemainder) % modulo === k 成立
  let neededRemainder = cumulativeMatchCount - k;
  if (neededRemainder < 0) {
    neededRemainder += modulo;
  }

  // 若所需 previousRemainder 存在於 frequencyOfPrefixRemainder 範圍內，則累加對應頻率
  if (neededRemainder < frequencyOfPrefixRemainder.length) {
    totalInterestingSubarrays += frequencyOfPrefixRemainder[neededRemainder];
  }

  // 更新當前 cumulativeMatchCount 出現次數
  frequencyOfPrefixRemainder[cumulativeMatchCount]++;
}
```

### Step 3：返回最終結果

最終的答案即為遍歷結束後的 `totalInterestingSubarrays`：

```typescript
return totalInterestingSubarrays;
```

## 時間複雜度分析

- **遍歷整個陣列 (for 迴圈)**：需花費 $O(n)$ 時間，其中每次操作皆為常數時間（更新餘數與計算次數）。
- 總時間複雜度：$O(n)$。

> $O(n)$

## 空間複雜度分析

- **frequencyOfPrefixRemainder 陣列**：
  - 此陣列大小最多為 modulo 或 n + 1，因此空間複雜度最壞為 $O(\min(n, modulo))$。
- 其他額外空間僅為常數級別。
- 總空間複雜度：$O(\min(n, modulo))$。

> $O(\min(n, modulo))$
