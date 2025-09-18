# 3405. Count the Number of Arrays with K Matching Adjacent Elements

You are given three integers n, m, k. A good array arr of size n is defined as follows:

Each element in arr is in the inclusive range [1, m].
Exactly k indices i (where 1 <= i < n) satisfy the condition arr[i - 1] == arr[i].
Return the number of good arrays that can be formed.

Since the answer may be very large, return it modulo 109 + 7.

**Constraints:**

- `1 <= n <= 10^5`
- `1 <= m <= 10^5`
- `0 <= k <= n - 1`

## 基礎思路

此題本質為組合計數問題。目標是計算「長度為 $n$、元素介於 $1$ 到 $m$，且恰好有 $k$ 對相鄰元素相等」的陣列數量。

我們可以把問題分解為以下幾個步驟：

- **組合數**：

    - 先決定相鄰相等的位置，共有 $\binom{n-1}{k}$ 種方法。
- **元素選取**：

    - 第一個元素可自由選擇，共 $m$ 種可能。
    - 剩下的「不相鄰相等位置」的元素，必須與前一個元素不同，因此每個位置有 $m-1$ 種選法。
- **最終組合公式**：

$$
m \times \binom{n-1}{k} \times (m-1)^{n-1-k} \mod (10^9 + 7)
$$

為提升計算效率，需要透過快速冪與預計算階乘和反階乘，避免重複運算。

## 解題步驟

### Step 1：定義常數與變數

首先，定義本題會用到的常數與全域變數，包括質數模數 `MOD`、最大長度 `MAX_N`，以及用來儲存階乘和反階乘值的陣列。這是為了後續能有效進行組合數計算。

```typescript
const MOD = 1_000_000_007;
const MAX_N = 100_000;

const factorial = new Uint32Array(MAX_N + 1);        // 存儲 0 ~ MAX_N 的階乘
const inverseFactorial = new Uint32Array(MAX_N + 1); // 存儲 0 ~ MAX_N 的反階乘
```

### Step 2：初始化階乘和反階乘表

透過預處理，先計算好 $0$ 到 $MAX\_N$ 的階乘與反階乘值。
階乘部分為連乘積，反階乘則利用費馬小定理計算，能讓組合數計算快速完成。

```typescript
(function initializeFactorials(): void {
  factorial[0] = 1;
  for (let i = 1; i <= MAX_N; i++) {
    factorial[i] = (factorial[i - 1] * i) % MOD;
  }
  // 利用快速冪求得最大階乘的反元素
  inverseFactorial[MAX_N] = modularExponentiation(factorial[MAX_N], MOD - 2);
  // 反向遞推反階乘
  for (let i = MAX_N; i >= 1; i--) {
    inverseFactorial[i - 1] = (inverseFactorial[i] * i) % MOD;
  }
})();
```

### Step 3：實作 modulo 下的乘法函數（防止 JS 數字溢位）

JavaScript 原生運算在大數時容易失準，因此這裡使用自訂乘法演算法，以位運算模擬乘法，確保在 $a, b$ 很大時也不會溢位。

```typescript
function multiplyModulo(a: number, b: number): number {
  let result = 0;
  let x = a % MOD;
  let y = b;
  while (y > 0) {
    if (y & 1) {
      result += x;
      if (result >= MOD) {
        result -= MOD;
      }
    }
    x <<= 1;
    if (x >= MOD) {
      x -= MOD;
    }
    y >>>= 1;
  }
  return result;
}
```

### Step 4：實作快速冪函數（用於計算 modulo 下的冪次）

冪次運算若用暴力做法會超時，因此用「快速冪」法（Exponentiation by Squaring），大幅提升效率。

```typescript
function modularExponentiation(base: number, exponent: number): number {
  let result = 1;
  let b = base % MOD;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = multiplyModulo(result, b);
    b = multiplyModulo(b, b);
    e >>>= 1;
  }
  return result;
}
```

### Step 5：計算符合條件的陣列數量

主函數將前述所有輔助方法整合，進行條件判斷與組合數運算。

1. 檢查 k 合理性，若非法則直接回傳 0。
2. 利用階乘、反階乘快速計算 $\binom{n-1}{k}$。
3. 利用快速冪計算 $(m-1)^{n-1-k}$。
4. 將所有部分組合，得到最終答案。

```typescript
function countGoodArrays(n: number, m: number, k: number): number {
  if (k < 0 || k > n - 1) {
    return 0; // 無效的 k 值，直接回傳 0
  }

  // 計算組合數 C(n-1, k)
  const partial = multiplyModulo(inverseFactorial[k], inverseFactorial[n - 1 - k]);
  const combinationCount = multiplyModulo(factorial[n - 1], partial);

  // 計算 (m-1) 的 (n-1-k) 次方
  const powerTerm = modularExponentiation(m - 1, n - 1 - k);

  // 綜合：m * C(n-1, k) * (m-1)^(n-1-k) % MOD
  return (m * multiplyModulo(combinationCount, powerTerm)) % MOD;
}
```

## 時間複雜度

- 預計算階乘和反階乘需時 $O(n)$。
- 快速冪函數計算冪次需 $O(\log n)$。
- 主函數其他部分皆為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用額外的陣列儲存階乘與反階乘，大小 $O(n)$。
- 未使用其他動態空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
