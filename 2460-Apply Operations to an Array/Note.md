# 2460. Apply Operations to an Array

You are given a 0-indexed array `nums` of size `n` consisting of non-negative integers.

You need to apply `n - 1` operations to this array where, in the $i^{th}$ operation (0-indexed), you will apply the following on the $i^{th}$ element of `nums`:

- If `nums[i] == nums[i + 1]`, then multiply `nums[i]` by `2` and 
  set `nums[i + 1]` to `0`. Otherwise, you skip this operation.

After performing all the operations, shift all the `0`'s to the end of the array.

- For example, the array `[1,0,2,0,0,1]` after shifting all its `0`'s to the end, is `[1,2,1,0,0,0]`.

Return the resulting array.

Note that the operations are applied sequentially, not all at once.

**Constraints:**

- `2 <= nums.length <= 2000`
- `0 <= nums[i] <= 1000`

## 基礎思路

我們可以將題目拆分成兩個階段：

- 模擬操作階段：根據題目要求依序進行數字合併和置 0 的操作，這部分比較直接，沒有太多優化空間。
- 移動零階段：使用一個指針來追蹤當前該放置非零元素的位置，當遇到非零數字且位置不同時，與指針所在位置的數字交換，然後指針向後移動。
  這樣可以有效地把所有非零數字移到前面，剩餘的位置則自動就是 0。

透過這樣的方式，我們可以在 $O(n)$ 的時間內完成操作，並且只需要 $O(1)$ 的額外空間。

## 解題步驟

### Step 1: 紀錄長度

首先，我們需要紀錄原始數組的長度，以便後續操作。

```typescript
const n = nums.length;
```

### Step 2: 模擬操作

接下來，我們需要模擬操作，根據題目要求進行數字合併和置 0 的操作。

```typescript
for (let i = 0; i < n - 1; i++) {
  if (nums[i] === nums[i + 1]) {
    nums[i] *= 2;
    nums[i + 1] = 0;
  }
}
```

### Step 3: 移動零

最後，我們使用一個指針 `j` 來追蹤當前該放置非零元素的位置，當遇到非零數字時，與指針所在位置的數字交換，然後指針向後移動。

```typescript
let j = 0;
for (let i = 0; i < n; i++) {
  // 只有當當前數字不為 0 時，才需要進行操作
  if (nums[i] !== 0) {
    // 如果 i 和 j 不相等，則代表需要交換
    if (i !== j) {
      nums[j] = nums[i];
      nums[i] = 0;
    }
    
    // 指針向後移動
    j++;
  }
}
```

## 時間複雜度

- 執行模擬操作的時間複雜度為 $O(n)$。
- 執行移動零的時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要常數額外空間來存儲變量與指針，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
