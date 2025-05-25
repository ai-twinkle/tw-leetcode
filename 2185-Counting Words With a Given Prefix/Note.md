# 2185. Counting Words With a Given Prefix

You are given an array of strings words and a string pref.
Return the number of strings in words that contain pref as a prefix.
A prefix of a string s is any leading contiguous substring of s.

**Constraints:**

- `1 <= words.length <= 100`
- `1 <= words[i].length, pref.length <= 100`
- `words[i]` and `pref` consist of lowercase English letters.

## 基礎思路

本題目標在於統計陣列 words 中，有多少個字串以指定前綴 `pref` 開頭。
直觀來說，只需對每個字串檢查其開頭是否與 `pref` 完全一致即可。

一個直觀方法是直接利用內建函式 `startsWith` 來達成，這樣可以簡化前綴匹配的過程。

## 解題步驟

### Step 1: 篩選符合條件的字串
使用 `filter` 方法篩選出所有以 `pref` 開頭的字串，並搭配 `startsWith` 方法進行前綴匹配。

### Step 2: 計算篩選結果的數量
篩選出符合條件的字串後，直接使用 `length` 屬性來計算結果數量。

```typescript
return words.filter((word) => word.startsWith(pref)).length;
```

## 時間複雜度

- 字串陣列的長度為 $n$，每個字串的前綴長度為 $m$，因為需要遍歷陣列中的每個字串，並檢查其前綴，則時間複雜度為 $O(n \times m)$ 
- 總時間複雜度為 $O(n \times m)$

> $O(n \times m)$

## 空間複雜度

- 在最壞情況下，篩選出的陣列可能包含所有字串，因此空間複雜度為 $O(k)$，其中 $k$ 是符合條件的字串數量（最壞情況 $k = n$）。
- 總空間複雜度為 $O(k)$

> $O(k)$
