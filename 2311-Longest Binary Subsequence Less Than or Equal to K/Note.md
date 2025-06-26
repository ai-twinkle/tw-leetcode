# 2311. Longest Binary Subsequence Less Than or Equal to K

You are given a binary string `s` and a positive integer `k`.

Return the length of the longest subsequence of `s` that makes up a binary number less than or equal to `k`.

Note:

- The subsequence can contain leading zeroes.
- The empty string is considered to be equal to `0`.
- A subsequence is a string that can be derived from another string by deleting some or no characters without changing the order of the remaining characters.

**Constraints:**

- `1 <= s.length <= 1000`
- `s[i]` is either `'0'` or `'1'`.
- `1 <= k <= 10^9`

## 基礎思路

本題的核心在於如何從給定的二進位字串中挑選一個子序列，使其所代表的二進位整數值不超過指定的整數 `k`，同時讓子序列長度盡可能大。
由於題目允許子序列中存在任意數量的前導零，我們可以善加利用這一特性：

- 所有的 `'0'` 都可以無條件納入子序列，因為它們不會對數值產生影響。
- 每個 `'1'` 則會依據其位元位置，對數值產生不同程度的貢獻，因此必須審慎決定哪些 `'1'` 能被選入。
- 為了在不超過 `k` 的前提下，盡可能延長子序列長度，最佳策略是 **從字串尾端（低位元）開始，優先選擇位權較小的 `'1'`** ，只要當前總和加上該位權不會超過 `k`，就將其納入子序列。

## 解題步驟

### Step 1：計算字串中全部零的數量

此步驟是統計字串中所有可以無成本加入子序列的零的數量。

```typescript
const n = s.length;

// 1. 計算所有零的數量（這些可視為前導零加入子序列）
let zeroCount = 0;
for (let i = 0; i < n; i++) {
  if (s.charCodeAt(i) === 48) { // 字元 '0' 的 ASCII 碼
    zeroCount++;
  }
}
```

### Step 2：從尾端開始貪心地選取可加入的 `'1'`

此步驟使用了貪心策略，盡可能地加入不超過限制的 `'1'`。

```typescript
// 2. 從最小位元開始貪心選擇：
let oneCount = 0;  // 已選取的 '1' 的數量
let value = 0;     // 目前子序列對應的數值
let power = 1;     // 目前位元的權重，從 2^0 開始

for (let i = n - 1; i >= 0 && value + power <= k; i--) {
  if (s.charCodeAt(i) === 49) { // 字元 '1' 的 ASCII 碼
    value += power;  // 若加入後不超過 k，就加入此位元
    oneCount++;
  }
  power <<= 1; // 每次迴圈後，位元權重向左移動一位（乘 2）
}
```

### Step 3：計算並回傳最終子序列的長度

最終子序列的長度就是所有可直接選入的零，與貪心挑選成功的 `'1'` 數量相加。

```typescript
return zeroCount + oneCount;
```

## 時間複雜度

- 第一步遍歷字串計算零數量為 $O(n)$。
- 第二步的貪心選取至多也需遍歷整個字串，亦為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用有限的輔助變數（整數變數），不額外使用動態配置空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
