# 1534. Count Good Triplets

Given an array of integers `arr`, and three integers `a`, `b` and `c`. 
You need to find the number of good triplets.

A triplet `(arr[i], arr[j], arr[k])` is good if the following conditions are true:

- `0 <= i < j < k < arr.length`
- `|arr[i] - arr[j]| <= a`
- `|arr[j] - arr[k]| <= b`
- `|arr[i] - arr[k]| <= c`

Where `|x|` denotes the absolute value of `x`.

Return the number of good triplets.

**Constraints:**

- `3 <= arr.length <= 100`
- `0 <= arr[i] <= 1000`
- `0 <= a, b, c <= 1000`

## 基礎思路

本題要求我們計算陣列中滿足特定條件的三元組數量。
也就是說，要找出有多少組 $(i, j, k)$ 滿足 $0 \leq i < j < k < n$，並且三者之間的差距同時滿足 $|arr[i] - arr[j]| \leq a$、$|arr[j] - arr[k]| \leq b$、$|arr[i] - arr[k]| \leq c$ 這三個條件。

根據題目特性，我們可以做如下判斷：

- 每個三元組都必須同時滿足這三個限制條件，且三個索引需嚴格遞增且互不重複。
- 由於 $n$ 最大為 100，採用三重迴圈最多運算 $O(100^3)$，在本題的範圍內是可以接受的。

因此，由於其他進階做法提升有限，本題直接使用三重迴圈暴力檢查每個可能的三元組，即可有效求解。

## 解題步驟

### Step 1: 依序檢查三個位數

題目要求 `0 <= i < j < k < arr.length`，所以可以利用三重迴圈來檢查三個位數。

```typescript
let count = 0;

for (let i = 0; i < arr.length; i++) {
  for (let j = i + 1; j < arr.length; j++) {
    for (let k = j + 1; k < arr.length; k++) {
      // 檢查三個位數的差距
      if (
        Math.abs(arr[i] - arr[j]) <= a &&
        Math.abs(arr[j] - arr[k]) <= b &&
        Math.abs(arr[i] - arr[k]) <= c
      ) {
        count++
      }
    }
  }
}
```

## 時間複雜度

- 我們需要三重迴圈來檢查三個位數，所以時間複雜度為 $O(n^3)$。
- 總時間複雜度為 $O(n^3)$。

> $O(n^3)$

## 空間複雜度

- 只使用了常數的額外空間來存儲變量，所以空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
