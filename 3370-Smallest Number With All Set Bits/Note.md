# 3370. Smallest Number With All Set Bits

You are given a positive number `n`.

Return the smallest number `x` greater than or equal to `n`, such that the binary representation of `x` contains only set bits.

**Constraints:**

- `1 <= n <= 1000`

## 基礎思路

本題要我們找出一個最小的整數 `x`，使其滿足：

- `x ≥ n`；
- `x` 的二進位表示中所有位元皆為 `1`。

舉例來說：

- 若 `n = 5`，其二進位為 `101`，下一個「全為 1」的數字為 `111`（即 `7`）；
- 若 `n = 15`（即 `1111`），因其本身已是全為 1，故答案為 `15`。

在思考解法時，我們需要注意幾個重點：

- **「全為 1」的二進位形式**：這些數字皆可表示為 $2^k - 1$（例如 `1, 3, 7, 15, 31, ...`）。
- **目標條件**：需找到最小的此類數字且 ≥ `n`。
- **效率考量**：由於 `n ≤ 1000`，不需數學封閉式解法，線性倍增即可快速達成。

為了達成此目標，我們採取以下策略：

- **從最小全為 1 的數字開始**：由 `1`（即 `0b1`）起始；
- **倍增產生下一個「全為 1」模式**：每次透過 `current = current * 2 + 1` 生成 `3, 7, 15, ...`；
- **直到結果大於或等於 `n` 為止**：即為最小符合條件的解答。

## 解題步驟

### Step 1：初始化最小候選值

設定起始值為 `1`，即最小的「全為 1」二進位數字。

```typescript
// 起始於最小的「全為 1」候選值：1 (二進位為 1)
let allOnesCandidate = 1;
```

### Step 2：透過倍增方式生成下一個「全為 1」數字

不斷將目前候選值左移一位並加上 `1`（即乘 2 加 1），直到其值大於或等於 `n`。

```typescript
// 持續生成下一個「全為 1」模式，直到數值達到或超過 n
while (allOnesCandidate < n) {
  allOnesCandidate = allOnesCandidate * 2 + 1;
}
```

### Step 3：回傳符合條件的結果

當候選值首次滿足 `≥ n` 時，即為最小合法答案，直接回傳。

```typescript
// 回傳第一個符合條件的「全為 1」數字
return allOnesCandidate;
```

## 時間複雜度

- 每次倍增後值幾乎翻倍，最多進行約 $\log_2(n)$ 次迭代即可超過 `n`。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 僅使用常數變數儲存候選值與輸入 `n`。
- 總空間複雜度為 $O(1)$。

> $O(1)$
