# 1930. Unique Length-3 Palindromic Subsequences

Given a string `s`, return the number of unique palindromes of length three that are a subsequence of `s`.

Note that even if there are multiple ways to obtain the same subsequence, 
it is still only counted once.

A palindrome is a string that reads the same forwards and backwards.
A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

- For example, "ace" is a subsequence of "abcde".

**Constraints:**

- `3 <= s.length <= 10^5`
- `s` consists of only lowercase English letters.

## 基礎思路

本題要求計算字串中所有長度為 3 的獨特迴文子序列，形式必定為 **x y x**。
子序列不需連續，只需保持原本字元出現順序；
同一種類的迴文（如 `"aba"`）無論可形成幾次，只能計算一次。

在思考解法時，需掌握以下觀察：

- **迴文 x y x 的外層 x 必須同時出現在 y 的左邊與右邊。**
  因此若以每個位置作為中心 y，我們只需找出左右皆存在的 x。

- **可用 26-bit 的 bitmask 記錄哪些字母已出現在左側或右側。**
  使用 `leftMask` 表示左側出現過的字元集合；
  `futureMask` 表示右側仍會出現的字元集合。

- **對於每個中心字元 y，需要避免重複計算同一種迴文 x y x。**
  因此為每個 y 建立 `visitedOuterMaskForCenter[y]`，避免重複加計。

- **計算新出現的外層字元集合時，可用位元操作加速。**

透過上述策略，我們可以在線性時間內找出所有獨特的長度 3 迴文子序列。

## 解題步驟

### Step 1：輔助函式 — 計算位元遮罩中 1 的個數

實作一個工具函式，用 Kernighan 演算法計算 bitmask 中有多少個 bit 為 1，後面用來統計「新出現的外層字元 x」個數。

```typescript
/**
 * 計算遮罩中 1 的個數（僅使用最低 26 bits）
 *
 * @param mask 32 位元整數遮罩
 * @returns 遮罩中 1 的數量
 */
function countSetBitsInMask(mask: number): number {
  let bitCount = 0;

  // Kernighan 演算法：反覆移除最低位的 1
  while (mask !== 0) {
    mask &= mask - 1;
    bitCount++;
  }

  return bitCount;
}
```

### Step 2：預處理字串長度與索引

若字串長度小於 3，無法形成長度為 3 的迴文，直接回傳 0；
否則將每個字元轉成 0–25 的索引，並統計每個字元出現次數。

```typescript
const length = s.length;

// 若長度不足 3，無法形成 x y x 型迴文
if (length < 3) {
  return 0;
}

// 預先計算每個位置的字母索引與右側總出現次數
const characterIndices = new Uint8Array(length);
const rightCharacterCount = new Uint32Array(ALPHABET_SIZE);

for (let positionIndex = 0; positionIndex < length; positionIndex++) {
  const characterIndex = s.charCodeAt(positionIndex) - 97; // 'a' 的字元編碼為 97
  characterIndices[positionIndex] = characterIndex;
  rightCharacterCount[characterIndex]++;
}
```

### Step 3：初始化未來字元集合 `futureMask`

`futureMask` 用一個 26-bit mask 表示「從當前中心位置往右看，仍然會出現的字元集合」。

```typescript
// futureMask：若 bit c = 1 表示字元 c 仍會在當前中心的右側出現
let futureMask = 0;
for (let alphabetIndex = 0; alphabetIndex < ALPHABET_SIZE; alphabetIndex++) {
  if (rightCharacterCount[alphabetIndex] > 0) {
    futureMask |= 1 << alphabetIndex;
  }
}
```

### Step 4：初始化每個中心字元的「已用外層集合」

為每種中心字元 y 建立一個 mask，紀錄已經搭配過的外層字元 x，避免重複計數同一種迴文 `x y x`。

```typescript
// visitedOuterMaskForCenter[c]：若 bit o = 1，代表迴文 o c o 已被計數過
const visitedOuterMaskForCenter = new Uint32Array(ALPHABET_SIZE);
```

### Step 5：初始化左側集合與結果，並建立主迴圈骨架

`leftMask` 記錄「在目前中心左側出現過的字元集合」，
`uniquePalindromeCount` 負責統計最終不同迴文個數。
主迴圈會逐一將每個位置視為中心字元 y，先取得中心字元索引與其對應 bitmask。

```typescript
// leftMask：bit c = 1 表示字元 c 已在當前中心左側出現過
let leftMask = 0;
// 紀錄獨特長度為 3 的迴文子序列數量
let uniquePalindromeCount = 0;

// 將每個位置視為迴文 x y x 的中心字元
for (let positionIndex = 0; positionIndex < length; positionIndex++) {
  const centerCharacterIndex = characterIndices[positionIndex];
  const centerCharacterBitMask = 1 << centerCharacterIndex;

  // ...
}
```

### Step 6：在主迴圈中更新右側計數與 `futureMask`

在同一個主迴圈中，先將當前中心字元從右側計數中扣除，
若右側已不再出現該字元，則從 `futureMask` 中清除此字元。

```typescript
for (let positionIndex = 0; positionIndex < length; positionIndex++) {
  // Step 5：初始化中心字元索引與對應 bitmask

  const centerCharacterIndex = characterIndices[positionIndex];
  const centerCharacterBitMask = 1 << centerCharacterIndex;

  // 從右側剩餘次數中移除這個中心字元
  const updatedRightCount = rightCharacterCount[centerCharacterIndex] - 1;
  rightCharacterCount[centerCharacterIndex] = updatedRightCount;

  // 若右側不再出現此字元，則在 futureMask 中清除此 bit
  if (updatedRightCount === 0) {
    futureMask &= ~centerCharacterBitMask;
  }

  // ...
}
```

### Step 7：在主迴圈中取得外層候選字元集合

外層字元 x 必須同時出現在左側與右側，因此候選集合為 `leftMask & futureMask`。

```typescript
for (let positionIndex = 0; positionIndex < length; positionIndex++) {
  // Step 5：初始化中心字元索引與對應 bitmask
  
  // Step 6：更新右側計數與 futureMask

  // 外層字元必須同時存在於左側與右側
  const outerCandidateMask = leftMask & futureMask;

  // ...
}
```

### Step 8：在主迴圈中排除已使用外層，並累加新迴文數量

對於當前中心字元 y，從候選集合中去除已使用過的外層 x，
計算新出現的外層 x 數量並累加，最後更新「已用外層集合」。

```typescript
for (let positionIndex = 0; positionIndex < length; positionIndex++) {
  // Step 5：初始化中心字元索引與對應 bitmask
  
  // Step 6：更新右側計數與 futureMask

  // Step 7：取得外層候選字元集合
  const outerCandidateMask = leftMask & futureMask;

  if (outerCandidateMask !== 0) {
    const alreadyVisitedMask =
      visitedOuterMaskForCenter[centerCharacterIndex];

    // 僅保留尚未與此中心字元組成迴文的外層 x
    const newOuterMask = outerCandidateMask & ~alreadyVisitedMask;

    // 若存在新的外層 x，則可以形成新的 x y x 型迴文
    if (newOuterMask !== 0) {
      uniquePalindromeCount += countSetBitsInMask(newOuterMask);

      // 將這些外層 x 標記為已使用
      visitedOuterMaskForCenter[centerCharacterIndex] =
        alreadyVisitedMask | newOuterMask;
    }
  }

  // ...
}
```

### Step 9：在主迴圈中將中心字元加入左側集合，並結束迴圈後回傳結果

處理完當前位置後，將中心字元納入 `leftMask`，
讓之後的位置可以把它當作「左側可用外層字元」。
迴圈結束後回傳最後統計的迴文數。

```typescript
for (let positionIndex = 0; positionIndex < length; positionIndex++) {
  // Step 5：初始化中心字元索引與對應 bitmask
  
  // Step 6：更新右側計數與 futureMask

  // Step 7：取得外層候選字元集合

  // Step 8：排除已使用外層並累加結果

  // 將當前中心字元加入左側集合，供後續位置使用
  leftMask |= centerCharacterBitMask;
}

// 回傳獨特長度 3 迴文子序列的總數
return uniquePalindromeCount;
```

## 時間複雜度

- 每個位置只進行常數次位元運算（包含 mask 加減、bitwise AND/OR/NOT）。
- `countSetBitsInMask` 最多執行 26 次迴圈（固定字母數量）。
- 未使用巢狀迴圈、雙指標或額外掃描。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- `characterIndices` 使用 $O(n)$
- `rightCharacterCount`、`visitedOuterMaskForCenter`、bitmask 等皆為常數空間
- 無額外動態空間成長
- 總空間複雜度為 $O(n)$。

> $O(n)$
