# 3315. Construct the Minimum Bitwise Array II

You are given an array `nums` consisting of `n` prime integers.

You need to construct an array `ans` of length `n`, such that, for each index `i`, 
the bitwise `OR` of `ans[i]` and `ans[i] + 1` is equal to `nums[i]`, 
i.e. `ans[i] OR (ans[i] + 1) == nums[i]`.

Additionally, you must minimize each value of `ans[i]` in the resulting array.

If it is not possible to find such a value for `ans[i]` that satisfies the condition, then set `ans[i] = -1`.

**Constraints:**

- `1 <= nums.length <= 100`
- `2 <= nums[i] <= 10^9`
- `nums[i]` is a prime number.

## 基礎思路

本題給定一個由質數組成的陣列 `nums`，對每個 `nums[i]` 我們要找一個最小的整數 `ans[i]`，使得：

* `ans[i] OR (ans[i] + 1) == nums[i]`
* 若不存在則 `ans[i] = -1`

在思考解法時，我們需要注意幾個關鍵性質：

* **`a OR (a + 1)` 一定是奇數**：因為 `a` 與 `a+1` 一奇一偶，而 `OR` 的最低位一定會變成 1，所以結果必為奇數。
  因此在題目「質數」限制下，唯一的偶質數 `2` 一定無解（其餘質數皆為奇數）。
* **目標是讓 `a` 最小**：在所有可行的 `a` 中，必須選擇最小值，這意味著我們要能「直接定位」最小解，而不是逐一嘗試。
* **`OR` 的變化只與二進位的進位位置有關**：`a + 1` 會把 `a` 的某段尾端連續的 1 翻成 0，並把第一個 0 翻成 1；因此 `a OR (a+1)` 的形狀可以用「最低會產生進位的那個 bit」來刻畫。
* **對於奇數目標值（質數>2）可用位元性質推得唯一的最小構造**：透過找出 `(nums[i] + 1)` 的最低 set bit，可直接推出最小的 `a`。

因此策略是：

1. 先判斷是否為偶數（只可能是 2），偶數直接無解。
2. 對奇數目標，利用 `(value + 1)` 的最低 set bit 找到最小可行的 `a`，並直接計算出答案。

## 解題步驟

### Step 1：遍歷陣列並取出當前值

逐一處理每個 `nums[index]`，並以 32-bit 整數形式操作。

```typescript
for (let index = 0; index < nums.length; index++) {
  const value = nums[index] | 0;

  // ...
}
```

### Step 2：判斷偶質數無解情況

因為 `a | (a + 1)` 必為奇數，所以若目標值是偶數（在質數限制下只會是 `2`），直接設為 `-1`。

```typescript
for (let index = 0; index < nums.length; index++) {
  // Step 1：遍歷陣列並取出當前值
  const value = nums[index] | 0;

  // a | (a + 1) 一定是奇數，因此只有質數 2 在此情況下不可能
  if ((value & 1) === 0) {
    nums[index] = -1;
  } else {
    // ...
  }
}
```

### Step 3：對奇數目標直接構造最小解

對於奇數 `value`，利用 `(value + 1)` 的最低 set bit，直接跳到最小的 `ans[i]`，並寫回原陣列。

```typescript
for (let index = 0; index < nums.length; index++) {
  // Step 1：遍歷陣列並取出當前值

  // Step 2：判斷偶質數無解情況

  if ((value & 1) === 0) {
    nums[index] = -1;
  } else {
    // 使用 (value + 1) 的最低 set bit，直接跳到最小答案
    const nextValue = (value + 1) | 0;
    const lowestSetBit = nextValue & -nextValue;
    nums[index] = value - (lowestSetBit >>> 1);
  }
}
```

### Step 4：回傳結果陣列

所有位置處理完後，回傳同一個陣列作為答案。

```typescript
return nums;
```

## 時間複雜度

- 外層 `for` 迴圈跑 `n = nums.length` 次；
- 每次迴圈內只包含固定數量的位元運算、加減法、指定與比較，皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數個暫存變數（`value`, `nextValue`, `lowestSetBit` 等）；
- 直接原地覆寫 `nums`，不配置與 `n` 成比例的新結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
