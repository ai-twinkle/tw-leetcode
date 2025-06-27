# 2014. Longest Subsequence Repeated k Times

You are given a string `s` of length `n`, and an integer `k`. 
You are tasked to find the longest subsequence repeated `k` times in string `s`.

A subsequence is a string that can be derived from another string by deleting some or no characters without changing the order of the remaining characters.

A subsequence `seq` is repeated `k` times in the string s if `seq * k` is a subsequence of `s`, 
where `seq * k` represents a string constructed by concatenating `seq` `k` times.

- For example, `"bba"` is repeated `2` times in the string `"bababcba"`, because the string `"bbabba"`, 
  constructed by concatenating `"bba"` `2` times, is a subsequence of the string `"bababcba"`.

Return the longest subsequence repeated `k` times in string `s`. 
If multiple such subsequences are found, return the lexicographically largest one. 
If there is no such subsequence, return an empty string.

**Constraints:**

- `n == s.length`
- `2 <= n, k <= 2000`
- `2 <= n < k * 8`
- `s` consists of lowercase English letters.

## 基礎思路

本題的核心策略是透過**回溯（backtracking）與預處理**，快速搜尋所有可能滿足「在字串中重複 $k$ 次」的子序列中，最長且字典序最大的解答。

為了達成這目標，考量以下幾個關鍵步驟：

- 因為目標是找**最長且字典序最大**的子序列，所以從**最大可能長度**往下搜尋，一旦找到即可立即回傳。
- 由於題目的限制（子序列需重複 $k$ 次），可預先排除出現次數不足的字元，以減少搜尋空間。
- 使用一個有效的查詢資料結構（預處理的「下一位置表」）來檢查子序列是否存在，使搜尋過程能更有效率。
- 深度優先搜尋（DFS）每次皆嘗試加入最大字典序的字元，以確保首次找到的答案即為最優解。

## 解題步驟

### Step 1：字元編碼並篩選有效字元

首先將輸入的字串進行字元編碼（將字母轉換為 0–25），並篩選出現次數大於或等於 $k$ 的有效字元（從 `'z'` 到 `'a'` 排序）：

```typescript
const stringLength = s.length;
const asciiCodeOfA = 'a'.charCodeAt(0);
const alphabetSize = 26;

// 將字串s編碼為0到25的數字陣列
const encodedCharacters = new Uint8Array(stringLength);
for (let i = 0; i < stringLength; i++) {
  encodedCharacters[i] = s.charCodeAt(i) - asciiCodeOfA;
}

// 統計每個字元出現的次數
const characterCounts = new Uint16Array(alphabetSize);
for (let i = 0; i < stringLength; i++) {
  characterCounts[encodedCharacters[i]]++;
}

// 收集出現次數≥k的有效字元（由大到小）
const validCharacterCodes: number[] = [];
for (let code = alphabetSize - 1; code >= 0; code--) {
  if (characterCounts[code] >= k) {
    validCharacterCodes.push(code);
  }
}

// 若沒有有效字元，直接回傳空字串
if (validCharacterCodes.length === 0) {
  return "";
}
```

### Step 2：建立「下一位置表」以快速判斷子序列

建立一個預處理的資料結構 (`nextPositionTable`)，能夠快速查詢從某位置開始，下一個指定字元出現的位置：

```typescript
const totalRows = stringLength + 1;
const nextPositionTable = new Uint16Array(totalRows * alphabetSize);
const rowOffset = new Uint32Array(totalRows);

// 預計算每列的偏移量
for (let row = 0; row < totalRows; row++) {
  rowOffset[row] = row * alphabetSize;
}

// 初始化最後一列的所有位置為stringLength (無效位置)
for (let c = 0; c < alphabetSize; c++) {
  nextPositionTable[rowOffset[stringLength] + c] = stringLength;
}

// 從後往前填充nextPositionTable
for (let pos = stringLength - 1; pos >= 0; pos--) {
  const destBase = rowOffset[pos];
  const srcBase = rowOffset[pos + 1];

  // 複製下一列
  for (let c = 0; c < alphabetSize; c++) {
    nextPositionTable[destBase + c] = nextPositionTable[srcBase + c];
  }

  // 更新當前位置的字元位置
  nextPositionTable[destBase + encodedCharacters[pos]] = pos;
}
```

### Step 3：使用 DFS 搜尋滿足條件的子序列

透過 DFS，從最大可能長度開始搜尋，並在找到符合條件的子序列後立即返回：

```typescript
const maxPossibleLength = Math.floor(stringLength / k);
const prefixSequence = new Uint8Array(maxPossibleLength);
let answer = "";

// 從最大可能的子序列長度開始向下搜尋
for (let targetLength = maxPossibleLength; targetLength > 0; targetLength--) {
  // DFS搜尋函數
  const dfs = (depth: number): boolean => {
    if (depth === targetLength) {
      // 找到滿足條件的子序列，建立並回傳答案
      const chars = new Array<string>(targetLength);
      for (let i = 0; i < targetLength; i++) {
        chars[i] = String.fromCharCode(prefixSequence[i] + asciiCodeOfA);
      }
      answer = chars.join("");
      return true;
    }

    // 逐一嘗試有效字元（字典序由大到小）
    for (const code of validCharacterCodes) {
      prefixSequence[depth] = code;
      let scanPosition = 0;
      let ok = true;

      // 檢查當前序列重複k次是否為子序列
      for (let repetition = 0; repetition < k && ok; repetition++) {
        for (let i = 0; i <= depth; i++) {
          const nextIdx = nextPositionTable[rowOffset[scanPosition] + prefixSequence[i]];
          if (nextIdx === stringLength) {
            ok = false;
            break;
          }
          scanPosition = nextIdx + 1;
        }
      }

      // 若符合條件則繼續搜尋下一深度
      if (ok && dfs(depth + 1)) {
        return true;
      }
    }

    return false;
  };

  if (dfs(0)) {
    break;
  }
}
```

### Step 4：返回結果

```typescript
return answer;
```

## 時間複雜度

- 字串編碼及篩選字元為 $O(n)$。
- 預處理「下一位置表」需要 $O(26 \cdot n)$ 時間。
- DFS最壞情況可能達到指數級（但因題目條件嚴格，實際效能遠佳於最壞狀況）。
- 總時間複雜度為 $O(n \cdot 26 + V^{\frac{n}{k}}\cdot k \cdot \frac{n}{k})$ 其中 $V$ 為有效字元數目。

> $O(n \cdot 26 + V^{\frac{n}{k}}\cdot k \cdot \frac{n}{k})$

## 空間複雜度

- 字元編碼使用了 $O(n)$ 空間。
- `nextPositionTable` 使用了 $O(26 \cdot n)$ 空間。
- DFS遞迴呼叫最深為 $O(\frac{n}{k})$ 空間。
- 總空間複雜度為 $O(26 \cdot n)$

> $O(26 \cdot n)$
