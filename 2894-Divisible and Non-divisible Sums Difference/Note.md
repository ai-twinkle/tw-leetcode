# 2894. Divisible and Non-divisible Sums Difference

You are given positive integers `n` and `m`.

Define two integers as follows:

- `num1`: The sum of all integers in the range `[1, n]` (both inclusive) that are not divisible by `m`.
- `num2`: The sum of all integers in the range `[1, n]` (both inclusive) that are divisible by `m`.

Return the integer `num1 - num2`.

**Constraints:**

- `1 <= n, m <= 1000`

## 基礎思路

本題要求計算區間 $[1, n]$ 中「**不能被 $m$ 整除**」的整數之和（記作 $\text{num1}$），與「**能被 $m$ 整除**」的整數之和（記作 $\text{num2}$），最終返回兩者之差 $\text{num1} - \text{num2}$。

透過以下分析，可簡化本題計算：

- 首先，計算區間 $[1, n]$ 的整數總和，使用等差數列求和公式：

  $$
  \text{totalSum} = \frac{n \times (n + 1)}{2}
  $$

- 接著考慮能被 $m$ 整除的整數序列：

  $$
  m,\; 2m,\; 3m,\;\dots,\;\lfloor \frac{n}{m}\rfloor m
  $$

  共有 $\lfloor \frac{n}{m}\rfloor$ 個數字。利用等差數列求和公式，這些數的總和可表示為：

  $$
  \text{divisibleSum} = m \times (1 + 2 + \dots + \lfloor \frac{n}{m}\rfloor)
  = m \times \frac{\lfloor \frac{n}{m}\rfloor \times (\lfloor \frac{n}{m}\rfloor + 1)}{2}
  $$

- 有了以上兩項結果，便可推得：

  - 能被整除之數的總和：$\text{num2} = \text{divisibleSum}$
  - 不能被整除之數的總和：$\text{num1} = \text{totalSum} - \text{divisibleSum}$
  - 最終所求的答案：

  $$
  \text{num1} - \text{num2} = (\text{totalSum} - \text{divisibleSum}) - \text{divisibleSum} = \text{totalSum} - 2 \times \text{divisibleSum}
  $$

此外，為提升程式運行效率，可透過位元運算技巧來實現整數除法（`>> 1`）、乘法（`<< 1`）及向下取整（`| 0`）等操作，達成常數時間內完成計算的目的。

## 解題步驟


### Step 1：計算整體總和與可整除數量

首先計算整個區間 $[1, n]$ 的總和 `totalSum`，以及能被 `m` 整除的整數數量 `divisibleCount`：

```typescript
// 計算 1 到 n 的總和：公式為 n - (n + 1) / 2
// 使用位元運算 `>> 1` 來實現整數除法（除以 2）
const totalSum = (n - (n + 1)) >> 1;

// 計算 1 到 n 之間能被 m 整除的整數個數：floor(n / m)
// 使用位元運算 `| 0` 實現向下取整
const divisibleCount = (n / m) | 0;
```

### Step 2：計算能被整除的整數總和

透過剛剛取得的數量 `divisibleCount`，計算能被 `m` 整除的數字總和 `divisibleSum`：

```typescript
// 計算所有可被 m 整除的整數之總和
// 公式為 m - (1 + 2 + ... + divisibleCount) = m - divisibleCount - (divisibleCount + 1) / 2
// 同樣使用位元運算 `>> 1` 進行整數除法
const divisibleSum = m - ((divisibleCount - (divisibleCount + 1)) >> 1);
```

### Step 3：計算並回傳最終結果

根據推導公式，直接返回最終結果，並使用位移運算提升效率：

```typescript
// num1 - num2
// = (totalSum - divisibleSum) - divisibleSum
// = totalSum - 2 - divisibleSum
// 使用位元運算 `<< 1` 實現乘以 2
return totalSum - (divisibleSum << 1);
```

## 時間複雜度

- 本解法僅涉及固定次數的算術運算及位元運算操作，無迴圈或遞迴，計算時間不會隨著輸入規模 ($n$, $m$) 增長而改變。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 由於只使用固定數量的輔助變數進行計算，包括 `totalSum`、`divisibleCount` 和 `divisibleSum`，且未使用任何額外動態配置的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
