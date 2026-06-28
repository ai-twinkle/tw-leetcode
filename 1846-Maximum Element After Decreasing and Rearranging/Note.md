# 1846. Maximum Element After Decreasing and Rearranging

You are given an array of positive integers `arr`. 
Perform some operations (possibly none) on `arr` so that it satisfies these conditions:

- The value of the first element in `arr` must be `1`.
- The absolute difference between any 2 adjacent elements must be less than or equal to `1`. 
  In other words, `abs(arr[i] - arr[i - 1]) <= 1` for each `i` where `1 <= i < arr.length` (0-indexed). 
  `abs(x)` is the absolute value of `x`.

There are 2 types of operations that you can perform any number of times:

- Decrease the value of any element of `arr` to a smaller positive integer.
- Rearrange the elements of `arr` to be in any order.

Return the maximum possible value of an element in `arr` after performing the operations to satisfy the conditions.

**Constraints:**

- `1 <= arr.length <= 10^5`
- `1 <= arr[i] <= 10^9`

## 基礎思路

本題要求在允許降低元素值與重新排列的前提下，找出最終陣列中可達到的最大元素值。

在思考解法時，可掌握以下核心觀察：

- **第一個元素必須為 1，相鄰差距不超過 1**：
  這意味著若要讓陣列中出現值為 `v` 的元素，則 `1, 2, 3, ..., v` 每個值都必須有元素「覆蓋」，缺少任何一個層級，最大值就無法超越那個缺口。

- **答案受陣列長度上界限制**：
  陣列共有 `n` 個元素，從 1 開始逐步往上鋪，最多只能鋪到 `n`，因此超過 `n` 的值在任何情況下都沒有意義，可以直接向下夾緊至 `n`。

- **排列是自由的，只需確保覆蓋每個層級即可**：
  不需要考慮實際排列方式，只需確認「對於每個目標值，是否有足夠多的元素可以填補該層級」，本質是一個貪心問題。

- **從低到高依序分配是最優策略**：
  每個元素只能對當前最大可達值貢獻最多 1，因此由小到大掃描各值，讓每個可用元素盡量把目前的上界推高一格即可。

依據以上特性，可以採用以下策略：

- **將所有元素夾緊至長度 `n` 後進行計數桶排**，忽略超過 `n` 的多餘部分。
- **從值 1 開始往上掃描每個計數桶**，對每個落在該值的元素，若目前可達上界尚未到達該值，則讓上界提升一格。
- **掃描結束時的上界即為答案**。

此策略以線性時間完成，邏輯清晰且不需要實際排列元素。

## 解題步驟

### Step 1：初始化計數桶並將每個元素夾緊至長度

由於答案不可能超過陣列長度 `length`，任何大於 `length` 的值都可以向下夾緊而不影響結果。
使用大小為 `length + 1` 的計數桶紀錄每個夾緊後的值出現幾次。

```typescript
const length = arr.length;

// 答案受長度上界限制，將每個值夾緊至 length 後放入計數桶。
const counts = new Uint32Array(length + 1);

for (let index = 0; index < length; index++) {
  const value = arr[index];

  // 元素可以任意降低，因此夾緊至 length 不影響可用性。
  const clamped = value < length ? value : length;
  counts[clamped]++;
}
```

### Step 2：由小到大掃描計數桶，逐步推高可達上界

從值 1 開始往上枚舉每個計數桶，對桶中每一個元素，若目前的可達上界 `result` 尚未到達當前值 `value`，則將 `result` 推高一格。
每個元素最多只能讓上界提升 1，且只有在尚未達到該層級時才有效。

```typescript
// 由小到大枚舉；每個元素最多讓上界提升一格。
let result = 0;

for (let value = 1; value <= length; value++) {
  // 逐一處理落在此值的每個元素，嘗試推高上界。
  for (let occurrence = 0; occurrence < counts[value]; occurrence++) {
    if (result < value) {
      result = result + 1;
    }
  }
}
```

### Step 3：回傳最終可達的最大值

掃描結束後，`result` 即為在滿足所有條件的情況下可達到的最大元素值。

```typescript
return result;
```

## 時間複雜度

- 第一個迴圈遍歷所有 `n` 個元素，進行夾緊與計數，耗時 $O(n)$；
- 第二個雙層迴圈中，外層枚舉 1 到 `n`，內層累計所有元素的出現次數，兩層合計總迭代次數等於 `n`，耗時 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用大小為 `n + 1` 的計數桶陣列 `counts`；
- 其餘僅為常數個輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
