# 1408. String Matching in an Array

Given an array of string `words`, return all strings in `words` that is a substring of another word. 
You can return the answer in any order.

**Constraints:**

- `1 <= words.length <= 100`
- `1 <= words[i].length <= 30`
- `words[i]` contains only lowercase English letters.
- All the strings of `words` are unique.

## 基礎思路

本題要求找出陣列 `words` 中，哪些字串是另一個字串的子字串。
由於 `words` 中所有字串皆唯一，因此只需判斷某字串是否完整出現在其他位置即可。

這題可以直接利用標準庫的字串操作來暴力解決：
- 對每個字串，檢查是否為陣列中其它任一字串的子字串，只要找到即可收錄。

## 解題步驟

### Step 1: 列舉並檢查每個字串是否為其他字串的子字串

對於 `words` 中的每個字串，遍歷陣列中的其他字串，判斷其是否包含當前字串。

- 若成立，則將該字串納入結果集合。

```typescript
return words.filter((word, i) => words.some((w, j) => i !== j && w.includes(word)));
```

## 時間複雜度

- 對於每一個字串（共有 $n$ 個），需與其它 $n-1$ 個字串比對，每次比對長度最多 $m$。
- 總時間複雜度為 $O(n^2 \times m)$。

> $O(n^2 \times m)$

## 空間複雜度

- 只需儲存結果陣列，最壞情況下空間為 $O(n)$。
- 沒有其他顯著額外空間開銷。
- 總空間複雜度為 $O(n)$。

> $O(n)$
