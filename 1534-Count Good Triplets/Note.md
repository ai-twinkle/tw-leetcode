# 1534. Count Good Triplets

Given an array of integers `arr`, and three integers `a`, `b` and `c`. 
You need to find the number of good triplets.

A triplet `(arr[i], arr[j], arr[k])` is good if the following conditions are true:

* `0 <= i < j < k < arr.length`
* `|arr[i] - arr[j]| <= a`
* `|arr[j] - arr[k]| <= b`
* `|arr[i] - arr[k]| <= c`

Where `|x|` denotes the absolute value of `x`.

Return the number of good triplets.

## 基礎思路

這題由於需要檢查三個位數互相之間的差距，所以可以利用三重迴圈來解題。

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
