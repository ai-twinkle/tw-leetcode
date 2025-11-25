# 1015. Smallest Integer Divisible by K

Given a positive integer `k`, you need to find the length of the smallest positive integer `n` such that n is divisible by `k`, and `n` only contains the digit `1`.

Return the length of `n`. 
If there is no such `n`, return -1.

Note: `n` may not fit in a 64-bit signed integer.

**Constraints:**

- `1 <= k <= 10^5`

## 基礎思路

本題要找的是一個**只由數字 `1` 組成的正整數 `n`**（例如：`1`, `11`, `111`, ...），
使得它能被給定的正整數 `k` 整除，並回傳這個 `n` 的「位數長度」。若不存在則回傳 `-1`。

關鍵觀察有以下幾點：

1. **數字結構固定為「重複的 1」**
   第 1 個候選是 `1`，第 2 個是 `11`，第 3 個是 `111`，依此類推。
   這些數字可以用遞推的方式建立：

    * $R_1 = 1$
    * $R_2 = 11 = (R_1 * 10 + 1)$
    * $R_3 = 111 = (R_2 * 10 + 1)$

   因為數值本身可能非常巨大，實作上只能追蹤「除以 k 的餘數」。

2. **避免整數溢位：只追蹤餘數即可**
   若我們令 $r_i$ 為 $R_i \bmod k$，則有以下遞推關係：

   $$
   r_i = (r_{i-1} \times 10 + 1) \bmod k
   $$

   只要有某個 $i$ 使得 $r_i = 0$，就代表長度為 $i$ 的全 1 數字可以被 $k$ 整除。

3. **模運算中的鴿籠原理（餘數有限）**
   所有可能的餘數只有 $0, 1, ..., k-1$ 共 $k$ 種。
   若我們從長度 1 一路試到長度 $k$ 都沒有看到餘數 `0`，
   則必然已經出現「某個餘數重複」，之後只會在循環中打轉，不可能再得到新的餘數 `0`。
   因此 **最長只需要檢查長度 1 到 $k$** ，超過就可以直接判定為不存在。

4. **2 與 5 的整除性特例**
   任何只由 `1` 組成的數字，其尾數必為 `1`，
   因此不可能是 2 的倍數，也不可能是 5 的倍數。
   若 $k$ 含有質因數 2 或 5（亦即 $k \bmod 2 == 0$ 或 $k \bmod  5 == 0$），
   則不可能存在這樣的 $n$，直接回傳 `-1`。

綜合以上，我們可以以模擬「逐步建立全 1 數字的餘數」的方式來找解，
並利用 2/5 的特例與鴿籠原理控制迴圈上限。

## 解題步驟

### Step 1：特例判斷（必要條件）

若 `k` 可被 2 或 5 整除，repunit 不可能被其整除，因此立即返回 -1。

```typescript
// 若能被 2 或 5 整除，repunit 不可能被 k 整除
if (k % 2 === 0 || k % 5 === 0) {
  return -1;
}
```

### Step 2：初始化餘數並開始逐步構造 repunit

使用 `remainder` 表示當前 repunit 的餘數。
之後從長度 1 一路嘗試到 k，套用公式更新餘數。

```typescript
// 構造 repunit 時的餘數
let remainder = 0;
```

### Step 3：在迴圈中構造 repunit 的餘數並檢查是否可整除

每次迴圈將 repunit 往右擴增一位 `1`，並檢查餘數是否變為 0。
若是，立刻回傳長度；若直到長度 k 都無法整除，返回 -1。

```typescript
// 依鴿籠原理，最多只需搜尋到長度 k
for (let length = 1; length <= k; length++) {
  // 更新 remainder = (remainder * 10 + 1) % k
  remainder = remainder * 10 + 1;
  remainder = remainder % k;

  // 若餘數為 0，表示長度 length 即為答案
  if (remainder === 0) {
    return length;
  }
}

return -1;
```

## 時間複雜度

- 最多嘗試長度從 1 到 `k` 的所有候選長度，每次更新與檢查為常數時間；
- 迴圈內僅進行簡單整數運算與取模操作。
- 總時間複雜度為 $O(k)$。

> $O(k)$

## 空間複雜度

- 僅使用常數個變數（`remainder` 與計數變數 `length`）；
- 無額外與 `k` 成比例的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
