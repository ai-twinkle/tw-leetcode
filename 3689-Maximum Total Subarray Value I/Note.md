# 3689. Maximum Total Subarray Value I

You are given an integer array `nums` of length `n` and an integer `k`.

You need to choose exactly k non-empty subarrays `nums[l..r]` of `nums`. 
Subarrays may overlap, and the exact same subarray (same `l` and `r`) can be chosen more than once.

The value of a subarray `nums[l..r]` is defined as: `max(nums[l..r]) - min(nums[l..r])`.

The total value is the sum of the values of all chosen subarrays.

Return the maximum possible total value you can achieve.

**Constraints:**

- `1 <= n == nums.length <= 5 * 10^4`
- `0 <= nums[i] <= 10^9`
- `1 <= k <= 10^5`

## 基礎思路

本題要求從陣列中選取恰好 `k` 個（可重複的）子陣列，並最大化所有子陣列「最大值減最小值」的總和。乍看之下，似乎需要枚舉大量子陣列並挑選最佳組合，但只要釐清題目允許重複選取這個條件，問題其實會大幅簡化。

在思考解法時，可掌握以下核心觀察：

- **任一子陣列的差值不會超過整體最大差**：
  對任何子陣列而言，其元素都是原陣列元素的子集，故 `max(子陣列) - min(子陣列)` 必定不大於 `全域最大值 - 全域最小值`。

- **子陣列允許重複選取**：
  既然同一個 `(l, r)` 可以被多次計入，最佳策略便是找到差值最大的那一段，並重複選擇它 `k` 次，沒有任何理由去湊較差的子陣列。

- **整個陣列本身即達到最大差**：
  涵蓋全域最大值與最小值的子陣列必然存在，最直接的選擇就是整個陣列；因此最大可能的子陣列差值正是 `全域最大值 - 全域最小值`。

依據以上特性，可以採用以下策略：

- 以一次線性掃描找出全域最大值與最小值；
- 將兩者相減後再乘以 `k`，即得到題目所求的最大總和。

此策略無需動態規劃、亦無需枚舉子陣列，僅以常數空間與線性時間即可完成。

## 解題步驟

### Step 1：紀錄陣列長度並初始化最大最小值

讀取陣列長度作為後續掃描的終止條件，並以首個元素同時作為最大值與最小值的初始候選，方便後續比較時逐步更新。

```typescript
const length = nums.length;

// 以單次掃描追蹤全域最大與最小值
let minimumValue = nums[0];
let maximumValue = nums[0];
```

### Step 2：線性掃描以更新全域最大最小值

從第二個元素開始走訪整個陣列，每讀取一個元素就嘗試以其更新目前已知的最小值與最大值；走訪結束後得到的便是整個陣列的全域最大與最小值。

```typescript
for (let index = 1; index < length; index++) {
  const current = nums[index];

  if (current < minimumValue) {
    minimumValue = current;
  }

  if (current > maximumValue) {
    maximumValue = current;
  }
}
```

### Step 3：以全域最大最小差乘以 `k` 回傳結果

由於最佳子陣列即為涵蓋整個陣列的範圍，且該子陣列可重複選取 `k` 次，將兩者相乘即得到題目所求的最大總和。

```typescript
// 最佳的單一子陣列為整個陣列；選取 k 次
return (maximumValue - minimumValue) * k;
```

## 時間複雜度

- 僅需單次線性掃描整個陣列，每個元素進行常數次比較與更新；
- 最終的結果計算為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數儲存目前最大值、最小值與索引；
- 無任何額外的陣列或動態結構配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
