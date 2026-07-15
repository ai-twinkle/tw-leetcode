# 3658. GCD of Odd and Even Sums

You are given an integer `n`. 
Your task is to compute the GCD (greatest common divisor) of two values:

- `sumOdd`: the sum of the smallest `n` positive odd numbers.

- `sumEven`: the sum of the smallest `n` positive even numbers.

Return the GCD of `sumOdd` and `sumEven`.

**Constraints:**

- `1 <= n <= 1000`

## 基礎思路

本題要求計算「前 `n` 個正奇數之和」與「前 `n` 個正偶數之和」的最大公因數。表面上看似需要逐一累加兩組數列並求 GCD，但實際上透過數學推導即可將整個問題化簡為一個常數時間的公式。

在思考解法時，可掌握以下核心觀察：

- **奇數和具有封閉形式**：
  前 `n` 個正奇數之和恰好等於 `n²`，這是一個經典的數學恆等式。

- **偶數和具有封閉形式**：
  前 `n` 個正偶數之和為 `2 + 4 + ... + 2n`，可提出因數後化為 `n × (n + 1)`。

- **相鄰整數互質**：
  `n` 與 `n + 1` 為相鄰整數，兩者除了 `1` 之外沒有共同因數，因此其最大公因數必為 `1`。

- **公因數可被提取化簡**：
  兩者皆含有因數 `n`，可將 `n` 提出後，剩餘部分的 GCD 便僅取決於 `n` 與 `n + 1` 的關係。

依據以上特性，可以採用以下策略：

- **利用封閉公式將兩個總和分別表示為 `n²` 與 `n × (n + 1)`**，避免任何迴圈累加。
- **透過 GCD 的因數提取性質，將 `gcd(n², n × (n + 1))` 化簡為 `n × gcd(n, n + 1)`**。
- **由於相鄰整數互質，最終結果直接等於 `n`**，可在常數時間內回傳答案。

此策略將原本看似需要迭代的計算徹底化簡，達到最精簡且安全的實作。

## 解題步驟

### Step 1：透過數學推導直接回傳結果

依據前述推導，前 `n` 個奇數之和為 `n²`，前 `n` 個偶數之和為 `n × (n + 1)`；由於 `gcd(n², n × (n + 1)) = n × gcd(n, n + 1) = n × 1 = n`，因此最終答案恆為 `n`，可直接回傳。

```typescript
// sumOdd = n^2，sumEven = n*(n+1)
// gcd(n^2, n*(n+1)) = n * gcd(n, n+1) = n * 1 = n
return n;
```

## 時間複雜度

- 僅執行單次常數運算並直接回傳；
- 不涉及任何迴圈或遞迴。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 未使用任何額外變數或資料結構；
- 僅回傳輸入值本身。
- 總空間複雜度為 $O(1)$。

> $O(1)$
