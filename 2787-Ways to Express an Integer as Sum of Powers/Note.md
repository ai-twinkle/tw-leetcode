# 2787. Ways to Express an Integer as Sum of Powers

Given two positive integers `n` and `x`.

Return the number of ways `n` can be expressed as the sum of the $x^{th}$ power of unique positive integers, 
in other words, the number of sets of unique integers $[n_1, n_2, ..., n_k]$ where $n = {n_1}^x + {n_2}^x + ... + {n_k}^x$.

Since the result can be very large, return it modulo `10^9 + 7`.

For example, if `n = 160` and `x = 3`, one way to express `n` is `n = 2^3 + 3^3 + 5^3`.

**Constraints:**

- `1 <= n <= 300`
- `1 <= x <= 5`

## 基礎思路

## 基礎思路

題目要求將整數 `n` 表示為若干個互異正整數的 $x$ 次方之和，並計算這樣的組合數量。這等價於從所有不超過 `n` 的 $x$ 次方數中，選擇若干個數字，使它們的總和恰好為 `n`，且每個數字最多使用一次。

觀察到這與經典的 **0/1 背包計數問題** 相同：

- 「物品」：所有 $b^x \le n$ 的數值。
- 「容量」：`n`。
- 「限制」：每個物品只能用一次（互異）。
- 「目標」：計算恰好湊出容量的方案數。

對於此問題，可採用 **一維 DP 且從大到小更新** 來確保互異性。令 `dp[s]` 表示和為 `s` 的方案數，初始 `dp[0] = 1`（空集合組成 0 的唯一方案），依次對每個 $b^x$ 更新 `dp[s] += dp[s - b^x]`（取模）。

由於題目限制 `1 ≤ n ≤ 300` 且 `1 ≤ x ≤ 5`，我們可在程式啟動時 **預先計算** 所有 `x = 1..5` 的 DP 表，之後查詢只需 O(1) 時間回傳結果，實現高效查詢。

## 解題步驟

### Step 1：全域常數與預建所有指數的 DP 表

- 定義 `MAXIMUM_SUM = 300`。
- 準備 `PRECOMPUTED_DYNAMIC_PROGRAMMING[0..5]`，其中 `0` 為未用的哨兵。
- 對 `exponent = 1..5` 逐一呼叫建表函式。

```typescript
const MAXIMUM_SUM = 300;

// 針對所有指數 1..5 預先建立 DP 表，讓之後查詢為 O(1)。
const PRECOMPUTED_DYNAMIC_PROGRAMMING: Int32Array[] = new Array(6);
PRECOMPUTED_DYNAMIC_PROGRAMMING[0] = new Int32Array(MAXIMUM_SUM + 1); // 未使用的哨兵

for (let exponent = 1; exponent <= 5; exponent++) {
  PRECOMPUTED_DYNAMIC_PROGRAMMING[exponent] = buildDynamicProgrammingForExponent(exponent);
}
```

### Step 2：為固定的指數建立一維 DP（0/1 背包計數）

- **收集可用次方數**：先用整數冪（含早停）計出所有 `≤ MAXIMUM_SUM` 的 $b^x$。
- **初始化 DP**：`dp[0] = 1`（空集合湊出 0 的方案）。
- **自大到小掃描**：對每個 `powerValue`，讓 `currentSum` 從 `MAXIMUM_SUM` 下降到 `powerValue`，累加方案數並做取模；下降掃描確保每個 `powerValue` 只用一次（互異）。

```typescript
/**
 * 為固定的指數建立 DP 表。
 * dynamicProgramming[s] = 將 s 表示為互異 x 次方和（<= MAXIMUM_SUM）的方案數。
 */
function buildDynamicProgrammingForExponent(exponent: number): Int32Array {
  const MODULUS = 1_000_000_007;

  // 以整數運算加上提早終止，計數並收集所有 <= MAXIMUM_SUM 的 x 次方。
  const count = countPowersUpToLimit(exponent, MAXIMUM_SUM);
  const powers = new Uint16Array(count);
  for (let base = 1, index = 0; index < count; base++) {
    const value = integerPowerLimited(base, exponent, MAXIMUM_SUM);
    if (value <= MAXIMUM_SUM) {
      powers[index++] = value;
    }
  }

  // 一維 DP（和維度），自大到小更新以確保每個次方數最多使用一次（互異性）。
  const dynamicProgramming = new Int32Array(MAXIMUM_SUM + 1);
  dynamicProgramming[0] = 1;

  const modulus = MODULUS;
  for (let i = 0; i < powers.length; i++) {
    const powerValue = powers[i];
    for (let currentSum = MAXIMUM_SUM; currentSum >= powerValue; currentSum--) {
      const candidate = dynamicProgramming[currentSum] + dynamicProgramming[currentSum - powerValue];
      dynamicProgramming[currentSum] = candidate >= modulus ? candidate - modulus : candidate;
    }
  }
  return dynamicProgramming;
}
```

### Step 3：計算「多少個底數」的冪不會超過上限

- 從 `base = 1` 開始試，若某次 `base^exponent > limit`，因為之後只會更大，直接停止。

```typescript
/**
 * 回傳滿足 base^exponent <= limit 的 base 個數。
 */
function countPowersUpToLimit(exponent: number, limit: number): number {
  let count = 0;
  for (let base = 1; ; base++) {
    if (integerPowerLimited(base, exponent, limit) > limit) {
      break;
    }
    count++;
  }
  return count;
}
```

### Step 4：以整數連乘計冪（超限立即回傳）

- 使用連乘避免浮點誤差與多餘計算；一旦超過 `limit`，立刻回傳 `limit + 1` 作為早停訊號。

```typescript
/**
 * 以整數計算 base^exponent；若任一步超過 limit，立即回傳 limit+1。
 * 這能避免浮點數 Math.pow 的額外開銷，並減少不必要的乘法。
 */
function integerPowerLimited(base: number, exponent: number, limit: number): number {
  let value = 1;
  for (let i = 0; i < exponent; i++) {
    value *= base;
    if (value > limit) {
      return limit + 1;
    }
  }
  return value;
}
```

### Step 5：O(1) 查詢答案

- 若 `x` 在允許範圍內，直接回傳預建表 `PRECOMPUTED_DYNAMIC_PROGRAMMING[x][n]`。
- 建表過程已完成取模。

```typescript
/**
 * 回傳將 n 表示為互異 x 次方和的方案數。
 * 因為已經預先建立，所以查詢為 O(1)；並使用 TypedArray 以降低常數開銷。
 */
function numberOfWays(n: number, x: number): number {
  // 題目保證 1 <= x <= 5 且 1 <= n <= 300。
  // 這裡保留保護機制；若指數越界則回傳 0。
  if (x < 1 || x > 5) {
    return 0;
  }
  return PRECOMPUTED_DYNAMIC_PROGRAMMING[x][n]; // 建表時已做過取模。
}
```

## 時間複雜度

- 離線建表（載入時計算一次）：對每個 `x`，有約 $\lfloor 300^{1/x}\rfloor$ 個物品，DP 成本為 $O(300 \cdot \lfloor 300^{1/x}\rfloor)$；總和 $x=1..5$。
- **單次查詢** `numberOfWays(n, x)`：陣列取值為 $O(1)$。
- 總時間複雜度為 $O(1)$（就查詢函式而言）。

> $O(1)$

## 空間複雜度

- 永久保存 5 張長度 `301` 的 DP 表：$O(5 \cdot 301)=O(MAXIMUM\_SUM)$。
- 建表時的暫時 `powers` 陣列：$O(\lfloor 300^{1/x}\rfloor)$。
- 總空間複雜度為 $O(MAXIMUM\_SUM)$。

> $O(MAXIMUM\_SUM)$
