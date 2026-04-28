# 10. Regular Expression Matching

Given an input string `s` and a pattern `p`, implement regular expression matching with support for `'.'` and `'*'` where:

- `'.'` Matches any single character.
- `'*'` Matches zero or more of the preceding element.

Return a boolean indicating whether the matching covers the entire input string (not partial).

**Constraints:**

- `1 <= s.length <= 20`
- `1 <= p.length <= 20`
- `s` contains only lowercase English letters.
- `p` contains only lowercase English letters, `'.'`, and `'*'`.
- It is guaranteed for each appearance of the character `'*'`, there will be a previous valid character to match.

## 基礎思路

本題要求判斷一個字串是否完整符合一個含 `'.'` 與 `'*'` 的正規表達式模式。與一般字串比對不同，`'*'` 代表前一字元可出現零次或多次，這使得模式的長度與字串長度之間的對應關係無法事先確定。

在思考解法時，可掌握以下核心觀察：

- **`'*'` 的存在使比對具有分支性**：
  每當遇到帶有 `'*'` 的模式元素，可以選擇跳過它（零次匹配）或消耗一個符合的字元（一次匹配並留在原 token），這兩種選擇形成遞迴分支。

- **狀態可由兩個位置索引完整描述**：
  在任意時刻，比對的結果只取決於「目前處理到字串的哪個位置」與「目前處理到模式的哪個 token」，因此可以記憶化重複計算的子問題。

- **模式可預先壓縮為 token 流**：
  將 `'*'` 與其前一字元合併成單一 token 並標記，可以讓遞迴時每步只需處理一個 token，而不必判斷下一字元是否為 `'*'`。

- **無 `'*'` 的情況可以繞過遞迴**：
  若模式中完全不含 `'*'`，則模式長度必須等於字串長度，且每個字元逐一比對即可，完全不需要記憶化或遞迴，可作為快速路徑處理。

- **模組層級的重用緩衝區可減少記憶體分配**：
  由於約束值有上界，可在模組層級預先配置固定大小的緩衝區，每次呼叫時重用，而非每次重新配置。

依據以上特性，可以採用以下策略：

- **預先將模式壓縮為 token 陣列**，每個 token 記錄字元碼與是否帶有 `'*'`，讓後續遞迴邏輯更簡潔。
- **若無 `'*'`，直接線性比對後回傳結果**，避免不必要的遞迴開銷。
- **對於含 `'*'` 的情況，以 `(字串位置, token 位置)` 為鍵進行記憶化遞迴**，分支處理零次匹配與一次匹配兩種情形。
- **每次呼叫前重置記憶化表格中實際可能被訪問的格子**，而非清空整個陣列，以減少不必要的初始化成本。

此策略結合壓縮 token、快速路徑與有界記憶化，使整體解法在約束範圍內高效且正確。

## 解題步驟

### Step 1：宣告模組層級常數與重用緩衝區

在模組載入時預先計算字元碼常數，並配置固定大小的緩衝區，讓每次函數呼叫能直接重用，避免重複分配記憶體。

```typescript
// 模組載入時預先計算字元碼常數，以供 O(1) 比較
const DOT_CODE = 46;
const STAR_CODE = 42;

// 依照最大約束值配置可重用的暫存緩衝區
// 宣告於函數外部，避免每次呼叫時重新分配
const MAX_LENGTH = 32;
const tokenCharCodes = new Uint8Array(MAX_LENGTH);
const tokenIsStar = new Uint8Array(MAX_LENGTH);
// 備忘錄項目：0 = 未訪問，1 = false，2 = true
const memoTable = new Uint8Array((MAX_LENGTH + 1) * (MAX_LENGTH + 1));
const stringCodes = new Uint8Array(MAX_LENGTH);

// 模組層級狀態，供遞迴使用（避免傳遞大量參數）
let currentTokenCount = 0;
let currentStringLength = 0;
let memoStride = 0;
```

### Step 2：處理遞迴的終止條件與記憶化查詢

在遞迴輔助函數中，首先處理最基本的終止條件：若所有 token 均已被比對，則成功的條件是字串也同時耗盡。
接著查詢記憶化表格，若目前狀態已被計算過，直接回傳快取結果。

```typescript
/**
 * 以記憶化遞迴比對 (stringIndex, tokenIndex) 狀態。
 * @param stringIndex - 目前在輸入字串中的位置
 * @param tokenIndex - 目前在壓縮 token 流中的位置
 * @return 若剩餘字串與剩餘 token 能完全匹配則回傳 true
 */
function matchHelper(stringIndex: number, tokenIndex: number): boolean {
  // 模式已耗盡：唯有字串也耗盡時才算成功
  if (tokenIndex === currentTokenCount) {
    return stringIndex === currentStringLength;
  }

  const memoOffset = stringIndex * memoStride + tokenIndex;
  const cached = memoTable[memoOffset];
  if (cached !== 0) {
    return cached === 2;
  }

  // ...
}
```

### Step 3：判斷目前字元是否能與當前 token 匹配

計算目前字串位置的字元是否與當前 token 相符：
字串未耗盡，且 token 為萬用字元 `'.'` 或與目前字元的字元碼相同，則視為單字元匹配成立。

```typescript
function matchHelper(stringIndex: number, tokenIndex: number): boolean {
  // Step 2：終止條件與記憶化查詢

  const tokenCode = tokenCharCodes[tokenIndex];
  const firstMatch = (stringIndex < currentStringLength) &&
    (tokenCode === DOT_CODE || tokenCode === stringCodes[stringIndex]);

  // ...
}
```

### Step 4：依照 token 是否帶有 `'*'` 進行分支遞迴，並寫入記憶化結果

若當前 token 帶有 `'*'`，則有兩種選擇：跳過此 token（零次匹配），或在單字元匹配成立時消耗一個字元並停留在同一 token（多次匹配）；
若不帶 `'*'`，則必須單字元匹配成立且同時推進字串與 token 的位置。
最終將計算結果寫入記憶化表格後回傳。

```typescript
function matchHelper(stringIndex: number, tokenIndex: number): boolean {
  // Step 2：終止條件與記憶化查詢

  // Step 3：判斷目前字元是否能與當前 token 匹配

  let result: boolean;
  if (tokenIsStar[tokenIndex] === 1) {
    // 跳過帶星號的 token（零次匹配）或消耗一個匹配的字元
    result = matchHelper(stringIndex, tokenIndex + 1) ||
      (firstMatch && matchHelper(stringIndex + 1, tokenIndex));
  } else {
    result = firstMatch && matchHelper(stringIndex + 1, tokenIndex + 1);
  }

  memoTable[memoOffset] = result ? 2 : 1;
  return result;
}
```

### Step 5：將模式壓縮為 token 流，並記錄是否含有 `'*'`

逐字掃描模式字串，若當前字元的下一個字元為 `'*'`，則將此字元與 `'*'` 合併為一個帶星號的 token，並跳過兩個字元；否則記錄為普通 token 並前進一個字元。
同時以旗標記錄整個模式中是否出現過 `'*'`，供後續快速路徑判斷使用。

```typescript
const stringLength = s.length;
const patternLength = p.length;

// 將模式壓縮為 token，並同時追蹤是否存在星號
let tokenCount = 0;
let patternIndex = 0;
let hasStar = false;
while (patternIndex < patternLength) {
  const code = p.charCodeAt(patternIndex);
  const nextIndex = patternIndex + 1;
  if (nextIndex < patternLength && p.charCodeAt(nextIndex) === STAR_CODE) {
    tokenCharCodes[tokenCount] = code;
    tokenIsStar[tokenCount] = 1;
    patternIndex += 2;
    hasStar = true;
  } else {
    tokenCharCodes[tokenCount] = code;
    tokenIsStar[tokenCount] = 0;
    patternIndex += 1;
  }
  tokenCount++;
}
```

### Step 6：無 `'*'` 時走快速路徑直接線性比對

若模式中完全沒有 `'*'`，則 token 數必須等於字串長度，且每個 token 逐一比對對應字元；
任何不符合的情況都立刻回傳 `false`，否則回傳 `true`。
此路徑完全繞過記憶化與遞迴，顯著降低額外開銷。

```typescript
// 快速路徑：模式中無 '*' 時，每個模式字元必須恰好對應一個字串字元
// 可完全避免備忘錄配置與遞迴的開銷
if (!hasStar) {
  if (tokenCount !== stringLength) {
    return false;
  }
  for (let index = 0; index < stringLength; index++) {
    const tokenCode = tokenCharCodes[index];
    if (tokenCode !== DOT_CODE && tokenCode !== s.charCodeAt(index)) {
      return false;
    }
  }
  return true;
}
```

### Step 7：預先計算字串的字元碼並重置記憶化表格

將字串的所有字元碼預先寫入緩衝區，供遞迴時快速隨機存取；
接著計算本次呼叫實際可能訪問到的格子範圍，僅清空該範圍，而非清空整個表格。
最後設定模組層級狀態，供遞迴函數使用。

```typescript
// 預先計算字串字元碼，以供遞迴時快速隨機存取
for (let index = 0; index < stringLength; index++) {
  stringCodes[index] = s.charCodeAt(index);
}

// 僅重置實際可能訪問到的格子
const stride = tokenCount + 1;
const totalCells = (stringLength + 1) * stride;
for (let index = 0; index < totalCells; index++) {
  memoTable[index] = 0;
}

currentTokenCount = tokenCount;
currentStringLength = stringLength;
memoStride = stride;
```

### Step 8：從初始狀態啟動遞迴並回傳結果

從字串位置 0 與 token 位置 0 出發，呼叫遞迴輔助函數進行完整比對，並直接回傳其結果。

```typescript
return matchHelper(0, 0);
```

## 時間複雜度

- 模式壓縮為 token 的掃描為 $O(p)$，其中 $p$ 為模式長度；
- 快速路徑（無 `'*'`）為 $O(\min(s, p))$；
- 含 `'*'` 時，記憶化遞迴的狀態空間為 $O(s \cdot p)$，每個狀態僅計算一次，每次計算為 $O(1)$；
- 重置記憶化表格亦為 $O(s \cdot p)$。
- 總時間複雜度為 $O(s \cdot p)$。

> $O(s \cdot p)$

## 空間複雜度

- 模組層級緩衝區大小固定，依題目約束為常數空間；
- 遞迴呼叫堆疊深度最深為 $O(s + p)$；
- 無其他動態配置的額外空間。
- 總空間複雜度為 $O(s + p)$。

> $O(s + p)$
