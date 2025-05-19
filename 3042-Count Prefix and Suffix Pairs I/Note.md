# 3042. Count Prefix and Suffix Pairs I

You are given a 0-indexed string array `words`.

Let's define a boolean function `isPrefixAndSuffix` that takes two strings, `str1` and `str2`:

- `isPrefixAndSuffix(str1, str2)` returns true if `str1` is both a prefix and a suffix of `str2`, and `false` otherwise.

For example, `isPrefixAndSuffix("aba", "ababa")` is `true` because `"aba"` is a prefix of `"ababa"` and also a suffix, 
but `isPrefixAndSuffix("abc", "abcd")` is `false`.

Return an integer denoting the number of index pairs `(i, j)` such that `i < j`, 
and `isPrefixAndSuffix(words[i], words[j])` is `true`.

**Constraints:**

- `1 <= words.length <= 50`
- `1 <= words[i].length <= 10`
- `words[i]` consists only of lowercase English letters.

## 基礎思路

拆解成兩個迴圈，第一個迴圈從 `0` 到 `n-1`，第二個迴圈從 `i+1` 到 `n-1`，判斷 `words[i]` 是否為 `words[j]` 的 prefix 和 suffix。

## 解題步驟

### Step 1: 拆解成兩個迴圈

```typescript
let count = 0;
// 第一個迴圈從 0 到 n-1
for (let i = 0; i < words.length; i++) {
  // 第二個迴圈從 i+1 到 n-1，這避免了向前比對，進而提升效能
  for (let j = i + 1; j < words.length; j++) {
    // 用字串的 startsWith 和 endsWith 方法判斷是否為 prefix 和 suffix
    if (words[j].startsWith(words[i]) && words[j].endsWith(words[i])) {
      count++;
    }
  }
}
```

## 時間複雜度

- 共有兩個迴圈，且隨著 $n$ 的增加，時間複雜度會呈現 $n^2$ 的成長。
- 總時間複雜度為$O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 只使用了常數空間，與 $n$ 無關。
- 總空間複雜度為$O(1)$。

> $O(1)$
