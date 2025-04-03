# 2874. Maximum Value of an Ordered Triplet II

You are given a 0-indexed integer array `nums`.

Return the maximum value over all triplets of indices `(i, j, k)` such 
that `i < j < k`. If all such triplets have a negative value, return `0`.

The value of a triplet of indices `(i, j, k)` is equal to `(nums[i] - nums[j]) * nums[k]`.

## 基礎思路

本題要求我們從數組中選取一組符合索引條件 `i < j < k` 的三個元素，使得計算式 `(nums[i] - nums[j]) * nums[k]` 的結果達到最大。仔細觀察該式子，可以將問題分解為兩個目標：

- **最大化差值**：希望 `(nums[i] - nums[j])` 的值越大越好，這意味著我們應盡量選擇靠左側較大的數作為 `nums[i]`，並選擇相對較小的數作為中間的 `nums[j]`。
- **最大化乘數**：右側的乘數 `nums[k]` 則需儘量選取更大的數，以進一步放大差值效果。

基於以上觀察，我們制定如下的演算法策略：

- 透過一個變數 `bestLeft`，記錄從數組左側到目前位置中曾經出現過的最大值，以便隨時作為候選的 `nums[i]`。
- 再透過另一個變數 `bestDiff`，動態追蹤從左側候選數 `bestLeft` 到目前位置為止，能獲得的最大差值 `(bestLeft - nums[j])`。
- 接著在掃描過程中，以當前位置右側的元素 `nums[j+1]` 作為候選乘數，計算出當前三元組的候選值，並更新當前找到的最大值 `maxTriplet`。

透過這樣的方式，我們僅需一次線性掃描即可得到最終答案，整體的時間複雜度僅需 $O(n)$。

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
   對於當前的中間元素 `nums[j]`，使用 `bestLeft`（到目前為止的最大值）與 `nums[j]` 相減，並與現有的 `bestDiff` 比較，取其中較大的作為新的 `bestDiff`：
   ```typescript
   bestDiff = Math.max(bestDiff, bestLeft - nums[j]);
   ```

2. **計算並更新最大三元組值**  
   使用當前 `bestDiff` 與下一個元素 `nums[j+1]`（作為右側乘數）計算候選的三元組值。然後將這個值與現有的 `maxTriplet` 比較，更新為較大的值：
   ```typescript
   maxTriplet = Math.max(maxTriplet, bestDiff * nums[j + 1]);
   ```

3. **更新最佳左側值**  
   為了讓後續的差值計算能夠利用更大的候選值，將 `bestLeft` 更新為當前 `nums[j]` 與之前 `bestLeft` 中的最大者：
   ```typescript
   bestLeft = Math.max(bestLeft, nums[j]);
   ```

完整的迴圈如下：

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
