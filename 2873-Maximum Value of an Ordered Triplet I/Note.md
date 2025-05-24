# 2873. Maximum Value of an Ordered Triplet I

You are given a 0-indexed integer array `nums`.

Return the maximum value over all triplets of indices `(i, j, k)` such 
that `i < j < k`. If all such triplets have a negative value, return `0`.

The value of a triplet of indices `(i, j, k)` is equal to `(nums[i] - nums[j]) * nums[k]`.

**Constraints:**

- `3 <= nums.length <= 100`
- `1 <= nums[i] <= 10^6`

## 基礎思路

本題的目標是，**在數組中選取一組遞增索引的三個元素 $(i, j, k)$，使得 $(nums[i] - nums[j]) \times nums[k]$ 的值最大**。
這個問題可以從以下兩個層面來思考：

1. **最大化差值部分 $(nums[i] - nums[j])$**
   - 我們希望左側的 $nums[i]$ 儘量大，而中間的 $nums[j]$ 儘量小，這樣差值會最大化。

2. **放大乘數效果 $nums[k]$**
   - 最右側的 $nums[k]$ 則希望取到最大的數，以進一步放大整體值。

基於上述觀察，可以提出以下解題策略：

- **分階段尋找最優組合**
   - 對於每一個潛在的中間元素 $j$，都需要考慮在它左側出現過的最大值（作為 $nums[i]$）以及它本身（作為 $nums[j]$）所能構成的最大差值。
   - 再將這個最大差值與其右側所有可能的 $nums[k]$ 做乘積，尋找最大組合。

- **動態維護候選**
   - 在掃描過程中，隨時記錄到目前為止的最佳左側元素與最大差值，使每一步都能即時根據新的元素計算可能的最優三元組結果。
- **線性遍歷優化**

   - 由於數組長度有限，可以利用一次線性遍歷，在每個位置同時維護所需的中間狀態資訊，無需暴力窮舉所有三元組組合，從而將計算效率提升至 $O(n)$。

這樣，我們就能以「一次遍歷」的策略，有效地鎖定所有可能的三元組中最大值，並確保不遺漏任何可能組合。
最終的結果若全為負值，則根據題意返回 $0$。

## 解題步驟

### Step 1：初始化變數

首先，我們需定義三個變數：
- **maxTriplet**：初始化為 `0`，用於儲存當前找到的最大三元組值。若所有計算結果為負，則返回初始值 `0`。
- **bestLeft**：初始化為陣列第一個元素 `nums[0]`，代表從左側出發能夠作為 `nums[i]` 的最大值。
- **bestDiff**：初始化為 `0`，用於記錄目前為止能得到的最大差值，即 `bestLeft - nums[j]`。

```typescript
let maxTriplet = 0;       // 目前找到的最大三元組值
let bestLeft = nums[0];   // 從左邊開始作為 nums[i] 的最佳候選值
let bestDiff = 0;         // 記錄迄今為止最大的差值 (bestLeft - nums[j])
```

### Step 2：遍歷陣列並動態更新

接著，我們從索引 `1` 開始遍歷，直到 `nums.length - 1`（確保 `j+1` 存在）：

1. **更新最佳差值**  
   對於當前的中間元素 `nums[j]`，使用 `bestLeft`（到目前為止的最大值）與 `nums[j]` 相減，並與現有的 `bestDiff` 比較，取其中較大的作為新的 `bestDiff`。

2. **計算並更新最大三元組值**  
   使用當前 `bestDiff` 與下一個元素 `nums[j+1]`（作為右側乘數）計算候選的三元組值。然後將這個值與現有的 `maxTriplet` 比較，更新為較大的值。

3. **更新最佳左側值**  
   為了讓後續的差值計算能夠利用更大的候選值，將 `bestLeft` 更新為當前 `nums[j]` 與之前 `bestLeft` 中的最大者。

```typescript
for (let j = 1; j < nums.length - 1; j++) {
  // 更新目前最大差值 (從左側到當前中間元素)
  bestDiff = Math.max(bestDiff, bestLeft - nums[j]);
  // 使用 nums[j+1] 作為右側乘數計算候選三元組值，並更新最大值
  maxTriplet = Math.max(maxTriplet, bestDiff * nums[j + 1]);
  // 更新左側最佳值以利後續計算
  bestLeft = Math.max(bestLeft, nums[j]);
}
```

### Step 3：返回最終結果

當遍歷結束後，`maxTriplet` 已經儲存了所有滿足條件的三元組中的最大值，直接返回即可：

```typescript
return maxTriplet;
```

## 時間複雜度

- **單次線性遍歷**：迴圈遍歷陣列一次，每次的操作均為常數時間，時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **常數額外變數**：僅使用了 `maxTriplet`、`bestLeft` 與 `bestDiff` 三個變數，因此額外空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
