# 2131. Longest Palindrome by Concatenating Two Letter Words

You are given an array of strings `words`. 
Each element of `words` consists of two lowercase English letters.

Create the longest possible palindrome by selecting some elements from `words` and concatenating them in any order. Each element can be selected at most once.

Return the length of the longest palindrome that you can create. 
If it is impossible to create any palindrome, return `0`.

A palindrome is a string that reads the same forward and backward.

**Constraints:**

- `1 <= words.length <= 10^5`
- `words[i].length == 2`
- `words[i]` consists of lowercase English letters.

## 基礎思路

本題要求從給定的二字元字串陣列 `words` 中，挑選部分字串以任意順序拼接，形成盡可能長的回文串。每個字串最多只能使用一次，且每個字串恰由兩個小寫英文字母組成。

由此可見，題目的關鍵在於字串配對與對稱性：

- **對稱性質**：

  - 若一個字串的兩個字母相同 (如 `"aa"`)，則可直接放於回文的兩側，每兩個一組對稱放置；若有剩餘單一個，可放置於回文中央。
  - 若字串由兩個不同字母組成 (如 `"ab"`)，則必須尋找其相反字串 (`"ba"`) 與之配對，共同對稱地放置於回文的兩端。

- **計算策略**：

  - 先統計每種字串出現的次數。
  - 分別處理上述兩種情況，計算可構成的回文最大長度。

## 解題步驟

### Step 1：初始化頻率矩陣與必要常數

首先，設定必要常數與建立扁平化的字串頻率矩陣，以統計所有字串的出現次數。

```typescript
const characterCodeOffset = 97; // 字元 'a' 的 ASCII 編碼為 97
const alphabetSize = 26;

// 使用 Uint32Array 建立 26×26 的扁平化頻率表，空間固定為 676
const flatFrequencyMatrix = new Uint32Array(alphabetSize * alphabetSize);
```

### Step 2：統計所有字串的頻率

遍歷輸入陣列，透過 ASCII 編碼定位每個字串在頻率表中的位置，計算每個字串出現的次數。

```typescript
// 以 O(n) 時間統計每個字串出現頻率
const totalWords = words.length;
for (let wordIndex = 0; wordIndex < totalWords; wordIndex++) {
  const word = words[wordIndex];
  const firstLetterIndex = word.charCodeAt(0) - characterCodeOffset;
  const secondLetterIndex = word.charCodeAt(1) - characterCodeOffset;

  // 更新頻率表對應位置的計數
  flatFrequencyMatrix[firstLetterIndex * alphabetSize + secondLetterIndex]++;
}
```

### Step 3：處理兩字母相同的字串配對情形

逐一檢查兩字母相同的字串（如 `"aa"`, `"bb"`），每兩個字串可置於回文兩端，計算其貢獻的回文長度。

```typescript
let totalPalindromeLength = 0;
let foundCenterPiece = false;

// 檢查兩字母相同的字串 (例如："aa", "bb")
for (let letterIndex = 0; letterIndex < alphabetSize; letterIndex++) {
  const idx = letterIndex * alphabetSize + letterIndex;
  const count = flatFrequencyMatrix[idx];

  // 計算配對數量 (快速 floor(count / 2))
  const pairCount = count >>> 1;  
  totalPalindromeLength += pairCount * 4; // 每一對可增加 4 個字元至回文

  // 若剩餘單一字串，標記可作為回文中央字串使用
  if ((count & 1) === 1) {
    foundCenterPiece = true;
  }
}
```

### Step 4：處理兩字母不同的字串與其反向字串配對情形

對於不同字母組成的字串（如 `"ab"` 與 `"ba"`），其出現次數的最小值代表可構成的配對數量，計算所有這類字串可增加的回文長度。

```typescript
// 處理不同字母組合的字串配對 (如："ab" 與 "ba")
for (let first = 0; first < alphabetSize; first++) {
  const baseOffset = first * alphabetSize;
  for (let second = first + 1; second < alphabetSize; second++) {
    const forwardCount = flatFrequencyMatrix[baseOffset + second]; // 如："ab"
    const backwardCount = flatFrequencyMatrix[second * alphabetSize + first]; // 如："ba"

    // 可構成配對的字串數量為兩者的最小值，每對貢獻 4 個字元
    totalPalindromeLength += (forwardCount < backwardCount ? forwardCount : backwardCount) * 4;
  }
}
```

### Step 5：處理回文中央字串（若有）

若前述相同字母字串有餘下單一字串，則可放置於回文中央，額外增加 2 個字元的回文長度。

```typescript
// 若存在可放置中央的字串，回文長度額外增加 2 個字元
return totalPalindromeLength + (foundCenterPiece ? 2 : 0);
```

## 時間複雜度

- 統計字串頻率需遍歷整個陣列，耗費時間為 $O(n)$。
- 後續配對過程中，僅需對固定數量（26×26）的情形進行計算，耗費常數時間 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小（26×26）的扁平化頻率矩陣 `Uint32Array`，不隨輸入規模改變，耗費常數空間 $O(1)$。
- 其餘輔助變數也為固定數量，亦耗費常數空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
