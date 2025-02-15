# 2698. Find the Punishment Number of an Integer

Given a positive integer `n`, return the punishment number of `n`.

The punishment number of `n` is defined as the sum of the squares of all integers `i` such that:

- `1 <= i <= n`
- The decimal representation of `i * i` can be partitioned into contiguous substrings such that 
- the sum of the integer values of these substrings equals `i`.

## 基本思路

這題會用到一個數學概念，其證明如下：

考慮一個十進位數 $N$，假設它的表示為
$$
N = d_k 10^k + d_{k-1} 10^{k-1} + \cdots + d_1 10^1 + d_0,
$$
其中每個 $d_i$ 都是 0 到 9 之間的數字。

在模 9 的意義下，我們有一個很重要的性質：
$$
10 \equiv 1 \pmod{9}.
$$
因此對於任意正整數 $n$，都有
$$
10^n \equiv 1^n = 1 \pmod{9}.
$$

把這個性質帶入 $N$ 的表示式中，可以得到：
$$
N \equiv d_k + d_{k-1} + \cdots + d_1 + d_0 \pmod{9}.
$$

也就是說，$N$ 除以 9 的餘數，恰好等於 $N$ 的各個數位之和除以 9 的餘數。這就是為什麼我們常說「數字和在模 9 意義下等同於原數」。

> 這個性質也常被用在「九數檢驗」(casting out nines)中，用來快速檢查計算錯誤。

對於 Punishment Number 來說，我們需要 $i^2$ 的各個子數字之和能夠組合成 $i$ 本身。注意到依據上面的性質，
$$
i^2 \equiv \text{(數字和)} \pmod{9}.
$$
若能將 $i^2$ 分割後的數字和組合得到 $i$，則必須有
$$
i^2 \equiv i \pmod{9}.
$$
這等價於
$$
i^2 - i \equiv 0 \pmod{9} \quad \Longrightarrow \quad i(i-1) \equiv 0 \pmod{9}.
$$
由於 $i$ 與 $i-1$ 互質，因此這個式子成立的充分必要條件是 $i$ 或 $i-1$ 必須被 9 整除。也就是說：
- 如果 $i$ 被 9 整除，則 $i \equiv 0 \pmod{9}$；
- 如果 $i-1$ 被 9 整除，則 $i \equiv 1 \pmod{9}$。

因此，只有當 $i \equiv 0$ 或 $1 \pmod{9}$ 時，$i^2$ 分割後的數字和才有可能組成 $i$。
這個條件雖然是必要條件，但並非充分條件，仍需遞迴檢查各種可能的切割方式。不過利用這個性質，我們可以大幅減少需要進一步檢查的 $i$ 的數量。

但是我們需要注意以下問題：
- 所有的 Punishment Number 都必須滿足這個性質，
- 但反過來並非所有滿足這個性質的數字都一定是 Punishment Number。
- 但是我們能利用這個性質來大幅減少計算量。

對於檢察我們可以採取遞迴的方式，對於每一個平方數值，我們進行切割，然後遞迴檢查另一部分是否滿足 Punishment Number 的性質。


## 解題步驟

### Step 1: 建構遞迴檢查函數

遞迴函數：從 s 的 index 位置開始，能否將剩餘數字切分後的整數和湊成 target

```typescript
function canPartition(s: string, index: number, target: number): boolean {
  // 當我們已經處理完所有的數字時，我們檢查剩餘的 target 是否為 0。
  if (index === s.length) {
    return target === 0;
  }

  let num = 0;
  // 找尋所有可能的切割點
  for (let i = index; i < s.length; i++) {
     // 累積當前分割的數字
     num = num * 10 + Number(s[i]);

     // 若累積的數字已超過 target，就沒必要往後繼續
     if (num > target) break;

     // 遞迴檢查：從 i+1 位置開始，剩下的部分是否能湊成 target - num
     if (canPartition(s, i + 1, target - num)) {
        return true;
     }
  }

  return false;
}
```

### Step 2: 主函數

主函數中，我們利用 `casting out nines` 的性質，檢查符合條件的數字。

```typescript
function punishmentNumber(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    // 利用「casting out nines」的必要條件：
    // 若 i ≡ 0 或 1 (mod 9) 才可能滿足 i ≡ (i^2 的各位和) (mod 9)
    if (i % 9 !== 0 && i % 9 !== 1) {
      continue;
    }

    const squareStr = (i * i).toString();
    if (canPartition(squareStr, 0, i)) {
      total += i * i;
    }
  }
  return total;
}
```


## 時間複雜度

- 對於每個從 $1$ 到 $n$ 的 $i$，我們需要處理 $i^2$ 的字串表示，其長度約為 $O(\log i)$ 位數。在最壞情況下，遞迴分割可能的方式數約為  
$$
2^{O(\log i)} = i^{2\log_{10}(2)}
$$
- 將所有 $i$ 的情況加總，總複雜度為  
$$
\sum_{i=1}^{n} O\Bigl(i^{2\log_{10}(2)}\Bigr) = O\Bigl(n^{1+2\log_{10}(2)}\Bigr).
$$

> $O\Bigl(n^{\,1+2\log_{10}(2)}\Bigr) \approx O(n^{1.60206})$

## 空間複雜度

- 遞迴的最大深度受 $i^2$ 的位數影響，約為 $O(\log i)$。當 $i \le n$ 時，最大深度為 $O(\log n)$。
- 總體空間複雜度為 $O(\log n)$。

> $O(\log n)$
