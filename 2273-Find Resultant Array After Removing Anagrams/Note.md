# 2273. Find Resultant Array After Removing Anagrams

You are given a 0-indexed string array `words`, where `words[i]` consists of lowercase English letters.

In one operation, select any index `i` such that `0 < i < words.length` and `words[i - 1]` and `words[i]` are anagrams, and delete `words[i]` from `words`. 
Keep performing this operation as long as you can select an index that satisfies the conditions.

Return `words` after performing all operations. 
It can be shown that selecting the indices for each operation in any arbitrary order will lead to the same result.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase using all the original letters exactly once. 
For example, `"dacb"` is an anagram of `"abdc"`.

**Constraints:**

- `1 <= words.length <= 100`
- `1 <= words[i].length <= 10`
- `words[i]` consists of lowercase English letters.

## 基礎思路

本題要求我們移除陣列中**連續的字母異位詞（Anagram）**。
具體規則是：
若存在相鄰兩個單字 `words[i-1]` 與 `words[i]` 為異位詞，則刪除後者。
重複執行此操作，直到再也無法刪除為止。
題目也保證**刪除順序不影響最終結果**。

在思考解法時，我們需要注意以下幾個重點：

- **異位詞判斷**：兩字是否為異位詞，等價於其「字母出現頻率」相同。
  例如 `"abdc"` 與 `"dacb"` 的各字母出現次數完全一致。
- **連續性要求**：僅當相鄰兩字為異位詞時才刪除後者。
- **結果唯一性**：無論刪除順序如何，最終保留下來的字串序列都相同，因此可**線性掃描一次**完成。

為了解決這個問題，我們可以採用以下策略：

- **字母頻率雜湊**：建立一個固定長度為 26 的陣列（對應英文字母 a–z），統計每個字的字母出現次數，並以滾動多項式雜湊壓縮為單一整數。如此即可在 $O(L)$ 時間內生成一個可比較的「異位詞識別碼」。
- **線性過濾**：從左到右依序檢查每個字，若其雜湊值與前一個字相同（表示為異位詞），則跳過；否則加入結果。
- **預先雜湊加速**：先為所有單字預先計算雜湊，避免重複計算，提高執行效率。

透過這樣的設計，可以在 $O(n \cdot L)$ 時間內完成過濾，其中 $n$ 為字數、$L$ 為單字最大長度，對於題目給定的上限 ($n \le 100, L \le 10$) 來說，運行非常高效。

## 解題步驟

### Step 1：全域常數與頻率緩衝宣告

建立常數 `'a'` 的 ASCII 代碼與 26 長度的 `Uint8Array`，用於計算字母出現頻率。

```typescript
// 以 'a' 為基準的字元碼
const BASE_CHAR_CODE = 'a'.charCodeAt(0);

// 預先配置 26 長度的頻率緩衝陣列，對應 a~z
const FREQ_BUFFER = new Uint8Array(26);
```

### Step 2：`computeWordHash` — 計算單字的異位詞雜湊值

透過統計 26 個字母的出現頻率，使用多項式滾動雜湊產生唯一整數值，
確保相同字母組成的異位詞能產生相同雜湊結果。

```typescript
/**
 * 根據字母出現頻率計算單字雜湊值。
 * 保證異位詞能得到相同的雜湊結果。
 *
 * @param {string} word - 輸入單字（小寫英文字母）
 * @returns {number} 該字的雜湊值
 */
function computeWordHash(word: string): number {
  // 歸零頻率緩衝
  FREQ_BUFFER.fill(0);
  const length = word.length;

  // 統計字母頻率
  for (let i = 0; i < length; i++) {
    FREQ_BUFFER[word.charCodeAt(i) - BASE_CHAR_CODE]++;
  }

  // 以多項式滾動方式生成雜湊值
  let hashValue = 0;
  for (let i = 0; i < 26; i++) {
    hashValue = (hashValue * 131 + FREQ_BUFFER[i]) >>> 0;
  }

  return hashValue;
}
```

### Step 3：`removeAnagrams` — 移除相鄰異位詞

線性掃描所有單字，利用雜湊結果判斷是否與前一個為異位詞；
若相同則跳過，否則加入結果陣列。

```typescript
/**
 * 移除陣列中連續的異位詞，保留每組的第一個。
 *
 * @param {string[]} words - 單字陣列
 * @returns {string[]} 移除後的結果陣列
 */
function removeAnagrams(words: string[]): string[] {
  const resultWords: string[] = [];
  const precomputedHashes = new Uint32Array(words.length);

  // 預先計算所有單字的雜湊值
  for (let i = 0; i < words.length; i++) {
    precomputedHashes[i] = computeWordHash(words[i]);
  }

  let lastHash = -1;

  // 線性掃描比對相鄰雜湊值
  for (let i = 0; i < words.length; i++) {
    const currentHash = precomputedHashes[i];

    // 若與前一個字雜湊值相同，代表為異位詞，略過
    if (currentHash === lastHash) {
      continue;
    }

    // 否則更新前一個雜湊值並加入結果
    lastHash = currentHash;
    resultWords.push(words[i]);
  }

  // 回傳最終結果
  return resultWords;
}
```

## 時間複雜度

- `computeWordHash(word)`：需掃描單字長度 $L$ 並統計 26 個字母頻率，為 $O(L + 26) \approx O(L)$。
- 對所有 $n$ 個單字預先雜湊：$O(n \cdot L)$。
- 主迴圈比較相鄰雜湊值為 $O(n)$。
- 總時間複雜度為 $O(n \cdot L)$。

> $O(n \cdot L)$

## 空間複雜度

- 使用一個固定長度 26 的緩衝區 `FREQ_BUFFER`，為常數空間 $O(1)$。
- 額外的 `precomputedHashes` 陣列需儲存 $n$ 筆雜湊值，為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
