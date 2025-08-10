# 869. Reordered Power of 2

You are given an integer `n`. 
We reorder the digits in any order (including the original order) such that the leading digit is not zero.

Return `true` if and only if we can do this so that the resulting number is a power of two.

**Constraints:**

- `1 <= n <= 10^9`

## 基礎思路

題目要我們從一組 **互異** 的正整數中，找出最大的子集，使得子集中任兩數必有一方能整除另一方。
這是典型的 **動態規劃（DP）+ 排序** 問題：

1. **先排序**（由小到大）：若 `a | b`，通常 `a ≤ b`；排序後僅需檢查「前面較小的數能否整除當前數」。
2. **DP 狀態**：令 `dp[i]` 為「以 `nums[i]` 作為結尾的最大整除子集長度」，`prev[i]` 用來記錄該子集在 `i` 之前的銜接索引，方便最後 **回溯** 組回答案。
3. **回溯重建答案**：找出全域最大長度的結尾 `maxIndex`，透過 `prev` 一路往回走，收集元素並反轉即可。

因為 `nums.length <= 1000`，`O(n^2)` 的 DP 在時限內完全可行。

## 解題步驟

### Step 1：初始化與資料結構

取得長度、處理空陣列，再將輸入排序，並初始化 `dp` 與 `prev`。

```typescript
const n = nums.length;

if (n === 0) {
  return [];
}

// 將數字由小到大排序，利於只檢查「較小數能否整除較大數」
nums.sort((a, b) => a - b);

// dp[i]：以 nums[i] 為結尾的最大整除子集長度（至少包含自己，故為 1）
const dp = new Uint16Array(n).fill(1);

// prev[i]：重建用，指向最佳狀態來源索引；-1 代表沒有前驅
const prev = new Int16Array(n).fill(-1);
```

### Step 2：雙層迴圈做 DP 轉移

逐一嘗試把 `nums[j]`（j < i）接到 `nums[i]` 前面，若 `nums[i] % nums[j] === 0` 且可讓長度變更長就更新；同時維護全域最佳答案資訊。

```typescript
let maxSize = 1;  // 目前找到的最大子集長度
let maxIndex = 0; // 對應的結尾位置

for (let i = 1; i < n; i++) {
  for (let j = 0; j < i; j++) {
    // 若 nums[i] 能被 nums[j] 整除，嘗試接在 nums[j] 之後
    if (nums[i] % nums[j] === 0 && dp[i] < (dp[j] + 1)) {
      dp[i] = dp[j] + 1;
      prev[i] = j; // 紀錄最佳前驅
    }
  }
  // 更新全域最佳（記錄最大長度與其結尾索引）
  if (dp[i] > maxSize) {
    maxSize = dp[i];
    maxIndex = i;
  }
}
```

### Step 3：回溯重建子集並返回

自 `maxIndex` 沿著 `prev` 回溯收集元素，最後反轉為遞增順序即為答案。

```typescript
// 由結尾索引開始回溯重建最大整除子集
const result: number[] = [];
while (maxIndex !== -1) {
  result.push(nums[maxIndex]);
  maxIndex = prev[maxIndex];
}

// 回溯得到的是反向順序，反轉後即為正確順序
result.reverse();
```

### Step 4：返回結果

返回重建的最大整除子集。

```typescript
return result;
```

## 時間複雜度

- **排序**：$O(n \log n)$。
- **DP 轉移（雙層迴圈）**：$O(n^2)$，為主導成本。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- **dp 與 prev**：各佔 $O(n)$。
- 其他皆為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
