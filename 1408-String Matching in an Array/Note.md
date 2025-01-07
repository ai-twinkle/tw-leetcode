# 1408. String Matching in an Array

Given an array of string words, return all strings in words that is a substring of another word. 
You can return the answer in any order.
A substring is a contiguous sequence of characters within a string

## 基礎思路
直接使用標準庫中的字符串操作就足以解決這個問題。

## 解題步驟

### Step 1: Return at first line

```typescript
return words.filter((word, i) => words.some((w, j) => i !== j && w.includes(word)));
```
很直接的解法，篩選出**位置不同**且**包含的字符串**的元素，返回即可。

## 時間複雜度
對於每個單詞(N個單詞)，我們對列表中的所有其他單詞執行子字符串檢查，每個子字符串檢查需要O(M)，其中m是字符串的平均長度。
因此，總時間複雜度為O(N^2 * M)。

## 空間複雜度
我們仍須要使用返回用的輸出陣列，因此空間複雜度為O(N)。
