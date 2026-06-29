# 1967. Number of Strings That Appear as Substrings in Word

Given an array of strings `patterns` and a string `word`, 
return the number of strings in `patterns` that exist as a substring in `word`.

A substring is a contiguous sequence of characters within a string.

**Constraints:**

- `1 <= patterns.length <= 100`
- `1 <= patterns[i].length <= 100`
- `1 <= word.length <= 100`
- `patterns[i]` and `word` consist of lowercase English letters.

## 基礎思路

本題要求計算 `patterns` 陣列中，有多少個字串是 `word` 的子字串。子字串的定義為連續出現於目標字串中的字元序列。

在思考解法時，可掌握以下核心觀察：

- **子字串判斷是獨立的**：
  每個 `patterns[i]` 是否為 `word` 的子字串，與其他 pattern 無關，可逐一獨立判斷。

- **問題規模極小**：
  `patterns` 最多 100 個，每個長度最多 100，`word` 最長也僅 100，因此無需複雜的字串搜尋演算法，直接利用語言內建的子字串查找即可。

依據以上特性，可採用以下策略：

- **逐一遍歷 `patterns`，對每個 pattern 判斷其是否出現在 `word` 中**，若成立則計數加一。
- **最終回傳累積計數**，即為符合條件的 pattern 數量。

此策略實作簡潔，且完全符合題目給定的規模限制。

## 解題步驟

### Step 1：初始化計數器

宣告 `count` 用於累積符合條件的 pattern 數量，初始值為 0。

```typescript
let count = 0;
```

### Step 2：遍歷所有 pattern 並判斷是否為子字串

逐一取出 `patterns` 中的每個字串，利用 `word.includes()` 判斷其是否為 `word` 的子字串；若成立，則將 `count` 加一。

```typescript
// 原生 includes 底層使用快速搜尋，在此規模限制下為最佳選擇
for (let index = 0; index < patterns.length; index++) {
  if (word.includes(patterns[index])) {
    count++;
  }
}
```

### Step 3：回傳最終計數結果

所有 pattern 判斷完畢後，`count` 即為答案，直接回傳。

```typescript
return count;
```

## 時間複雜度

- 設 `patterns` 長度為 $n$，`word` 長度為 $w$，每個 pattern 長度最大為 $p$；
- 對每個 pattern 執行一次子字串搜尋，最差為 $O(w \cdot p)$；
- 共需處理 $n$ 個 pattern。
- 總時間複雜度為 $O(n \cdot w \cdot p)$。

> $O(n \cdot w \cdot p)$

## 空間複雜度

- 僅使用固定數量的變數，無任何額外陣列或動態空間；
- `includes` 本身不需要額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
