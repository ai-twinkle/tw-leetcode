# 3090. Maximum Length Substring With Two Occurrences

Given a string `s`, return the maximum length of a substring 
such that it contains at most two occurrences of each character.

**Constraints:**

- `2 <= s.length <= 100`
- `s` consists only of lowercase English letters.

## 基礎思路

本題要求找出一個最長的連續子字串，使其中每個字元的出現次數都不超過兩次。
由於限制條件只針對「每個字元的重複次數上限」，而非整體長度，因此這是一個典型的可變長度視窗問題。

在思考解法時，可掌握以下核心觀察：

- **合法性只受單一字元的第三次出現破壞**：
  當某個字元在視窗內即將出現第三次時，視窗才會違規；此時只需將左界推進到「該字元倒數第三次出現位置之後」，即可一次修復，而不需逐格收縮。

- **只需保存每個字元最近兩次的出現位置**：
  判斷第三次出現是否越界，只依賴該字元前兩次的位置；更早的紀錄對決策毫無影響，因此狀態量是固定的。

- **左界具單調性**：
  隨著右界向右推進，左界只會前進不會後退，因此整體掃描仍維持線性。

- **答案存在理論上限**：
  字母種類有限，每種最多允許兩次，兩者相乘即為任何合法視窗的長度天花板；一旦達到即可立即結束。

- **剩餘可達長度可作為剪枝依據**：
  以目前左界到字串結尾的距離為上界，若已無法超越當前最佳解，後續掃描便沒有意義。

依據以上特性，可以採用以下策略：

- **以單一扁平表格同時記錄每個字元的最新與次新出現位置**，避免額外的巢狀結構。
- **每讀入一個字元，先依其次新位置一次性推進左界，再更新該字元的出現歷史**。
- **每輪更新最佳長度，並在達到理論上限或剩餘長度不足時提前結束**。

此策略讓每個位置僅被處理一次，狀態量固定，整體既簡潔又高效。

## 解題步驟

### Step 1：預先定義字母表與規則相關的常數

先定義字母表大小、小寫字母起始字碼、每個字元允許的出現上限，並由此推導出視窗長度的理論天花板；同時定義扁平表中「次新出現位置」半區的偏移量，以及代表尚未出現過的哨兵值。

```typescript
const ALPHABET_SIZE = 26;
const LOWERCASE_A_CHAR_CODE = 97;
const MAX_OCCURRENCES_PER_CHARACTER = 2;

// 26 種相異字母 x 每種 2 次，是任何合法視窗長度的硬性上限。
const MAX_POSSIBLE_WINDOW_LENGTH = ALPHABET_SIZE * MAX_OCCURRENCES_PER_CHARACTER;

// 「次新出現位置」半區在單一位置表中的偏移量。
const SECOND_LATEST_OFFSET = ALPHABET_SIZE;

const NO_OCCURRENCE = -1;
```

### Step 2：取得長度並處理過短字串的邊界情況

若整個字串的長度未超過允許的出現次數上限，則任何字元都不可能出現第三次，整串本身即為答案，可直接回傳。

```typescript
const length = s.length;

// 任何長度為 0..2 的字串都已滿足「最多兩次」的規則。
if (length <= MAX_OCCURRENCES_PER_CHARACTER) {
  return length;
}
```

### Step 3：初始化出現位置表與滑動視窗狀態

配置一張扁平表，前半段存放每個字母的最新出現索引，後半段存放次新出現索引，並全部初始化為尚未出現；同時準備記錄最佳長度與視窗左界的變數。

```typescript
// 單一扁平表：[0..25] 為各字母的最新索引，[26..51] 為次新索引。
const occurrencePositions = new Int32Array(ALPHABET_SIZE * 2).fill(NO_OCCURRENCE);

let maximumLength = 0;
let windowStart = 0;
```

### Step 4：推進右界並依次新出現位置一次性收縮左界

逐一將右界向右推進，先將目前字元換算為字母索引並取出其次新出現位置；若該位置仍落在視窗內，代表加入目前字元後會形成第三次出現，因此以一次算術運算把左界直接跳過該位置。

```typescript
for (let windowEnd = 0; windowEnd < length; windowEnd += 1) {
  const characterIndex = s.charCodeAt(windowEnd) - LOWERCASE_A_CHAR_CODE;
  const secondLatestIndex = characterIndex + SECOND_LATEST_OFFSET;
  const secondLatestPosition = occurrencePositions[secondLatestIndex];

  // 計入目前這個字元後，此字母第三新的副本必須落在視窗之外，
  // 因此以單一算術步驟讓起點直接跳過它。
  if (secondLatestPosition >= windowStart) {
    windowStart = secondLatestPosition + 1;
  }

  // ...
}
```

### Step 5：更新該字母的出現歷史

處理完左界後，將此字母的出現紀錄整體位移：原本的最新位置降為次新，目前索引成為最新，使表格永遠保存最近兩次的位置。

```typescript
for (let windowEnd = 0; windowEnd < length; windowEnd += 1) {
  // Step 4：換算字母索引並依次新出現位置收縮左界

  // 位移此字母的出現歷史：次新 <- 最新 <- 目前。
  occurrencePositions[secondLatestIndex] = occurrencePositions[characterIndex];
  occurrencePositions[characterIndex] = windowEnd;

  // ...
}
```

### Step 6：更新最佳長度並在達到理論上限時提前回傳

此時視窗必定合法，計算其長度並嘗試更新最佳解；若已達到理論天花板，後續不可能再更長，可立即回傳。

```typescript
for (let windowEnd = 0; windowEnd < length; windowEnd += 1) {
  // Step 4：換算字母索引並依次新出現位置收縮左界

  // Step 5：更新該字母的出現歷史

  const currentWindowLength = windowEnd - windowStart + 1;

  if (currentWindowLength > maximumLength) {
    maximumLength = currentWindowLength;

    // 已達理論上限，因此之後的視窗不可能更長。
    if (maximumLength === MAX_POSSIBLE_WINDOW_LENGTH) {
      return maximumLength;
    }
  }

  // ...
}
```

### Step 7：以剩餘可達長度進行提前終止

由於左界只會前進，從目前左界延伸到字串結尾即為之後所有視窗的長度上界；若此上界已無法超越當前最佳解，便可提前結束掃描。

```typescript
for (let windowEnd = 0; windowEnd < length; windowEnd += 1) {
  // Step 4：換算字母索引並依次新出現位置收縮左界

  // Step 5：更新該字母的出現歷史

  // Step 6：更新最佳長度並在達到理論上限時提前回傳

  // 仍可達到的最長視窗為 (length - windowStart)；若無法勝出則直接結束。
  if (length - windowStart <= maximumLength) {
    break;
  }
}
```

### Step 8：回傳最終的最大長度

掃描結束後，`maximumLength` 即為所有合法視窗中的最大長度，直接回傳。

```typescript
return maximumLength;
```

## 時間複雜度

- 右界至多掃過字串的每個位置一次，且左界僅單調前進；
- 每輪的查表、更新與比較皆為常數時間；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用一張大小為字母表兩倍的固定位置表；
- 其餘皆為固定數量的純量變數；
- 總空間複雜度為 $O(1)$。

> $O(1)$
