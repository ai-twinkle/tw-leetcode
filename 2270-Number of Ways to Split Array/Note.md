# 2270. Number of Ways to Split Array

You are given a 0-indexed integer array `nums` of length `n`.
`nums` contains a valid split at index `i` if the following are true:

- The sum of the first `i + 1` elements is greater than or equal to the sum of the last `n - i - 1` elements.
- There is at least one element to the right of `i`. 
  That is, `0 <= i < n - 1`.
  
Return the number of valid splits in `nums`.

**Constraints:**

- `2 <= nums.length <= 10^5`
- `-10^5 <= nums[i] <= 10^5`

## 基礎思路

題目要求將一個整數陣列 `nums` 分成兩段，左半段索引範圍是 $[0, i]$，右半段索引範圍是 $[i+1, n-1]$，並且左半段的總和要大於等於右半段的總和，我們要計算有多少種這樣的分割方法。

最直接的方式是對每一個分割點 $i$，都計算一次左半段與右半段的總和，然後進行比較。但這樣做每次都要重複累加，時間複雜度是 $O(n^2)$，對於 $n$ 很大時會超時。

為了讓查詢每一段的區間總和可以在 $O(1)$ 內完成，我們可以先預處理出前綴和與後綴和陣列：

- 前綴和（prefix sum）：`prefixSum[i]` 代表 `nums[0]` 到 `nums[i-1]` 的總和，方便快速查詢任一區間總和。
- 後綴和（postfix sum）：`postfixSum[i]` 代表 `nums[i]` 到 `nums[n-1]` 的總和，讓右半段總和也能常數時間取得。

這樣就能在 $O(n)$ 的時間複雜度內完成所有查詢，空間上則需要 $O(n)$ 來存前綴和和後綴和。

## 解題步驟

### Step 1: 初始化前綴和與後綴和

初始化一個前綴和陣列 `prefixSum` 以及一個後綴和陣列 `postfixSum`，長度皆為 `nums.length + 1`，並預設填 `0`。

```typescript
const prefixSum = new Array(nums.length + 1).fill(0);
const postfixSum = new Array(nums.length + 1).fill(0);
```

### Step 2: 計算前綴和與後綴和

- `prefixSum[i]` 存的是 `nums[0]` 到 `nums[i-1]` 的總和。
- `postfixSum[i]` 則是 `nums[i]` 到最後一個元素的總和。
- 這樣可以在 $O(n)$ 內把所有前綴與後綴和預處理好。

```typescript
for (let i = 1; i <= nums.length; i++) {
  prefixSum[i] = prefixSum[i - 1] + nums[i - 1];
  postfixSum[nums.length - i] = postfixSum[nums.length - i + 1] + nums[nums.length - i];
}
```

### Step 3: 計算有效分割

- 從 $i=1$ 開始到 $i < nums.length$，代表分割點的右邊至少還有一個元素。
- 如果左邊的前綴和 `prefixSum[i]` 大於等於右邊的後綴和 `postfixSum[i]`，就把 `validSplits` 加一。

```typescript
let validSplits = 0;
for (let i = 1; i < nums.length; i++) {
  if (prefixSum[i] >= postfixSum[i]) {
    validSplits++;
  }
}
```

## 時間複雜度

- 由於 `nums` 的長度為 $n$，所以時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 由於我們需要兩個暫存來記錄前綴和與後綴和，所以空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
