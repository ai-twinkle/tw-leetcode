# 3. Longest Substring Without Repeating Characters

Given a string `s`, find the length of the longest substring without duplicate characters.

**Constraints:**

- `0 <= s.length <= 5 * 10^4`
- `s` consists of English letters, digits, symbols and spaces.

## 基礎思路

本題要求找出字串中「不含重複字元」的最長子字串長度。
這是一道經典的滑動視窗問題，我們需要關注以下關鍵觀察：

- **子字串需要連續**：因此我們只能調整左右邊界，而不能跳著選字元。
- **避免重複字元**：只要加入某字元後有重複，就必須從左端開始收縮，直到該字元再次變為唯一。
- **滑動視窗最佳化策略**：使用一個字元頻率表，搭配兩個指標 `left`、`right`，
  維持「當前無重複字元的最大區間」。
- **鴿籠原理（Pigeonhole Principle）提早結束**：由於題目只限定 ASCII 可列印字元（最多約 95 種），
  故最長答案不可能超過 95 或字串長度本身，若已達此上限即可提早返回。

透過滑動視窗結構，每個字元最多被加入與移除視窗一次，因此整體可於線性時間完成。

## 解題步驟

### Step 1：初始化與邊界處理

先取得字串長度，若為空字串則答案為 0。
同時計算可列印 ASCII 字元的上限，作為最長可能答案的提早結束條件。

```typescript
const stringLength = s.length;

if (stringLength === 0) {
  return 0;
}

// 可列印 ASCII（字母、數字、符號、空白）約 95 個
const maximumDistinctCharacters = 95;

// 鴿籠原理：最長子字串不會超出 distinct 上限或字串長度
const maximumPossibleAnswer =
  stringLength < maximumDistinctCharacters
    ? stringLength
    : maximumDistinctCharacters;
```

### Step 2：準備滑動視窗使用的字元頻率表與指標

建立 ASCII 區間的頻率表，用來記錄視窗內每個字元出現次數。
同時初始化左指標 `leftIndex` 與目前找到的最大視窗長度 `longestWindowLength`。

```typescript
// ASCII 0..127 的頻率表
const characterFrequency = new Uint8Array(128);

let leftIndex = 0;
let longestWindowLength = 0;
```

### Step 3：主迴圈 — 以 rightIndex 逐步擴展滑動視窗右端

用 `rightIndex` 遍歷整個字串，在視窗右側加入新字元；
過程中依需求調整視窗左端以保持「無重複」。

```typescript
for (let rightIndex = 0; rightIndex < stringLength; rightIndex++) {
  const currentCharacterCode = s.charCodeAt(rightIndex);

  // 將新字元加入視窗
  characterFrequency[currentCharacterCode] =
    characterFrequency[currentCharacterCode] + 1;

  // ...
}
```

### Step 4：若右端加入的字元重複，需從左端開始縮小視窗

當某字元計數超過 1 時，表示視窗中出現重複字元，
需要從左端開始移除字元並前進 leftIndex，直到該字元恢復唯一。

```typescript
for (let rightIndex = 0; rightIndex < stringLength; rightIndex++) {
  // Step 3：擴展視窗右端

  // 若新加入字元造成重複，收縮視窗左端
  while (characterFrequency[currentCharacterCode] > 1) {
    const leftCharacterCode = s.charCodeAt(leftIndex);
    characterFrequency[leftCharacterCode] =
      characterFrequency[leftCharacterCode] - 1;
    leftIndex = leftIndex + 1;
  }

  // ...
}
```

### Step 5：更新最大視窗長度並應用鴿籠原理提前結束

當視窗符合「無重複字元」條件時，更新目前最長長度。
若達到理論上限 `maximumPossibleAnswer`，則可以立刻返回。

```typescript
for (let rightIndex = 0; rightIndex < stringLength; rightIndex++) {
  // Step 3：擴展視窗右端

  // Step 4：必要時從左端縮小視窗

  const currentWindowLength = rightIndex - leftIndex + 1;

  if (currentWindowLength > longestWindowLength) {
    longestWindowLength = currentWindowLength;

    // 若已達最可能上限，可提前返回
    if (longestWindowLength === maximumPossibleAnswer) {
      return longestWindowLength;
    }
  }
}
```

### Step 6：返回最終結果

主迴圈結束後，`longestWindowLength` 即為最長無重複子字串長度。

```typescript
return longestWindowLength;
```

## 時間複雜度

- 每個字元最多被加入視窗一次、移除視窗一次；
- 視窗收縮與擴張皆為線性總成本。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度 128 的 `Uint8Array` 作為頻率表；
- 其餘僅有少量變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
