# 1092. Shortest Common Supersequence

Given two strings `str1` and `str2`, return the shortest string that has both `str1` and `str2` as subsequences. 
If there are multiple valid strings, return any of them.

A string `s` is a subsequence of string `t` if deleting some number of characters from `t` (possibly `0`) results in the string `s`.

## 基礎思路

這題關鍵在於找到最短的共同超序列（Shortest Common Supersequence, SCS）， 
而其中的核心步驟就是利用最長公共子序列 (Longest Common Subsequence, LCS) 來解決。

基本邏輯是先找出兩個字串的 LCS，再將 LCS 以外的字元按照正確位置插入到 LCS 中，最終可得到最短的 SCS。

但是這樣無法達到最佳效率，因此我們考慮以下幾點改進我們的解法：

1. **共同前綴與共同後綴：**  
   如果 `str1` 與 `str2` 的起始或結尾部分已經相同，那這部分必然會出現在最終的 SCS 中。
   那麼只要先將這部分記錄下來，再對剩餘部分進行 LCS 的計算，可以減少 DP 表的計算範圍和重複運算。

2. **陣列操作的效率：**  
   在回溯過程中，若使用 `unshift` 操作，由於每次操作的時間複雜度為 $O(n)$，在大量數據下會影響效率。 
   因此，我們採用 `push` 收集字元，最後再將結果反轉（`reverse`），這樣可以大幅提升效能。

> Tips:
> - 如果可以不使用 `unshift`，盡量避免使用，因為在 JavaScript/TypeScript 中，`unshift` 的時間複雜度為 $O(n)$。

## 解題步驟

### Step 1: 如果本身字串相同，直接返回

如果 `str1` 與 `str2` 相同，那麼最短的 SCS 就是 `str1` 或 `str2` 本身。

```typescript
if (str1 === str2) return str1;
```

### Step 2: 移除共同前綴與共同後綴

接著我們將 `str1` 與 `str2` 的共同前綴與共同後綴部分移除，並記錄下來。

```typescript
// 移除共同前綴
let commonPrefix = "";
while (str1.length > 0 && str2.length > 0 && str1[0] === str2[0]) {
  commonPrefix += str1[0];
  str1 = str1.slice(1);
  str2 = str2.slice(1);
}

// 移除共同後綴
let commonSuffix = "";
while (
  str1.length > 0 &&
  str2.length > 0 &&
  str1[str1.length - 1] === str2[str2.length - 1]
  ) {
  commonSuffix = str1[str1.length - 1] + commonSuffix;
  str1 = str1.slice(0, -1);
  str2 = str2.slice(0, -1);
}
```

### Step 3: 計算 LCS

接著我們先記錄需要計算部分的長度，然後構建 DP 表，然後計算 LCS 的長度。

```typescript
const len1 = str1.length;
const len2 = str2.length;

// Build the DP table for the LCS length.
// dp[i][j] represents the length of the LCS for str1[0..i-1] and str2[0..j-1].
const dp: number[][] = Array.from({ length: len1 + 1 }, () =>
  Array(len2 + 1).fill(0)
);

for (let i = 1; i <= len1; i++) {
  for (let j = 1; j <= len2; j++) {
    if (str1[i - 1] === str2[j - 1]) {
      dp[i][j] = 1 + dp[i - 1][j - 1];
    } else {
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
}
```

### Step 4: 回溯 LCS

當計算完 LCS 的長度後，我們可以透過回溯的方式，找出 LCS 的內容。
這裡需要注意的是，我們是反向回溯，因為我們是從右下角開始計算的。

```typescript
// 反向回溯，構建最短共同超序列
let i = len1;
let j = len2;
const sequence: string[] = [];

// 使用 `push` 收集字元 (這裡是反向收集)
while (i > 0 && j > 0) {
  if (str1[i - 1] === str2[j - 1]) {
    // 當字元相同時，將字元加入 LCS 中
    sequence.push(str1[i - 1]);
    i--;
    j--;
  } else if (dp[i - 1][j] > dp[i][j - 1]) {
    // 如果左邊的值大於上面的值，則優先選擇 str1 的字元
    sequence.push(str1[i - 1]);
    i--;
  } else {
    // 否則選擇 str2 的字元
    sequence.push(str2[j - 1]);
    j--;
  }
}

// 我們需要將剩餘的 str1 字元加入 LCS 中
while (i > 0) {
  sequence.push(str1[i - 1]);
  i--;
}

// 同理，將剩餘的 str2 字元加入 LCS 中
while (j > 0) {
  sequence.push(str2[j - 1]);
  j--;
}
```

### Step 5: 組合最短共同超序列

最後，我們將前面計算的序列反轉，然後加上共同前綴與共同後綴，即可得到最短的 SCS。

```typescript
// 反轉在回溯過程中收集的 LCS 序列
const middleSequence = sequence.reverse().join('');
// 把共同前綴、中間序列、共同後綴組合起來就是最短共同超序列
return commonPrefix + middleSequence + commonSuffix;
```

## 時間複雜度

- **Prefix/Suffix Removal:**  
  檢查共同前綴與後綴需要逐個比對，最壞情況下為 $O(\min(m, n))$ （其中 $m$ 與 $n$ 分別為兩字串的長度）。

- **DP Table Construction:**  
  建立並填充 DP 表需要兩層迴圈，最壞情況下會進行 $O(m \times n)$ 的運算。

- **Backtracking:**  
  從 DP 表回溯來構造中間序列，最壞情況下需要 $O(m + n)$ 的時間。

- **Array Reverse:**  
  將收集結果反轉的操作時間為 $O(m + n)$。

- 總時間複雜度為 $O(\min(m, n)) + O(m \times n) + O(m+n) \approx O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- **DP Table:**  
  儲存 DP 表需要 $O((m+1) \times (n+1))$ 空間，簡化後為 $O(m \times n)$。

- **Sequence Array:**  
  回溯過程中存放結果的陣列最壞情況下大小為 $O(m+n)$。

- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
