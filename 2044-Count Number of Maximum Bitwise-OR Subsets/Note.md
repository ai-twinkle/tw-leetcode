# 2044. Count Number of Maximum Bitwise-OR Subsets

Given an integer array `nums`, find the maximum possible bitwise OR of a subset of `nums` and return the number of different non-empty subsets with the maximum bitwise OR.

An array `a` is a subset of an array `b` if `a` can be obtained from `b` by deleting some (possibly zero) elements of `b`. 
Two subsets are considered different if the indices of the elements chosen are different.

The bitwise OR of an array `a` is equal to `a[0] OR a[1] OR ... OR a[a.length - 1]` (0-indexed).

**Constraints:**

- `1 <= nums.length <= 16`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題的核心目標是找出所有非空子集中，能夠達到最大的位元 OR（Bitwise OR）的子集數量。

我們可以透過以下觀察來設計解法：

- 數量上限：陣列長度最大為 16，因此所有子集最多有 $2^{16}$ 個，總計算量可控。
- 遞推方法：使用位元掩碼 (bitmask) 來表示每個子集，以便快速計算子集的 OR 值。
- 優化技巧：對於任何一個子集而言，其 OR 結果可以從「更小的子集的 OR 值」加上「新加入元素的 OR」快速得到，因此適合使用動態規劃（DP）記憶化子集的 OR 值。

根據以上思路，我們可以設計一個動態規劃的解法來解決這個問題：

1. 用 DP 儲存子集 OR 的結果。
2. 從空子集逐步增加元素，推導所有子集的 OR。
3. 統計出現過的最大 OR 值及其對應次數。

## 解題步驟

### Step 1：初始化 DP 陣列及輔助變數

首先設定好所需的輔助變數與 DP 陣列：

```typescript
const length = nums.length;                       // nums 陣列的長度
const totalSubsets = 1 << length;                 // 總子集數量 (2^length)

// 使用 Typed Array 優化計算效率，存取元素更快
const values = new Uint32Array(nums);             
const dp = new Uint32Array(totalSubsets);         // dp[bitmask] 記錄子集 bitmask 的 OR 結果

let maximumOr = 0;                                // 目前最大的 OR 結果
let subsetCount = 0;                              // 達到最大 OR 結果的子集數量
```

### Step 2：計算所有非空子集的 OR 結果

透過位元掩碼遍歷每一個子集：

```typescript
for (let bitmask = 1; bitmask < totalSubsets; bitmask++) {
  // 從目前 bitmask 中，找出最低設定位，代表新加入的元素
  const leastSignificantBit = bitmask & -bitmask;
  
  // 移除該新加入的元素，取得上一個較小的子集 bitmask
  const previousBitmask = bitmask ^ leastSignificantBit;

  // 計算新加入元素的索引位置 (利用 Math.clz32 找到最右邊的設定位索引)
  const bitIndex = 31 - Math.clz32(leastSignificantBit);

  // 計算此子集的 OR 結果：前一個子集 OR 新加入元素
  const currentOrValue = dp[previousBitmask] | values[bitIndex];
  dp[bitmask] = currentOrValue;

  // 若當前的 OR 值比之前的最大值更大，更新最大值及次數
  if (currentOrValue > maximumOr) {
    maximumOr = currentOrValue;
    subsetCount = 1;
  } 
  // 若當前的 OR 值等於當前最大值，則次數加一
  else if (currentOrValue === maximumOr) {
    subsetCount++;
  }
}
```

### Step 3：回傳最終結果

當所有子集計算完畢，`subsetCount` 即為答案。

```typescript
return subsetCount;
```

## 時間複雜度

- 總子集數量為 $2^n$，每個子集的 OR 值推導為 $O(1)$。
- 總時間複雜度為 $O(2^n)$。

> $O(2^n)$

## 空間複雜度

- 使用一個大小為 $2^n$ 的 DP 陣列儲存子集的 OR 結果。
- 使用一個大小為 $n$ 的陣列儲存原始數值。
- 總空間複雜度為 $O(2^n)$。

> $O(2^n)$
