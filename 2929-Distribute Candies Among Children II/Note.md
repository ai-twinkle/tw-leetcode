# 2929. Distribute Candies Among Children II

You are given two positive integers `n` and `limit`.

Return the total number of ways to distribute `n` candies among `3` children such that no child gets more than `limit` candies.

**Constraints:**

- `1 <= n <= 10^6`
- `1 <= limit <= 10^6`

## 基礎思路

本題需要將 $n$ 顆糖果分配給 3 個小孩，每個小孩最多不能超過 `limit` 顆糖果。
我們可使用組合數學中的「Stars and Bars」定理搭配「包含–排除原理」進行求解。

首先，若沒有上限限制，則將 $n$ 顆糖果任意分給 3 個小孩的方案數為：

$$
\binom{n + 2}{2}
$$

然而，題目有限制條件：每個小孩最多只能拿到 `limit` 顆糖果，因此我們必須排除「超出限制」的情況。

根據「包含–排除原理」，我們需枚舉恰好有 $i$ 個小孩超過上限的情況（每位小孩至少拿走 `limit + 1` 顆糖果），其餘糖果再自由分配。
對每種情況的總方案數，再依照奇偶性加減後累加，即可得到符合限制的總方案數。

因此，最終答案即為以下包含–排除公式：

$$
\sum_{i=0}^{3} (-1)^i \binom{3}{i}\binom{n - i \times (limit + 1) + 2}{2}
$$

## 解題步驟

### Step 1：初始化輔助變數

首先，建立包含–排除原理所需的係數陣列 `binom3`，以及用於累加答案的變數。

- `binom3` 是提前算好 $\binom{3}{0}=1$, $\binom{3}{1}=3$, $\binom{3}{2}=3$, $\binom{3}{3}=1$。
- `totalNumberOfWays` 負責儲存最終計算的答案。

```typescript
// 預先計算 binomial(3, i) 的值 (i = 0 到 3)
const binom3 = [1, 3, 3, 1];

let totalNumberOfWays = 0;
```

### Step 2：進行包含–排除原理的迴圈運算

對每個情況 $i$ (代表有幾個小孩超過上限)，計算扣除掉超出部分糖果後，剩下糖果的分配數量：

- `remaining` 計算扣除每個超過上限小孩的糖果數量之後，剩餘可自由分配的糖果數量。
- `waysToSum` 利用「Stars and Bars」公式，算出自由分配的方案數。
- `sign` 根據包含–排除原理的規則，交替正負加總。
- 最後加總到 `totalNumberOfWays`。

```typescript
// Loop i = 0 到 3 (包含–排除原理公式)
for (let i = 0; i <= 3; i++) {
  const remaining = n - i * (limit + 1);
  if (remaining < 0) {
    // 如果剩餘糖果數量不足，該情況貢獻為0，跳過
    continue;
  }

  // 計算沒有上限的情況下，分配剩餘糖果的方案數
  const waysToSum = ((remaining + 2) * (remaining + 1)) / 2;

  // 計算包含–排除的符號：i為偶數時為正，奇數時為負
  const sign = (i % 2 === 0) ? 1 : -1;

  // 累加計算結果
  totalNumberOfWays += sign * binom3[i] * waysToSum;
}
```

### Step 3：返回最終答案

完成計算後，回傳最後得到的總方案數。

```typescript
return totalNumberOfWays;
```

## 時間複雜度

- 迴圈次數固定 (4次)，且內部運算為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 使用的變數數量為固定，不隨輸入規模而改變。
- 總空間複雜度為 $O(1)$。

> $O(1)$
