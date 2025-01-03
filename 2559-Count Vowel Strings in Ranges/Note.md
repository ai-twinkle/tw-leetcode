# 2559. Count Vowel Strings in Ranges
You are given a 0-indexed array of strings words and a 2D array of integers queries.
Each query queries[i] = [li, ri] asks us to find the number of strings present in the range li to ri (both inclusive) of words that start and end with a vowel.
Return an array ans of size queries.length, where ans[i] is the answer to the ith query.
Note that the vowel letters are 'a', 'e', 'i', 'o', and 'u'.

## 基礎思路
為了降低時間複雜度，我們可以先計算累計的結果，再來計算每個 query 的答案。
當查詢 n ~ m 的答案時，我們可以用 m 的答案減去 n-1 的答案，就可以得到 n ~ m 的答案。

## 解題步驟

### Step 1: 定義 Helper Function

這能幫助我們檢查char是否為母音。
```ts
const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function isVowel(char: string): boolean {
  return VOWELS.includes(char);
}
```

### Step 2: 初始化暫存

我們需要一個暫存來記錄每個字串的開頭和結尾是否為母音。
另外，我們也需要一個暫存來記錄每個字串的累積和。
```ts
// 由於共有 words.length 個字串，所以我們需要一個長度為 words.length 的暫存
const isStartAndEndVowel = new Array(words.length).fill(0);

// Prefix Sum 由於是始自 1 開始紀錄，所以我們需要一個長度為 words.length + 1 的暫存
const prefixSum = new Array(words.length + 1).fill(0);
```

### Step 3: 計算每個字串的開頭和結尾是否為母音

```ts
words.forEach((word, i) => {
  const startChar = isVowel(word[0]);                      // 檢查開頭是否為母音
  const endChar = isVowel(word[word.length - 1]);          // 檢查結尾是否為母音
  isStartAndEndVowel[i] = startChar && endChar ? 1 : 0;    // 如果開頭和結尾都是母音，則為 1，否則為 0
  prefixSum[i + 1] = prefixSum[i] + isStartAndEndVowel[i]; // 計算累積和
});
```

### Step 4: 計算每個 query 的答案

```ts
return queries.map((query) => {
  const [start, end] = query;                   // 取得 query 的範圍
  return prefixSum[end + 1] - prefixSum[start]; // 計算答案
});
```

## 時間複雜度
由於 words 的長度為 n，queries 的長度為 q，所以時間複雜度為 O(n + q)。

## 空間複雜度
由於我們需要兩個暫存來記錄每個字串的開頭和結尾是否為母音，以及累積和，所以空間複雜度為 O(n)。
