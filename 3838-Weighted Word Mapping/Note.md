# 3838. Weighted Word Mapping

You are given an array of strings `words`, 
where each string represents a word containing lowercase English letters.

You are also given an integer array `weights` of length 26, 
where `weights[i]` represents the weight of the $i^{th}$ lowercase English letter.

The weight of a word is defined as the sum of the weights of its characters.

For each word, take its weight modulo 26 and map the result to a lowercase English letter using reverse alphabetical order 
(`0 -> 'z', 1 -> 'y', ..., 25 -> 'a'`).

Return a string formed by concatenating the mapped characters for all words in order.

**Constraints:**

- `1 <= words.length <= 100`
- `1 <= words[i].length <= 10`
- `weights.length == 26`
- `1 <= weights[i] <= 100`
- `words[i]` consists of lowercase English letters.

## 基礎思路

本題要求對給定的 `words` 陣列中的每個單字計算「字母權重總和」，並依以下流程產出最終字串：

1. 累加每個字母對應的權重；
2. 將總和對 26 取模；
3. 透過反向字母順序（0 → 'z'、1 → 'y'、...、25 → 'a'）將結果映射為單一字元；
4. 將所有單字對應的字元串接起來。

在思考解法時，可掌握以下核心觀察：

- **字母索引可由字元碼直接推得**：
  英文小寫字母於 ASCII 中為連續區段，因此 `charCode - 'a'` 即為該字母於權重陣列中的索引，無須額外建表。

- **反向字母順序可由減法直接表示**：
  若以 `'z'` 的字元碼為基準，則「結果索引 → 字元」的對應關係恰好等於 `'z' 的字元碼 - 索引值`，免去查表步驟。

- **每個單字之間互相獨立**：
  不同單字之間無相依關係，因此可以對每個單字獨立計算結果，依序輸出。

- **輸出僅由單一 ASCII 字元組成**：
  既然每個結果僅為單一 lowercase letter，便可使用 `Uint8Array` 儲存字元碼，最後一次性解碼為字串，避免反覆建立字串造成的額外開銷。

依據以上特性，採取的策略為：

- **預先儲存 `'a'` 與 `'z'` 的字元碼為常數**，省去重複計算；
- **對每個單字計算其字母權重總和**；
- **利用反向字母順序公式取得對應字元碼，寫入結果緩衝區**；
- **最後將整個緩衝區一次性解碼為字串輸出**。

此策略以最少的計算步驟與緊湊的資料結構完成所有映射，兼顧效率與可讀性。

## 解題步驟

### Step 1：預先計算字元編碼常數

為避免在迴圈中重複計算 `'a'` 與 `'z'` 的字元碼，先以常數儲存以便重複使用，同時取得單字數量以決定後續處理範圍。

```typescript
const wordCount = words.length;

// 'z' 的字元碼；反向字母映射的起點（0 → 'z'）
const zCharCode = 122;

// 'a' 的字元碼；用於索引權重陣列
const aCharCode = 97;
```

### Step 2：配置結果緩衝區

由於每個單字最終只會對應一個 ASCII 字元，使用 `Uint8Array` 儲存所有字元碼，以便最後一次性解碼成字串。

```typescript
// 以緊湊型別陣列收集映射後的字元碼，最後再一次性解碼
const resultCodes = new Uint8Array(wordCount);
```

### Step 3：遍歷每個單字並累加其字母權重

對每個單字，逐字取出其字元碼並減去 `'a'` 的字元碼以得到權重索引，將對應權重累加至 `weightSum` 中。

```typescript
for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {
  const word = words[wordIndex];
  const wordLength = word.length;
  let weightSum = 0;

  // 累加當前單字中每個字元的權重
  for (let charIndex = 0; charIndex < wordLength; charIndex++) {
    weightSum += weights[word.charCodeAt(charIndex) - aCharCode];
  }

  // ...
}
```

### Step 4：透過反向字母順序公式取得對應字元碼

將累加完成的權重對 26 取模，並以 `'z'` 的字元碼減去此餘數，即可直接對應到反向字母順序的目標字元碼，再寫入結果緩衝區。

```typescript
for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {
  // Step 3：取得當前單字並累加其字母權重

  // 反向字母映射：0 → 'z'、1 → 'y'、...、25 → 'a'
  resultCodes[wordIndex] = zCharCode - (weightSum % 26);
}
```

### Step 5：一次性將字元碼解碼為最終字串

所有單字皆已處理完畢，將整個 `resultCodes` 透過 `String.fromCharCode` 一次性解碼為字串並回傳。

```typescript
// 由收集到的字元碼一次性建構最終字串
return String.fromCharCode.apply(null, resultCodes as unknown as number[]);
```

## 時間複雜度

- 設單字數量為 `n`，最大單字長度為 `L`；
- 對每個單字需 `O(L)` 累加權重，並以 `O(1)` 完成映射；
- 最後解碼字串為 `O(n)`。
- 總時間複雜度為 $O(n \cdot L)$。

> $O(n \cdot L)$

## 空間複雜度

- 使用 `Uint8Array` 儲存 `n` 個字元碼；
- 其餘僅為固定數量的純量變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
