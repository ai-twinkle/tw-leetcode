# 2942. Find Words Containing Character

You are given a 0-indexed array of strings `words` and a character `x`.

Return an array of indices representing the words that contain the character `x`.

Note that the returned array may be in any order.

**Constraints:**

- `1 <= words.length <= 50`
- `1 <= words[i].length <= 50`
- `x` is a lowercase English letter.
- `words[i]` consists only of lowercase English letters.

## 基礎思路

題目要求從給定的字串陣列中，找出所有包含特定字元 `x` 的字串索引，這個問題的核心即是「檢索特定元素」。

考慮到陣列長度和字串長度都相對較小，因此：

- 直接以簡單的逐一遍歷方式，即可有效完成任務。
- 使用 JavaScript 內建的 `.indexOf()` 方法，快速檢查字串是否包含特定字元。

透過這種方式，我們即可輕鬆地獲得所有符合條件的字串索引。

## 解題步驟

### Step 1：初始化與資料結構

```typescript
const wordsCount = words.length;    // 字串陣列的總數量
const resultIndices: number[] = []; // 儲存符合條件字串索引的結果陣列
```

### Step 2：遍歷所有字串，尋找符合條件的字串

我們使用一個迴圈從索引 `0` 到 `wordsCount - 1` 遍歷陣列中的每個字串：

```typescript
for (let wordIndex = 0; wordIndex < wordsCount; wordIndex++) {
  if (words[wordIndex].indexOf(x) !== -1) {
    resultIndices.push(wordIndex);    // 將符合條件的字串索引加入結果
  }
}
```

### Step 3：返回最終結果

```typescript
return resultIndices;
```

## 時間複雜度

- **遍歷字串陣列**：需要遍歷陣列中所有元素，設元素數量為 $n$，每個字串長度最多為 $m$，單一字串檢查字符包含的操作最差需要 $O(m)$。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- **儲存結果陣列**：最壞情況下，每個字串都符合條件，需儲存 $n$ 個索引，因此需要 $O(n)$ 的空間。
- 其他變數僅需常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
