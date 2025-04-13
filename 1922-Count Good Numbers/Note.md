# 1922. Count Good Numbers

A digit string is good if the digits (0-indexed) at even indices are even and 
the digits at odd indices are prime (`2`, `3`, `5`, or `7`).

For example, `"2582"` is good because the digits (`2` and `8`) at even positions are even and 
the digits (`5` and `2`) at odd positions are prime. 
However, `"3245"` is not good because 3 is at an even index but is not even.

Given an integer `n`, return the total number of good digit strings of length `n`. 
Since the answer may be large, return it modulo $10^9 + 7$.

A digit string is a string consisting of digits `0` through `9` that may contain leading zeros.

## 基礎思路

題目要求計算長度為 `n` 的**好數字字串**的數量。好數字字串定義如下：

- 偶數索引位置（0, 2, 4, …）上的數字必須是**偶數**（`0, 2, 4, 6, 8`）。
- 奇數索引位置（1, 3, 5, …）上的數字必須是**質數**（`2, 3, 5, 7`）。

因此，我們可以觀察出每個位置的選擇方式：

- 偶數索引位置（0, 2, 4, …）有 **5 種選擇**。
- 奇數索引位置（1, 3, 5, …）有 **4 種選擇**。

假設字串長度為偶數（例如 `n = 4`），則好數字字串的總數為：

$$(5 \times 4)^{n/2}$$

假設字串長度為奇數（例如 `n = 5`），則會多出一個偶數位置，因此總數為：

$$(5 \times 4)^{\lfloor n/2 \rfloor} \times 5$$

考量到指數可能非常大，必須使用**快速模冪**（Modular Exponentiation）計算：

$$(base^{exponent}) \mod mod$$

## 解題步驟

### Step 1：初始化快速模冪函數 `modPow`

快速模冪用來高效計算大指數次方的模數運算，實作如下：

```typescript
function modPow(base: bigint, exponent: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % mod;
    }
    base = (base * base) % mod;
    exponent = exponent / 2n;
  }
  return result;
}
```

### Step 2：根據字串長度計算好數字字串總數

#### Step 2.1：初始化常數

首先定義：

- 模數常數 `MOD` 為 $10^9 + 7$。
- 偶數位置可選數量 `evenCount` 為 `5`。
- 奇數位置可選數量 `oddCount` 為 `4`。

```typescript
function countGoodNumbers(n: number): number {
  const MOD = 1000000007n;
  const evenCount = 5n; // digits: 0, 2, 4, 6, 8
  const oddCount = 4n; // digits: 2, 3, 5, 7
  
  // ...
}
```

#### Step 2.2：計算偶數與奇數位置組合數量

由於每兩個位置（一偶一奇）組成一組，因此我們將字串長度除以 2（取整）計算基本組合次數：

```typescript
function countGoodNumbers(n: number): number {
  // 2.1：初始化常數
  
  const half = BigInt(Math.floor(n / 2));

  // ...
}
```

#### Step 2.3：區分奇偶情況進行計算

- **若字串長度為偶數 (`n % 2 === 0`)**：  
  此時偶數位置與奇數位置的數量相等，總共有 `n / 2` 組 `(evenIndex, oddIndex)`，  
  每組有 `5 * 4 = 20` 種組合方式，因此總數為：

  $$(5 \times 4)^{n/2}$$

- **若字串長度為奇數 (`n % 2 === 1`)**：  
  此時會比奇數位置多出一個偶數位置（第 0 位），因此需額外乘上一個偶數位置選擇數 `5`，  
  總數為：

  $$(5 \times 4)^{\lfloor n/2 \rfloor} \times 5$$

```typescript
function countGoodNumbers(n: number): number {
  // 2.1：初始化常數
  
  // 2.2：計算偶數與奇數位置組合數量
  
  if (n % 2 === 0) {
    return Number(modPow(evenCount * oddCount, half, MOD));
  } else {
    return Number((modPow(evenCount * oddCount, half, MOD) * evenCount) % MOD);
  }
}
```

## 時間複雜度

- **快速模冪函數 (`modPow`)**：指數每次減半，因此時間複雜度為 $O(\log n)$。
- 主函數僅調用一次快速模冪函數，因此整體的時間複雜度亦為 $O(\log n)$。
- 總時間複雜度 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 使用常數數量的額外空間 (`MOD`, `evenCount`, `oddCount`, `half`)，因此空間複雜度為 $O(1)$。
- 快速模冪函數中亦僅使用常數空間。
- 總空間複雜度 $O(1)$。

> $O(1)$
