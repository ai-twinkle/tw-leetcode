# 342. Power of Four

Given an integer `n`, return `true` if it is a power of four. 
Otherwise, return `false`.

An integer `n` is a power of four, if there exists an integer `x` such that `n == 4^x`.

**Constraints:**

- `-2^31 <= n <= 2^31 - 1`

## 基礎思路

題目要求判斷整數 $n$ 是否為 $4$ 的冪，即是否存在整數 $x$ 使得 $n = 4^x$。
解題前可以先觀察特性：

1. 若 $n \le 0$，因為 $4^x$ 對任何整數 $x$ 都大於 0，所以必定不是 4 的冪。
2. 若 $n > 0$，可以透過「反覆除以 4」的方式檢驗：

    - 如果 $n$ 是 $4$ 的冪，持續除以 $4$ 最終一定會變成 $1$。
    - 若在過程中出現不能整除 $4$ 的情況，代表它含有其他質因數，不可能是 4 的冪。

因此可以採取迭代策略：先處理邊界情況，接著在 $n % 4 === 0$ 的情況下反覆執行 $n /= 4$，最後檢查結果是否為 $1$。

## 解題步驟

### Step 1：處理無效與邊界情況（$n \le 0$）

```typescript
// 負數與 0 不可能是 4 的冪
if (n <= 0) {
  return false;
}
```

### Step 2：能整除 4 就持續約簡

```typescript
// 只要 n 可被 4 整除就持續除以 4
while (n % 4 === 0) {
  n /= 4;
}
```

### Step 4：檢查是否約簡為 1

```typescript
// 若最後 n 變為 1，代表原本是 4 的冪；否則不是
return n === 1;
```

## 時間複雜度

- **邊界檢查**：$O(1)$。
- **迴圈**：每次將 $n$ 除以 4，最多執行 $\lfloor \log_4 n \rfloor$ 次，時間複雜度為 $O(\log n)$。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 僅使用常數額外變數，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
