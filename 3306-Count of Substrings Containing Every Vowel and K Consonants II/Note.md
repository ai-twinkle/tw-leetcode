# 3306. Count of Substrings Containing Every Vowel and K Consonants II

You are given a string `word` and a non-negative integer `k`.

Return the total number of substrings of `word` that 
contain every vowel (`'a'`, `'e'`, `'i'`, `'o'`, and `'u'`) at least once and exactly `k` consonants.

## 基礎思路

當我們需要快速計算一段序列中的子音個數時，使用前綴和 (prefix sum) 是一個非常有效的方法。
透過預先計算每個位置之前累積的子音數量，我們可以在常數時間內求得任一區間內的子音總數。

此外，為了滿足子字串必須包含所有母音的要求，我們需要動態追蹤每個母音的最後一次出現位置。
當遍歷到某個結尾索引時，根據這些記錄可以判斷從某些起始索引到當前結尾所形成的子字串是否已包含所有母音。
如果每個母音至少出現一次，就可以進一步利用前綴和的差值來驗證該子字串是否正好包含 k 個子音。

為了避免每次都重新計算合法起始點的前綴和，我們可以採用一個指標，隨著 rightIndex 的增加，不斷「啟用」那些已經成為合法起始點的索引，並將它們對應的前綴和值記錄在頻率表中。
這樣一來，在檢查每個結尾索引時，我們可以快速查詢到滿足條件的起始點數量，從而大幅提升解題效率。

> Tips:
> - 前綴和 (prefix sum) 的核心概念來自於「前綴和差」，即 `prefixSum[rightIndex] - prefixSum[leftIndex]` 可以得到 `[leftIndex, rightIndex]` 區間的和。

## 解題步驟

### Step 1: 前綴和陣列的建立
- 先計算 `prefixConsonantCount` 陣列，其中 `prefixConsonantCount[i]` 表示從字串開頭到索引 `i-1` 的子音個數。
- 同時，利用 `Uint8Array` 建立一個快速查詢表 `isVowel`，來判斷某個字元是否為母音（這裡利用 ASCII code 來檢查）。

```typescript
const n = word.length;
const prefixConsonantCount = new Int32Array(n + 1);
const isVowel = new Uint8Array(128);
isVowel['a'.charCodeAt(0)] = 1;
isVowel['e'.charCodeAt(0)] = 1;
isVowel['i'.charCodeAt(0)] = 1;
isVowel['o'.charCodeAt(0)] = 1;
isVowel['u'.charCodeAt(0)] = 1;

for (let i = 0; i < n; i++) {
  const charCode = word.charCodeAt(i);
  // 如果是母音，則加 0；否則加 1 來計算子音。
  prefixConsonantCount[i + 1] = prefixConsonantCount[i] + (isVowel[charCode] ? 0 : 1);
}
```

### Step 2: 使用滑動窗口和前綴頻率計數
- 使用一個頻率陣列 `prefixFrequency` 用來記錄每個前綴和值出現的次數。
- 利用一個指針 `validStartPointer` 來啟用所有可能成為起始點的索引，這些索引必須在「包含所有母音」的最小有效起始位置之前。

### Step 3: 追蹤母音的最後出現位置
- 定義變數 `lastA, lastE, lastI, lastO, lastU`，初始值皆為 -1，用以記錄每個母音最近一次出現的位置。
- 當遍歷到某個結尾索引時，更新對應母音的最後出現位置。

### Step 4: 檢查是否已包含所有母音
- 如果還有任一母音尚未出現，則跳過當前結尾索引。

### Step 5: 更新有效起始索引並統計結果
- 當所有母音均已出現，利用 `Math.min(lastA, lastE, lastI, lastO, lastU)` 得到最早的母音出現位置，此位置之前（包含此位置）的起始點皆能形成滿足母音條件的子字串。
- 將這些位置的前綴和計數累加到 `prefixFrequency` 中。
- 利用「前綴和差」公式：
    - 要求子字串 [L, rightIndex] 剛好有 k 個子音，需滿足：  
      `prefixConsonantCount[rightIndex + 1] - prefixConsonantCount[L] === k`  
      化簡可得：  
      `prefixConsonantCount[L] === prefixConsonantCount[rightIndex + 1] - k`
- 根據這個條件，從 `prefixFrequency` 中查找對應的前綴和次數，累加到最終答案。

```typescript
const prefixFrequency = new Uint32Array(n + 1);
let validStartPointer = 0;
let validSubstringCount = 0;

// 初始化各個母音的最後出現位置
let lastA = -1, lastE = -1, lastI = -1, lastO = -1, lastU = -1;

for (let rightIndex = 0; rightIndex < n; rightIndex++) {
  const currentCharCode = word.charCodeAt(rightIndex);
  // 更新各個母音的最後出現位置
  if (currentCharCode === 97) { // 'a'
    lastA = rightIndex;
  } else if (currentCharCode === 101) { // 'e'
    lastE = rightIndex;
  } else if (currentCharCode === 105) { // 'i'
    lastI = rightIndex;
  } else if (currentCharCode === 111) { // 'o'
    lastO = rightIndex;
  } else if (currentCharCode === 117) { // 'u'
    lastU = rightIndex;
  }

  // 當還未涵蓋所有母音時，跳過此結尾索引
  if (lastA === -1 || lastE === -1 || lastI === -1 || lastO === -1 || lastU === -1) {
    continue;
  }

  // 有效的起始索引必須小於等於所有母音的最早出現位置
  const minValidStartIndex = Math.min(lastA, lastE, lastI, lastO, lastU);

  // 將所有起始索引在 [validStartPointer, minValidStartIndex] 的前綴和累加到頻率表中
  while (validStartPointer <= minValidStartIndex) {
    prefixFrequency[prefixConsonantCount[validStartPointer]]++;
    validStartPointer++;
  }

  // 計算當前結尾索引下，符合 k 個子音的起始位置數量
  const targetPrefixSum = prefixConsonantCount[rightIndex + 1] - k;
  if (targetPrefixSum >= 0 && targetPrefixSum <= n) {
    validSubstringCount += prefixFrequency[targetPrefixSum];
  }
}
```

### Step 6: 返回結果
- 最後返回計算出的有效子字串數量。

```typescript
return validSubstringCount;
```

## 時間複雜度

- 前綴和陣列的建立需要遍歷一次字串，時間複雜度為 $O(n)$。
- 主要迴圈:
  - 外層迴圈同樣遍歷字串，每次更新母音的最後出現位置，以及計算 minValidStartIndex，這些操作均為常數時間，所以外層迴圈本身是 $O(n)$。
  - 內層的 while 迴圈用來「啟用」合法的起始索引。由於指標 validStartPointer 只會從 0 一直增加到最多 n（且不會回退），整個 while 迴圈在所有外層迴圈中的累計運行次數最多是 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 前綴和陣列使用大小為 `n+1` 的陣列，空間複雜度為 $O(n)$。
- 頻率陣列 `prefixFrequency` 也使用大小為 `n+1` 的陣列，空間複雜度為 $O(n)$。
- 其餘像是 `isVowel` 這樣的常數大小陣列，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
