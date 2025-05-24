# 2559. Count Vowel Strings in Ranges

You are given a 0-indexed array of strings `words` and a 2D array of integers `queries`.

Each query `queries[i] = [l_i, r_i]` asks us to find the number of strings present in the range `l_i` to `r_i` (both inclusive) of `words` that start and end with a vowel.

Return an array `ans` of size `queries.length`, where `ans[i]` is the answer to the $i^{th}$ query.

Note that the vowel letters are `'a'`, `'e'`, `'i'`, `'o'`, and `'u'`.

**Constraints:**

- `1 <= words.length <= 10^5`
- `1 <= words[i].length <= 40`
- `words[i]` consists only of lowercase English letters.
- `sum(words[i].length) <= 3 * 10^5`
- `1 <= queries.length <= 10^5`
- `0 <= l_i <= r_i < words.length`

## 基礎思路

本題目要求高效回答多次查詢，每次查詢是問區間 $[l, r]$ 內，有多少字串「開頭和結尾都是母音」。
若每次查詢都從頭檢查一遍，複雜度太高（$O(nq)$），無法通過最大限制。

因此，我們要思考如何將多次區間查詢優化到 $O(1)$。
這類問題經常適合使用 **前綴和(Prefix Sum)** 技巧：

- 先把所有字串是否合格（開頭結尾皆為母音）預處理，標記出每個位置是否合格。
- 然後對這個布林陣列做前綴和，使我們能夠用一行式子計算任意區間合格數量。

這種設計能將**查詢降為常數時間**，總時間僅為 $O(n + q)$，且空間也只需 $O(n)$。
這樣就能有效應對題目規模。

## 解題步驟

### Step 1: 定義母音檢查輔助函數

我們需要一個函數來判斷單一字元是否為母音。

```typescript
const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function isVowel(char: string): boolean {
  return VOWELS.includes(char);
}
```

### Step 2: 初始化暫存陣列

我們需先初始化兩個暫存：

- `isStartAndEndVowel`：記錄每個字串首尾是否皆為母音 (1 或 0)。
- `prefixSum`：記錄每個位置之前合格字串的累計數。

```typescript
// 由於共有 words.length 個字串，所以我們需要一個長度為 words.length 的暫存
const isStartAndEndVowel: number[] = new Array(words.length).fill(0);

// Prefix Sum 由於是始自 1 開始紀錄，所以我們需要一個長度為 words.length + 1 的暫存
const prefixSum: number[] = new Array(words.length + 1).fill(0);
```

### Step 3: 遍歷並計算每個字串是否符合條件及累積和

遍歷每個字串，判斷開頭及結尾是否皆為母音，將結果記入 `isStartAndEndVowel`，同時計算 prefix sum。

```typescript
words.forEach((word, i) => {
  const startChar = isVowel(word[0]);                      // 檢查開頭是否為母音
  const endChar = isVowel(word[word.length - 1]);          // 檢查結尾是否為母音
  isStartAndEndVowel[i] = startChar && endChar ? 1 : 0;    // 如果開頭和結尾都是母音，則為 1，否則為 0
  prefixSum[i + 1] = prefixSum[i] + isStartAndEndVowel[i]; // 計算累積和
});
```

### Step 4: 計算每個 query 的答案

每個查詢只需利用 prefix sum 陣列做一次減法即可。

```typescript
return queries.map((query) => {
  const [start, end] = query;                   // 取得 query 的範圍
  return prefixSum[end + 1] - prefixSum[start]; // 計算答案
});
```

## 時間複雜度

- 預處理（檢查所有字串首尾）與前綴和計算皆需遍歷 $n$，時間複雜度 $O(n)$
- 查詢階段，每筆查詢 $O(1)$，總共 $q$ 筆查詢，複雜度 $O(q)$
- 總時間複雜度為 $O(n + q)$

> $O(n + q)$

## 空間複雜度

- `isStartAndEndVowel` 陣列長度 $n$
- `prefixSum` 陣列長度 $n + 1$
- 輔助變數與返回陣列忽略不計
- 總空間複雜度為 $O(n)$

> $O(n)$
