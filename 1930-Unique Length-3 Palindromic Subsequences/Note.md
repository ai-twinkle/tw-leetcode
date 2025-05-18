# 1930. Unique Length-3 Palindromic Subsequences

Given a string `s`, return the number of unique palindromes of length three that are a subsequence of `s`.

Note that even if there are multiple ways to obtain the same subsequence, 
it is still only counted once.

A palindrome is a string that reads the same forwards and backwards.
A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

- For example, "ace" is a subsequence of "abcde".

**Constraints:**

- `3 <= s.length <= 10^5`
- `s` consists of only lowercase English letters.

## 基礎思路

先找尋所有字母的最起始位置和最結束位置，然後再找尋中間的字母是否存在，如果存在則計數加一。

## 解題步驟

### Step 1: 找尋所有字母的最起始位置和最結束位置

```typescript
// 標記所有字母的最起始位置和最結束位置為 -1
const firstIndex = new Array(26).fill(-1);
const lastIndex = new Array(26).fill(-1);

for (let i = 0; i < n; i++) {
  // 利用 ASCII 碼計算字母的 index
  const charIndex = s.charCodeAt(i) - 'a'.charCodeAt(0);

  // 僅在第一次出現時更新最起始位置
  if (firstIndex[charIndex] === -1) {
    firstIndex[charIndex] = i;
  }

  // 持續更新最結束位置
  lastIndex[charIndex] = i;
}
```

### Step 2: 找尋中間的字母是否存在

```typescript
// 依序檢查所有字母
for (let i = 0; i < 26; i++) {
  const start = firstIndex[i];
  const end = lastIndex[i];

  // 若字母存在，且中間至少有一個字母時做計數
  if (start !== -1 && end !== -1 && end > start + 1) {
    const uniqueChars = new Set();

    // 找尋中間的獨一無二字母
    for (let j = start + 1; j < end; j++) {
      uniqueChars.add(s[j]);
    }
    
    // 計數加上獨一無二字母的數量
    result += uniqueChars.size;
  }
}
```

## 時間複雜度

- 由於需要遍歷所有字串內的字母，因此時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 不論字串內有多少字母，都僅需要建立兩個長度為 26 的陣列，因此空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
