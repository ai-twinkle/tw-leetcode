# 3354. Make Array Elements Equal to Zero

You are given an integer array `nums`.

Start by selecting a starting position `curr` such that `nums[curr] == 0`, and choose a movement direction of either left or right.

After that, you repeat the following process:

- If `curr` is out of the `range [0, n - 1]`, this process ends.
- If `nums[curr] == 0`, move in the current direction by incrementing `curr` if you are moving right, or decrementing `curr` if you are moving left.
- Else if `nums[curr] > 0`:
  - Decrement `nums[curr]` by 1.
  - Reverse your movement direction (left becomes right and vice versa).
  - Take a step in your new direction.
A selection of the initial position `curr` and movement direction is considered valid if every element in `nums` becomes 0 by the end of the process.

Return the number of possible valid selections.

**Constraints:**

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 100`
- There is at least one element `i` where `nums[i] == 0`.

## 基礎思路

本題要求我們判斷從哪些起始位置與方向出發，最終能使陣列 `nums` 的所有元素都歸零。

整個模擬過程如下：

1. 選擇一個初始位置 `curr`，且該位置的值必須為 `0`。
2. 選擇移動方向（向左或向右）。
3. 不斷重複以下動作直到 `curr` 超出邊界：
    - 若 `nums[curr] == 0`，則在當前方向上前進一步；
    - 若 `nums[curr] > 0`，則先將該值減一、反轉移動方向，再前進一步。

我們要找出所有「能使最終所有元素變為 0」的初始 `(curr, direction)` 配置。

在理解過程後，可以發現直接模擬所有情況的成本太高（每次都會改變陣列內容）。因此必須尋找**規律性條件**：

- 假設整體數組中有 `totalSum` 代表所有元素的總和；
- 當我們從左側移動到右側時，左側累積的和（`leftSum`）逐漸增加；
- 若以 `i` 為起點，則左側的能量與右側的能量差應該平衡，否則不可能讓整體歸零。

於是可以導出條件：

- 當 `nums[i] == 0` 時，計算 `difference = |2 * leftSum - totalSum|`；
- 若差值為 `0`，代表左右能量平衡，可以往**左右兩邊**出發；
- 若差值為 `1`，代表左右能量相差一單位，只能往其中一側出發；
- 其他情況無法平衡。

藉此即可在單次線性掃描中，統計所有合法起始選項。

## 解題步驟

### Step 1：初始化變數與計算總和

首先遍歷整個陣列，計算 `totalSum`（代表所有元素總量），並建立一個變數 `leftSum` 來累積左側部分的和。

```typescript
// 取得陣列長度
const length = nums.length;

// 計算所有元素總和
let totalSum = 0;
for (let i = 0; i < length; i++) {
  totalSum += nums[i];
}

// 統計合法選擇數量
let totalValidSelections = 0;

// 累計左側前綴和
let leftSum = 0;
```

### Step 2：逐一檢查每個可能起始點

僅在 `nums[i] == 0` 的情況下檢查，因為題目明確要求初始位置必須為零。

```typescript
for (let i = 0; i < length; i++) {
  // 只考慮數值為 0 的位置作為起點
  if (nums[i] === 0) {
    // 計算左右區域能量差異
    const difference = Math.abs(2 * leftSum - totalSum);

    // 若差值 <= 1，則可能為合法起始組合
    // 差值 = 0 → 可向左右兩邊出發 (加 2)
    // 差值 = 1 → 只可向一側出發 (加 1)
    if (difference <= 1) {
      totalValidSelections += 2 - difference;
    }
  }

  // 每輪更新左側和，為下一次迭代做準備
  leftSum += nums[i];
}
```

### Step 3：返回最終結果

掃描結束後，所有可能起始組合的數量即為答案。

```typescript
// 回傳總合法起始配置數量
return totalValidSelections;
```

## 時間複雜度

- 一次遍歷求總和為 $O(n)$；
- 再次線性掃描以檢查所有位置，亦為 $O(n)$；
- 所有操作皆為常數級運算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用了常數級變數（`totalSum`, `leftSum`, `difference` 等）；
- 未使用額外陣列或輔助結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
