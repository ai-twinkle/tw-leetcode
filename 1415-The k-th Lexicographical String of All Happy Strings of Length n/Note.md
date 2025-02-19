# 1415. The k-th Lexicographical String of All Happy Strings of Length n

A happy string is a string that:

- consists only of letters of the set `['a', 'b', 'c']`.
- `s[i] != s[i + 1]` for all values of `i` from `1` to `s.length - 1` (string is 1-indexed).

For example, strings "abc", "ac", "b" and "abcbabcbcb" are all happy strings and strings 
"aa", "baa" and "ababbc" are not happy strings.

Given two integers `n` and `k`, consider a list of all happy strings of length n sorted in lexicographical order.

Return the kth string of this list or return an empty string if there are less than `k` happy strings of length `n`.

## 基礎思路

想像我們有一棵「選擇樹」：第一層有 3 個分支（代表 a、b、c），接下來每一層因為不能跟前一個字母重複，只剩 2 個分支。
這就像是一棵除了第一層外，每個節點都有兩個子節點的二叉樹。
我們要找第 k 個字串，就從樹頂開始，根據每個分支下有多少種可能來決定往哪個分支走：
* 如果 k 超過某個分支下所有字串的數量，就從 k 裡扣除那個數量，再看下一個分支；
* 若 k 落在某個分支的範圍內，就選擇該分支，然後繼續往下走。

每走一層，我們都在「剪枝」，縮小 k 的範圍，直到構造出完整的字串。如果 k 超過了總可能字串數，就直接返回空字串。

### 數學解析

我們進一步用數學來說明這個算法的核心思路，它實際上是在「前綴決策」的基礎上利用組合計數來「定位」第 $ k $ 個字串。

---

### 1. 總數量的計算

首先，對於長度為 $ n $ 的 happy string，第一個字符有 3 種選擇，之後的每個位置（共 $ n-1 $ 個位置）都有 2 種選擇（因為不能與前一個字符相同）。  
因此，總共的字符串數量為：
$$
\text{Total} = 3 \times 2^{n-1}
$$
如果 $ k > 3 \times 2^{n-1} $，則說明不存在第 $ k $ 個字符串，返回空字串。

---

### 2. 每個位置的決策：前綴與分支大小

考慮從左到右決定字符串的每個字符。我們假設當前已經確定了前 $ i $ 個字符（$ 0 \le i < n $），接下來的位置決策可以用「分支大小」來說明。

- **第一個字符：**

  候選集合為 $\{a, b, c\}$。  
  每個候選字符後面能生成的字符串數量為：
  $$
  2^{n-1}
  $$
  所以，可以把所有字符串分成三個區間：
    - 第一個區間（以 $ a $ 開頭）：數量為 $2^{n-1}$，對應 $ k = 1 $ 到 $ 2^{n-1} $；
    - 第二個區間（以 $ b $ 開頭）：數量為 $2^{n-1}$，對應 $ k = 2^{n-1}+1 $ 到 $ 2 \times 2^{n-1} $；
    - 第三個區間（以 $ c $ 開頭）：數量為 $2^{n-1}$，對應 $ k = 2 \times 2^{n-1}+1 $ 到 $ 3 \times 2^{n-1} $；

  如果 $ k $ 落在第一個區間，則第一個字符選 $ a $；若落在第二個區間，則選 $ b $，並且更新 $ k $ 為 $ k - 2^{n-1} $；依此類推。

- **後續字符：**

  假設前一個字符為 $ x $（$ x $ 為 $ a $、$ b $ 或 $ c $），那麼當前候選集合就變為 $\{a, b, c\} \setminus \{x\}$（例如若 $ x = a $，則候選集合為 $\{b, c\}$），每個候選字符後面能生成的字符串數量為：
  $$
  2^{n-i-1}
  $$
  其中 $ i $ 是當前正在決定的字符位置（從 0 開始計算）。同樣，候選字符按照字典序排序，第一個候選字符所對應的字符串區間大小為 $2^{n-i-1}$，若 $ k $ 超過這個大小，就減去這個數量，再考慮下一個候選字符。

## 解題步驟

### Step 1: 預先計算 Power of 2

為了方便後續計算，我們可以預先計算 $ 2^i $ 的值，存放在一個數組中。

```typescript
const powerOf2: number[] = Array(n + 1).fill(0);
for (let i = 0; i <= n; i++) {
  powerOf2[i] = 1 << i; // equivalent to 2^i
}
```

### Step 2: 判定 k 是否超出範圍

如果 $ k > 3 \times 2^{n-1} $，則直接返回空字串。

```typescript
const total = 3 * powerOf2[n - 1];

if (k > total) {
  return "";
}
```

### Step 3: 沿者選擇樹走到第 k 個字串

我們從第一個字符開始，根據上面的分析，逐步選擇下一個字符，直到構造出第 k 個字串。

```typescript
let result = "";
let prev = "";

for (let i = 0; i < n; i++) {
  // 先選擇候選集合
  let candidates: string[];
  if (i === 0) {
    // 第一個節點有 3 個分支
    candidates = ['a', 'b', 'c'];
  } else {
    // 其餘節點只有 2 個分支，並可以根據前一個字符來確定候選集合
    candidates = prev === 'a' ?
      ['b', 'c'] : prev === 'b' ?
        ['a', 'c'] : ['a', 'b'];
  }

  // 計算每個候選字符對應的字符串數量
  // 我們可以利用預先計算的 2 的冪次方值: groupSize = 2^(n - i - 1)
  const groupSize = powerOf2[n - i - 1];

  for (let letter of candidates) {
    if (k <= groupSize) {
      // 如果 k 落在這個候選字符對應的區間內
      // 我們可以將這個字符附加到結果中
      result += letter;
      prev = letter;
      break;
    }

    // 如果 k 超過這個區間，就減去這個區間的大小，再考慮下一個候選字符
    k -= groupSize;
  }
}
```

## 時間複雜度

- 預先計算 Power of 2 需要 $ O(n) $ 的時間
- 主迴圈從 0 到 $ n-1 $，每次迭代需要 $ O(1) $ 的時間，故時間複雜度為 $ O(n) $
- 總時間複雜度為 $ O(n) $

> $O(n)$

## 空間複雜度

- 需要一個長度為 $ n+1 $ 的數組來存放 Power of 2，空間複雜度為 $ O(n) $
- 結果字串的空間複雜度為 $ O(n) $
- 其他變量的空間複雜度為 $ O(1) $
- 總空間複雜度為 $ O(n) $

> $O(n)$
