# 3302. Find the Lexicographically Smallest Valid Sequence

You are given two strings `word1` and `word2`.

A string `x` is called almost equal to `y` 
if you can change at most one character in `x` to make it identical to `y`.

A sequence of indices seq is called valid if:

- The indices are sorted in ascending order.
- Concatenating the characters at these indices in `word1` in the same order results in a string 
  that is almost equal to `word2`.

Return an array of size `word2.length` representing the lexicographically smallest valid sequence of indices. 
If no such sequence of indices exists, return an empty array.

Note that the answer must represent the lexicographically smallest array, 
not the corresponding string formed by those indices.

**Constraints:**

- `1 <= word2.length < word1.length <= 3 * 10^5`
- `word1` and `word2` consist only of lowercase English letters.

## 基礎思路

本題要求在 `word1` 中找出一組遞增索引序列，使得依序取出的字元所組成的字串「幾乎等於」`word2`（即最多允許一個字元不同），並且回傳的索引序列必須是**字典序最小**的。

在思考解法時，可掌握以下核心觀察：

- **字典序最小需盡早選取索引**：
  為了使索引陣列字典序最小，每一個位置都應該在合法前提下選擇最小的可用索引，也就是採用貪婪由左往右掃描。

- **「最多一次修改」等價於允許一次不匹配**：
  匹配過程中，若遇到字元不相同，我們可以「花費」唯一的一次修改機會強行對應，但花費之後，剩餘部分必須是嚴格的子序列匹配。

- **花費修改必須確保後續仍可完成**：
  在某位置花費修改機會前，必須保證剩下的目標後綴仍能以子序列形式嵌入 `word1` 的剩餘部分，否則會導致整體匹配失敗。

- **預先計算後綴可行性**：
  為了在花費修改時能立即判斷可行性，需要事先由右往左貪婪匹配，記錄每個目標後綴能夠最晚從 `word1` 的哪個位置開始嵌入。

依據以上特性，可以採用以下策略：

- **先由右往左預處理**，計算每個目標後綴所能容許的最晚起始索引。
- **再由左往右貪婪掃描**：字元相同時直接對應；字元不同時，只要確認後續後綴仍可嵌入，即在最早可行處花費唯一的修改機會。
- **修改用盡後轉為純子序列匹配**，補齊剩餘的目標字元；若最終未能完整匹配，則回傳空陣列。

此策略能在線性時間內確保取得字典序最小的合法索引序列。

## 解題步驟

### Step 1：準備字元編碼工具與共用編碼器

先偵測執行環境是否支援原生 `TextEncoder`，若支援則建立共用實例，以便後續能一次性地將字串轉為位元組緩衝。

```typescript
interface TextEncoderLike {
  encodeInto(source: string, destination: Uint8Array): { read: number; written: number };
}

interface GlobalScopeWithTextEncoder {
  TextEncoder?: new () => TextEncoderLike;
}

const globalScope = globalThis as unknown as GlobalScopeWithTextEncoder;
const textEncoderConstructor = globalScope.TextEncoder;
const sharedTextEncoder: TextEncoderLike | null =
  typeof textEncoderConstructor === "function" ? new textEncoderConstructor() : null;
```

### Step 2：實作字串轉位元組的輔助函數

將小寫 ASCII 字串轉為位元組緩衝，並額外保留一個結尾的零哨兵，使讀取超過結尾一格仍在合法範圍內。若可使用原生編碼器則一次複製整個字串，否則逐字補上字元碼。

```typescript
/**
 * 將小寫 ASCII 字串轉為攜帶一個結尾零哨兵的位元組緩衝，
 * 使得讀取超過結尾一格的位置仍保持在界內。
 * @param value 欲轉換的小寫 ASCII 字串。
 * @returns 長度為 value.length + 1 的 Uint8Array，內含每個字元碼。
 */
function toCharacterCodes(value: string): Uint8Array {
  const length = value.length;
  const characterCodes = new Uint8Array(length + 1);
  if (sharedTextEncoder !== null) {
    // 原生編碼可一次複製整段 ASCII 內容
    sharedTextEncoder.encodeInto(value, characterCodes);
    return characterCodes;
  }
  for (let index = 0; index < length; index++) {
    characterCodes[index] = value.charCodeAt(index);
  }
  return characterCodes;
}
```

### Step 3：初始化主函數的基本變數與編碼

在主函數中先取得兩字串長度，並將其分別轉為位元組緩衝，方便後續以整數比較字元。

```typescript
const sourceLength = word1.length;
const targetLength = word2.length;
const sourceCodes = toCharacterCodes(word1);
const targetCodes = toCharacterCodes(word2);
```

### Step 4：由右往左預處理，計算每個後綴的最晚起始索引

建立 `latestStart` 陣列，其中 `latestStart[j]` 表示 `word2[j..]` 能作為子序列嵌入 `word1[i..]` 的最大起始索引 `i`。透過由右往左的貪婪匹配，讓每個後綴的起始位置盡可能維持在最晚。

```typescript
// latestStart[j] = 使 word2[j..] 為 word1[i..] 之子序列的最大索引 i
const latestStart = new Int32Array(targetLength + 1);
latestStart[targetLength] = sourceLength;

let targetCursor = targetLength - 1;
let sourceCursor = sourceLength - 1;
while (targetCursor >= 0 && sourceCursor >= 0) {
  if (sourceCodes[sourceCursor] === targetCodes[targetCursor]) {
    // 由右往左貪婪匹配，使每個後綴的起始位置盡可能維持在最晚
    latestStart[targetCursor] = sourceCursor;
    targetCursor--;
  }
  sourceCursor--;
}
```

### Step 5：標記無法完成匹配的後綴

若由右往左掃描結束後 `targetCursor` 仍未歸零，代表這些前段後綴根本無法被嵌入，需將對應的 `latestStart` 標記為 `-1`。

```typescript
// 未能完成匹配的後綴，永遠無法被放置於任何位置
if (targetCursor >= 0) {
  latestStart.fill(-1, 0, targetCursor + 1);
}
```

### Step 6：初始化貪婪掃描所需的狀態變數

準備結果陣列與掃描過程中的狀態：已匹配數量、來源索引，以及是否已花費唯一的修改機會。

```typescript
const result: number[] = new Array(targetLength);
let matchedCount = 0;
let sourceIndex = 0;
let mismatchSpent = false;
```

### Step 7：Phase 1 —— 在修改機會仍可用時進行貪婪匹配

由左往右掃描 `word1`：若字元相同則直接對應；若字元不同，且此位置早於後綴所需的最晚起始索引（代表後續仍可完成子序列匹配），則在此最早可行處花費唯一的修改機會，隨後跳出此階段。

```typescript
// Phase 1：唯一允許的修改機會仍然可用
while (sourceIndex < sourceLength && matchedCount < targetLength) {
  if (sourceCodes[sourceIndex] === targetCodes[matchedCount]) {
    result[matchedCount] = sourceIndex;
    matchedCount++;
  } else if (sourceIndex < latestStart[matchedCount + 1]) {
    // 在最早可行索引花費修改機會，可使答案維持最小
    result[matchedCount] = sourceIndex;
    matchedCount++;
    mismatchSpent = true;
    sourceIndex++;
    break;
  }
  sourceIndex++;
}
```

### Step 8：Phase 2 —— 修改用盡後進行純子序列匹配

若已花費修改機會，則剩餘部分僅需進行單純的子序列掃描，將剩下的目標字元逐一對應補齊。

```typescript
// Phase 2：修改已用盡，剩餘部分僅為單純的子序列掃描
if (mismatchSpent) {
  while (sourceIndex < sourceLength && matchedCount < targetLength) {
    if (sourceCodes[sourceIndex] === targetCodes[matchedCount]) {
      result[matchedCount] = sourceIndex;
      matchedCount++;
    }
    sourceIndex++;
  }
}
```

### Step 9：檢查匹配完整性並回傳結果

若最終匹配數量不足目標長度，代表無合法序列存在，回傳空陣列；否則回傳完整的索引結果。

```typescript
if (matchedCount < targetLength) {
  return [];
}
return result;
```

## 時間複雜度

- 字串轉位元組緩衝需線性掃描，為 $O(n + m)$；
- 由右往左預處理最晚起始索引，最多掃描 `word1` 一次，為 $O(n)$；
- 由左往右的兩階段貪婪匹配合計最多掃描 `word1` 一次，為 $O(n)$；
- 其中 `n` 為 `word1` 長度、`m` 為 `word2` 長度。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 兩個位元組緩衝各需 $O(n)$ 與 $O(m)$；
- `latestStart` 陣列需 $O(m)$；
- 結果陣列需 $O(m)$；
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
