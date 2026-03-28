# 2573. Find the String with LCP

We define the `lcp` matrix of any 0-indexed string `word` of `n` lowercase English letters as an `n x n` grid such that:

- `lcp[i][j]` is equal to the length of the longest common prefix between the substrings `word[i,n-1]` and `word[j,n-1]`.

Given an `n x n` matrix `lcp`, return the alphabetically smallest string `word` that corresponds to `lcp`. 
If there is no such string, return an empty string.

A string `a` is lexicographically smaller than a string `b` (of the same length) 
if in the first position where `a` and `b` differ, 
string `a` has a letter that appears earlier in the alphabet than the corresponding letter in `b`. 
For example, `"aabd"` is lexicographically smaller than `"aaca"` because the first position they differ is at the third letter, 
and `'b'` comes before `'c'`.

**Constraints:**

- `1 <= n == lcp.length == lcp[i].length <= 1000`
- `0 <= lcp[i][j] <= n`

## 基礎思路

本題要求從一個給定的 LCP 矩陣反推出字典序最小的原始字串，若矩陣不合法則回傳空字串。核心挑戰在於：LCP 矩陣蘊含了字串中各位置字元之間的相等關係，必須從中還原出一致且合法的字元分配。

在思考解法時，可掌握以下核心觀察：

- **LCP 大於零代表字元相同**：
  若兩個位置的最長公共前綴長度大於零，代表這兩個位置的字元必然相同；反之若 LCP 為零，則字元必然不同。這個關係提供了字元分配的強制約束。

- **貪婪策略保證字典序最小**：
  每個尚未分配字元的位置，都應盡可能使用當前最小的可用字母。由於 LCP 矩陣已確定哪些位置必須共用同一字元，貪婪分配一次可同時確定所有被連結的位置。

- **字元分配後需反向驗證**：
  分配完成後，必須根據所有位置的字元重新計算出理論上的 LCP 矩陣，並與輸入矩陣逐格比對。若有任何一格不符，代表原始矩陣不合法。

- **動態規劃高效重建 LCP 矩陣**：
  重建計算可利用「若位置 `i` 和 `j` 的字元相同，則 `lcp[i][j] = lcp[i+1][j+1] + 1`」的遞推關係，由右下向左上進行，確保每格計算時所依賴的右下角已被填入。

依據以上特性，可以採用以下策略：

- **由左至右貪婪分配字元**：對每個未分配的位置指派當前最小字母，並同步傳播至所有與其 LCP 大於零的位置；若出現衝突則立即回傳空字串。
- **由右下至左上以動態規劃重建 LCP 矩陣**，利用相鄰格的對角遞推完成。
- **逐格比對輸入與重建矩陣**，確保所給矩陣完全合法後才輸出結果。

此策略能在線性字母枚舉與二次矩陣驗證的複雜度內完成整道題目。

## 解題步驟

### Step 1：初始化字元分配陣列並逐位置貪婪指派字元

建立一個長度為 `n` 的陣列記錄每個位置的字元編號（初始為 `-1` 表示未分配）；
接著由左至右掃描，跳過已分配的位置；對每個未分配位置，若已用完 26 個字母則立即回傳空字串，否則指派當前最小可用字母，並透過查看 LCP 矩陣的當前列，將所有與此位置共享前綴（LCP > 0）的後續位置同步設為相同字元，若發現衝突則立即回傳空字串。

```typescript
const length = lcp.length;

// 貪婪分配：給每個位置指派最小可能的字元
const charCodes = new Int32Array(length).fill(-1);
let nextCharCode = 0;

for (let position = 0; position < length; position++) {
  if (charCodes[position] !== -1) {
    continue;
  }

  // 字母表中已無可用字母
  if (nextCharCode >= 26) {
    return "";
  }

  charCodes[position] = nextCharCode;

  // 所有與此位置共享前綴的位置必須具有相同字元
  for (let other = position + 1; other < length; other++) {
    if (lcp[position][other] > 0) {
      if (charCodes[other] === -1) {
        charCodes[other] = nextCharCode;
      } else if (charCodes[other] !== nextCharCode) {
        // 衝突：兩個位置必須共用字元，但已分配為不同字元
        return "";
      }
    }
  }

  nextCharCode++;
}
```

### Step 2：以動態規劃由右下至左上重建理論 LCP 矩陣

根據已分配的字元，建立一個攤平的一維陣列模擬 `n × n` 的 LCP 矩陣；
從矩陣右下角出發，若兩位置字元相同，則其 LCP 值等於右下角對角位置的 LCP 值加一；
若字元不同，則 LCP 維持預設值 0。

```typescript
// 由下往上的動態規劃，計算根據已分配字元所得出的預期 LCP 矩陣
// dp[i * length + j] = 從 i 和 j 開始的最長公共前綴
// 由右至左計算，使得 dp[i][j] 可使用 dp[i+1][j+1]
const computedLcp = new Int32Array(length * length);

for (let row = length - 1; row >= 0; row--) {
  for (let col = length - 1; col >= 0; col--) {
    if (charCodes[row] === charCodes[col]) {
      // 字元相符：從下一組位置延伸 LCP
      const nextLcp = (row + 1 < length && col + 1 < length)
        ? computedLcp[(row + 1) * length + (col + 1)]
        : 0;
      computedLcp[row * length + col] = nextLcp + 1;
    }
    // 若字元不同，computedLcp 維持 0（初始預設值）
  }
}
```

### Step 3：逐格比對輸入 LCP 矩陣與重建結果

將輸入矩陣的每一格與重建矩陣對應位置進行比對；
若任何一格不一致，代表給定的 LCP 矩陣無法對應任何合法字串，立即回傳空字串。

```typescript
// 驗證：給定 LCP 矩陣中的每一格必須與我們計算出的 LCP 完全相符
for (let row = 0; row < length; row++) {
  const lcpRow = lcp[row];
  const baseIndex = row * length;
  for (let col = 0; col < length; col++) {
    if (lcpRow[col] !== computedLcp[baseIndex + col]) {
      return "";
    }
  }
}
```

### Step 4：將字元編號轉換為字元並組合成最終字串

通過所有驗證後，將每個位置的字元編號加上 `'a'` 的 ASCII 碼轉換為對應字元，並組合成最終字串回傳。

```typescript
// 由已分配的字元編號建立結果字串
const resultChars = new Uint8Array(length);
const aCharCode = 97; // 'a' 的 ASCII 碼
for (let index = 0; index < length; index++) {
  resultChars[index] = aCharCode + charCodes[index];
}

return String.fromCharCode(...resultChars);
```

## 時間複雜度

- 貪婪分配階段對每個位置掃描其後所有位置，共 $O(n^2)$；
- 動態規劃重建 LCP 矩陣需遍歷整個 $n \times n$ 矩陣，為 $O(n^2)$；
- 驗證階段同樣需逐格比對整個矩陣，為 $O(n^2)$；
- 最終字串建構為 $O(n)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 儲存字元編號的陣列佔用 $O(n)$；
- 攤平後的重建 LCP 矩陣佔用 $O(n^2)$；
- 輸出字元暫存陣列佔用 $O(n)$。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
