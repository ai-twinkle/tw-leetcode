# 966. Vowel Spellchecker

Given a `wordlist`, we want to implement a spellchecker that converts a query word into a correct word.

For a given `query` word, the spell checker handles two categories of spelling mistakes:

- Capitalization: If the query matches a word in the wordlist (case-insensitive),
  then the query word is returned with the same case as the case in the wordlist.
    - Example: `wordlist = ["yellow"]`, `query = "YellOw"`: `correct = "yellow"`
    - Example: `wordlist = ["Yellow"]`, `query = "yellow"`: `correct = "Yellow"`
    - Example: `wordlist = ["yellow"]`, `query = "yellow"`: `correct = "yellow"`

- Vowel Errors: If after replacing the vowels `('a', 'e', 'i', 'o', 'u')` of the query word with any vowel individually,
  it matches a word in the wordlist (case-insensitive), then the query word is returned with the same case as the match in the wordlist.
    - Example: `wordlist = ["YellOw"]`, `query = "yollow"`: `correct = "YellOw"`
    - Example: `wordlist = ["YellOw"]`, `query = "yeellow"`: `correct = ""` (no match)
    - Example: `wordlist = ["YellOw"]`, `query = "yllw"`: `correct = ""` (no match)

In addition, the spell checker operates under the following precedence rules:

- When the query exactly matches a word in the wordlist (case-sensitive), you should return the same word back.
- When the query matches a word up to capitlization, you should return the first such match in the wordlist.
- When the query matches a word up to vowel errors, you should return the first such match in the wordlist.
- If the query has no matches in the wordlist, you should return the empty string.

Given some `queries`, return a list of words `answer`, where `answer[i]` is the correct word for `query = queries[i]`.

**Constraints:**

- `1 <= wordlist.length, queries.length <= 5000`
- `1 <= wordlist[i].length, queries[i].length <= 7`
- `wordlist[i]` and `queries[i]` consist only of only English letters.

## 基礎思路

本題要實作一個拼字檢查器，針對每個 `query` 依**優先順序**套用三種比對規則來找出正確字：

1. **完全一致（區分大小寫）**、2) **忽略大小寫**、3) **忽略母音差異**（將所有母音統一替換為 `*` 的「去母音」規格化）。
   關鍵在於：為了能在每個查詢以常數時間決策結果，我們先用 `wordlist` **預先建好三種索引**：

- 區分大小寫的 `Set`（處理完全一致）
- 忽略大小寫的 `hash map`（保留**最先出現**的對應，處理大小寫錯誤）
- 去母音後的 `hash map`（同樣保留**最先出現**的對應，處理母音錯誤）

查詢時依優先序逐一嘗試命中；若皆不命中則回傳空字串。母音快速判斷可用 **bitmask**（a,e,i,o,u）實作；去母音採「轉小寫＋母音→`*`」的單趟掃描以提升效率。

## 解題步驟

### Step 1：定義母音 bitmask（a,e,i,o,u）以便常數時間判斷

```typescript
// 針對 'a'..'z'（以 0 為起點的索引）建立母音的位元遮罩：a,e,i,o,u 對應位元 0,4,8,14,20
const VOWEL_BITMASK_A_TO_Z =
  (1 << 0) | (1 << 4) | (1 << 8) | (1 << 14) | (1 << 20);
```

### Step 2：實作「去母音」的字串規格化（轉小寫＋母音改為 `*`）

```typescript
function devowelWord(word: string): string {
  const length = word.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    let code = word.charCodeAt(i);

    // 針對 ASCII 大寫 A–Z 進行快速小寫轉換
    if (code >= 65 && code <= 90) {
      code |= 32;
    }

    const alphaIndex = code - 97; // 'a' => 0
    if (alphaIndex >= 0 && alphaIndex < 26) {
      if (((VOWEL_BITMASK_A_TO_Z >>> alphaIndex) & 1) === 1) {
        result += "*";
      } else {
        result += String.fromCharCode(code);
      }
    } else {
      result += String.fromCharCode(code);
    }
  }

  return result;
}
```

### Step 3：以 `wordlist` 建三種索引（精確、忽略大小寫、去母音）

```typescript
// 完全一致（區分大小寫）的集合
const caseSensitiveDictionary: Set<string> = new Set(wordlist);

// 忽略大小寫與去母音的雜湊表（僅記錄「最先出現」的匹配）
const caseInsensitiveDictionary: Record<string, string> = Object.create(null);
const devoweledDictionary: Record<string, string> = Object.create(null);

// 預先建立三種索引
for (let i = 0; i < wordlist.length; i++) {
  const word = wordlist[i];
  const lowerCaseWord = word.toLowerCase();

  if (caseInsensitiveDictionary[lowerCaseWord] === undefined) {
    caseInsensitiveDictionary[lowerCaseWord] = word;
  }

  const devoweledWord = devowelWord(lowerCaseWord);
  if (devoweledDictionary[devoweledWord] === undefined) {
    devoweledDictionary[devoweledWord] = word;
  }
}
```

### Step 4：依優先序處理每個 `query` 並回填答案

```typescript
// 預先配置輸出陣列
const output = new Array<string>(queries.length);

// 逐一處理查詢
for (let i = 0; i < queries.length; i++) {
  const query = queries[i];

  // 1. 完全一致（區分大小寫）
  if (caseSensitiveDictionary.has(query)) {
    output[i] = query;
  } else {
    // 2. 忽略大小寫
    const lowerCaseQuery = query.toLowerCase();
    const caseInsensitiveHit = caseInsensitiveDictionary[lowerCaseQuery];

    if (caseInsensitiveHit !== undefined) {
      output[i] = caseInsensitiveHit;
    } else {
      // 3. 去母音後比對
      const devoweledQuery = devowelWord(lowerCaseQuery);
      const devoweledHit = devoweledDictionary[devoweledQuery];

      if (devoweledHit !== undefined) {
        output[i] = devoweledHit;
      } else {
        // 4. 皆未命中
        output[i] = "";
      }
    }
  }
}

return output;
```

## 時間複雜度

- 預處理 `wordlist`：每個單字進行一次小寫化與去母音轉換，長度上限為常數 7，因此可視為對 `wordlist.length = W` 的線性處理。
- 查詢階段：對每個 `query` 進行最多三次常數時間查找（`Set` / `hash map`），加上長度至多 7 的去母音轉換，整體對 `queries.length = Q` 為線性。
- 總時間複雜度為 $O(W + Q)$。

> $O(W + Q)$

## 空間複雜度

- 需要儲存三種索引結構：`Set(wordlist)`、`caseInsensitiveDictionary`、`devoweledDictionary`，大小與 `wordlist` 成線性關係。
- 去母音與小寫轉換僅用到暫時字串，與單字長度（最大 7）成常數關係。
- 總空間複雜度為 $O(W)$。

> $O(W)$
