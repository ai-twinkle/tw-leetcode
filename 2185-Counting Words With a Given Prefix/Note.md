# 2185. Counting Words With a Given Prefix

You are given an array of strings words and a string pref.
Return the number of strings in words that contain pref as a prefix.
A prefix of a string s is any leading contiguous substring of s.

## 基礎思路
我們需要找出所有以 `pref` 開頭的字串，並計算這些字串的總數。  
可以利用內建的字串操作與陣列過濾函式來高效實現。

## 解題步驟

### Step 1: 篩選符合條件的字串
使用 `filter` 方法篩選出所有以 `pref` 開頭的字串，並搭配 `startsWith` 方法進行前綴匹配。

### Step 2: 計算篩選結果的數量
篩選出符合條件的字串後，直接使用 `length` 屬性來計算結果數量。

```typescript
return words.filter((word) => word.startsWith(pref)).length;
```

## 時間複雜度

- 字串陣列的長度為 $n$，每個字串的前綴長度為 $m$，因為需要遍歷陣列中的每個字串，並檢查其前綴，則時間複雜度為 $O(n \cdot m)$ 
- 總時間複雜度為 $O(n \cdot m)$

> $O(n \cdot m)$

## 空間複雜度

- 在最壞情況下，篩選出的陣列可能包含所有字串，因此空間複雜度為 $O(k)$，其中 $k$ 是符合條件的字串數量（最壞情況 $k = n$）。
- 總空間複雜度為 $O(k)$

> $O(k)$

