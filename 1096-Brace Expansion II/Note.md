# 1096. Brace Expansion II

Under the grammar given below, strings can represent a set of lowercase words. 
Let `R(expr)` denote the set of words the expression represents.

The grammar can best be understood through simple examples:

- Single letters represent a singleton set containing that word.
  - `R("a") = {"a"}`
  - `R("w") = {"w"}`

- When we take a comma-delimited list of two or more expressions, we take the union of possibilities.

  - `R("{a,b,c}") = {"a","b","c"}`
  - `R("{{a,b},{b,c}}") = {"a","b","c"}` (notice the final set only contains each word at most once)

- When we concatenate two expressions, 
  we take the set of possible concatenations between two words 
  where the first word comes from the first expression and the second word comes from the second expression.

  - `R("{a,b}{c,d}") = {"ac","ad","bc","bd"}`
  - `R("a{b,c}{d,e}f{g,h}") = {"abdfg", "abdfh", "abefg", "abefh", "acdfg", "acdfh", "acefg", "acefh"}`

Formally, the three rules for our grammar:

- For every lowercase letter `x`, we have `R(x) = {x}`.
- For expressions `e_1, e_2, ... , e_k` with `k >= 2`, we have `R({e_1, e_2, ...}) = R(e_1) ∪ R(e_2) ∪ ...`
- For expressions `e_1` and `e_2`, we have `R(e_1 + e_2) = {a + b for (a, b) in R(e_1) × R(e_2)}`, 
  where `+` denotes concatenation, and `×` denotes the cartesian product.

Given an expression representing a set of words under the given grammar, 
return the sorted list of words that the expression represents.

**Constraints:**

- `1 <= expression.length <= 60`
- `expression[i]` consists of `'{'`, `'}'`, `','` or lowercase English letters.
- The given `expression` represents a set of words based on the grammar given in the description.

## 基礎思路

本題要求依照給定文法，將一個含有大括號與逗號的運算式展開成它所代表的所有字串，並以排序後、不重複的清單回傳。文法只有三種構造：單一字母、以逗號分隔的聯集、以及相鄰運算式的串接，且三者可任意巢狀嵌套。

在思考解法時，可掌握以下核心觀察：

- **文法本身具有遞迴結構**：
  聯集由若干串接組成，串接又由字母與大括號群組組成，而大括號群組內部再度是一個聯集。因此最自然的作法是依文法層次寫成互相呼叫的遞迴下降剖析。

- **串接等同於笛卡爾積**：
  串接的語意是左側集合與右側集合的所有組合，故在剖析過程中維持一份「目前已累積的字串集合」，每遇到一個新群組便與之做一次笛卡爾積即可。

- **連續字母可合併處理**：
  若對每個字母都做一次笛卡爾積，將浪費大量重複配置；把相鄰的純字母先累積成一段固定字首或字尾，只在遇到群組或結尾時一次性接上，能顯著減少中間結果的產生。

- **去重越早越有利**：
  聯集允許重複，若把重複項留到最後才處理，會使之後每一層的笛卡爾積規模成倍膨脹；因此在每個聯集節點就先行去重，可讓後續組合數維持最小。

- **最終排序與去重可合併完成**：
  排序後相同字串必然相鄰，因此只需一次原地掃描即可移除重複，不需額外的集合結構。

- **掃描本身可加速**：
  運算式長度受限且字元僅有大括號、逗號與小寫字母，可先將整串轉為字元碼存入型別化陣列，並預先建好小寫字母的字串對照表，讓剖析過程中的每次讀取都退化為常數時間的陣列存取。

依據以上特性，可以採用以下策略：

- **以遞迴下降剖析文法**，分為「聯集」與「串接」兩個層次互相呼叫。
- **串接層以累積集合搭配待接字面片段的方式處理**，遇到群組才進行笛卡爾積。
- **聯集層在合併多個項目時立即去重**，壓低後續組合規模。
- **最後統一排序並以原地掃描去除相鄰重複**，得到符合題意的結果。

此策略讓展開過程始終維持最小的中間結果規模，同時完整保留文法語意。

## 解題步驟

### Step 1：預先定義字元碼常數

先將剖析過程中會頻繁比對的四個字元（逗號、左大括號、右大括號、小寫字母起點）以字元碼形式定義為常數，讓後續判斷皆為數值比較。

```typescript
const CHARACTER_CODE_COMMA = 44;
const CHARACTER_CODE_LEFT_BRACE = 123;
const CHARACTER_CODE_RIGHT_BRACE = 125;
const CHARACTER_CODE_LOWERCASE_A = 97;
```

### Step 2：建立小寫字母對照表

預先建好 26 個單字元字串，使剖析時取得字母只需一次陣列索引，避免在掃描過程中反覆呼叫字元轉換函式。

```typescript
/**
 * 一次性建立 26 個單字元字串，使剖析器在掃描運算式時
 * 不需呼叫 String.fromCharCode 或 charAt。
 * @returns 每個小寫字母對應一個字串，以 (字元碼 - 97) 為索引。
 */
function buildLowercaseLetterTable(): string[] {
  const letterTable: string[] = new Array(26);
  for (let letterIndex = 0; letterIndex < 26; letterIndex += 1) {
    letterTable[letterIndex] = String.fromCharCode(CHARACTER_CODE_LOWERCASE_A + letterIndex);
  }
  return letterTable;
}

/** 預先計算的查表結構，提供 O(1) 取得任一小寫字母字串。 */
const LOWERCASE_LETTER_TABLE = buildLowercaseLetterTable();
```

### Step 3：宣告共用的掃描狀態

剖析器以共用的字元碼緩衝區、目前游標與有效長度來表示掃描進度，讓兩個互相遞迴的剖析函數能共享同一份掃描位置。

```typescript
/** 目前正在剖析的運算式字元碼（約束：長度不超過 60）。 */
let scannedCharacterCodes = new Uint8Array(64);
let scanCursor = 0;
let scanLength = 0;
```

### Step 4：串接剖析——初始化狀態並處理終止符與連續字母

串接層負責讀取一段不含頂層逗號的內容。先準備累積集合與待接的字面片段；掃描時若遇到逗號或右大括號代表本段結束，需跳出；若是一般字母則併入字面片段，暫不立即做組合。

```typescript
/**
 * 剖析一段串接：由字母與大括號群組組成、且不含頂層逗號的區段。
 * @returns 此串接所產生的字串，不保證順序。
 */
function parseConcatenation(): string[] {
  let accumulatedWords: string[] | null = null;
  let pendingLiteral = "";

  while (scanCursor < scanLength) {
    const characterCode = scannedCharacterCodes[scanCursor];
    if (characterCode === CHARACTER_CODE_COMMA || characterCode === CHARACTER_CODE_RIGHT_BRACE) {
      break;
    }

    // 純字母會被合併成單一字面片段，而非每個字母各做一次笛卡爾積。
    if (characterCode !== CHARACTER_CODE_LEFT_BRACE) {
      pendingLiteral += LOWERCASE_LETTER_TABLE[characterCode - CHARACTER_CODE_LOWERCASE_A];
      scanCursor += 1;
      continue;
    }

    // ...
  }

  // ...
}
```

### Step 5：串接剖析——遞迴展開大括號群組並與左側結果合併

遇到左大括號時，跳過該括號並遞迴呼叫聯集剖析，再跳過對應的右大括號取得群組結果。若左側尚無累積結果，則視是否有待接字面片段決定直接沿用群組或為其加上字首；若左側已有結果，則將待接字面片段夾在中間，寫入一個大小恰好的陣列完成笛卡爾積。合併完成後清空待接字面片段。

```typescript
function parseConcatenation(): string[] {
  // Step 4：初始化累積狀態

  while (scanCursor < scanLength) {
    // Step 4：終止符判斷與連續字母累積

    scanCursor += 1;
    const groupWords = parseUnion();
    scanCursor += 1;
    const groupCount = groupWords.length;

    if (accumulatedWords === null) {
      if (pendingLiteral.length === 0) {
        // 左側尚無任何內容，群組結果本身即可作為累積結果。
        accumulatedWords = groupWords;
      } else {
        const prefixedWords: string[] = new Array(groupCount);
        for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
          prefixedWords[groupIndex] = pendingLiteral + groupWords[groupIndex];
        }
        accumulatedWords = prefixedWords;
      }
    } else {
      // 笛卡爾積寫入一個大小恰好的陣列，不使用 push，也不需重新配置。
      const leftCount = accumulatedWords.length;
      const productWords: string[] = new Array(leftCount * groupCount);
      let writeIndex = 0;
      for (let leftIndex = 0; leftIndex < leftCount; leftIndex += 1) {
        const leftPart = accumulatedWords[leftIndex] + pendingLiteral;
        for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
          productWords[writeIndex] = leftPart + groupWords[groupIndex];
          writeIndex += 1;
        }
      }
      accumulatedWords = productWords;
    }
    pendingLiteral = "";
  }

  // ...
}
```

### Step 6：串接剖析——處理殘留的字面片段並回傳

掃描結束後需結算尾端狀態：若整段只有字母而無任何群組，直接回傳該字面片段；若沒有殘留字面片段，則累積結果即為答案；否則將殘留片段原地接到每個字串尾端後回傳。

```typescript
function parseConcatenation(): string[] {
  // Step 4：初始化累積狀態

  while (scanCursor < scanLength) {
    // Step 4：終止符判斷與連續字母累積

    // Step 5：遞迴展開大括號群組並與左側結果合併
  }

  if (accumulatedWords === null) {
    return [pendingLiteral];
  }
  if (pendingLiteral.length === 0) {
    return accumulatedWords;
  }

  // 尾端字母直接原地接上：此處每個陣列都只有單一使用者。
  const accumulatedCount = accumulatedWords.length;
  for (let wordIndex = 0; wordIndex < accumulatedCount; wordIndex += 1) {
    accumulatedWords[wordIndex] += pendingLiteral;
  }
  return accumulatedWords;
}
```

### Step 7：聯集剖析——取得首項並處理單項捷徑

聯集層先剖析第一個串接項；若其後並未緊接逗號，代表此處只有單一項目，無須建立集合即可直接回傳。

```typescript
/**
 * 剖析以逗號分隔的聯集，其項目皆為串接。
 * @returns 所有項目字串的聯集；當項目多於一個時會去除重複。
 */
function parseUnion(): string[] {
  const firstTermWords = parseConcatenation();
  if (scanCursor >= scanLength || scannedCharacterCodes[scanCursor] !== CHARACTER_CODE_COMMA) {
    return firstTermWords;
  }

  // ...
}
```

### Step 8：聯集剖析——逐項併入並即時去重

確認存在多個項目後，以集合承載首項結果，再持續跳過逗號、剖析後續項目並併入集合。在此層即時去重，可使之後每一次笛卡爾積的規模維持最小。

```typescript
function parseUnion(): string[] {
  // Step 7：剖析首項並處理單項捷徑

  // 在此去重可讓後續的每一次笛卡爾積都盡可能地小。
  const uniqueWords = new Set<string>(firstTermWords);
  while (scanCursor < scanLength && scannedCharacterCodes[scanCursor] === CHARACTER_CODE_COMMA) {
    scanCursor += 1;
    const termWords = parseConcatenation();
    const termCount = termWords.length;
    for (let termIndex = 0; termIndex < termCount; termIndex += 1) {
      uniqueWords.add(termWords[termIndex]);
    }
  }
  return Array.from(uniqueWords);
}
```

### Step 9：確保掃描緩衝區容量足夠

進入主流程後，先取得運算式長度；若既有的共用緩衝區不足以容納本次輸入，則重新配置一個足夠大的緩衝區。

```typescript
const expressionLength = expression.length;
if (scannedCharacterCodes.length < expressionLength) {
  scannedCharacterCodes = new Uint8Array(expressionLength);
}
```

### Step 10：一次性轉換字元碼並重置掃描狀態

先以單次掃描把整個運算式轉為字元碼寫入緩衝區，使後續剖析過程中的每次讀取都成為型別化陣列存取；接著設定有效長度並把游標歸零。

```typescript
// 前置的單次 charCodeAt 掃描，使之後所有讀取都變成型別化陣列讀取。
for (let characterIndex = 0; characterIndex < expressionLength; characterIndex += 1) {
  scannedCharacterCodes[characterIndex] = expression.charCodeAt(characterIndex);
}
scanLength = expressionLength;
scanCursor = 0;
```

### Step 11：啟動剖析並排序展開結果

從聯集層開始剖析整個運算式取得所有字串；若結果少於兩項則無須排序與去重，可直接回傳；否則先排序，使相同字串彼此相鄰。

```typescript
const expandedWords = parseUnion();
if (expandedWords.length < 2) {
  return expandedWords;
}

expandedWords.sort();
```

### Step 12：原地掃描去除相鄰重複並回傳

排序後重複項必然相鄰，因此以讀寫雙索引進行一次原地掃描，只保留與前一個保留值相異者，最後截斷陣列長度並回傳。

```typescript
// 排序後重複項必為相鄰，因此可用單次原地掃描移除。
let writeIndex = 1;
const expandedCount = expandedWords.length;
for (let readIndex = 1; readIndex < expandedCount; readIndex += 1) {
  if (expandedWords[readIndex] !== expandedWords[writeIndex - 1]) {
    expandedWords[writeIndex] = expandedWords[readIndex];
    writeIndex += 1;
  }
}
expandedWords.length = writeIndex;
return expandedWords;
```

## 時間複雜度

- 設運算式長度為 $n$，最終展開出的相異字串數為 $k$，字串平均長度為 $L$；
- 前置的字元碼轉換為一次線性掃描，需 $O(n)$；
- 遞迴下降剖析每個字元僅被消耗一次，其成本主要來自各層產生的中間字串，總量為 $O(kL)$ 級別；
- 各聯集節點以雜湊集合去重，其攤還成本與該節點字串總長度成正比，仍在 $O(kL)$ 之內；
- 最終排序需比較字串，成本為 $O(kL \log k)$，去重掃描為 $O(k)$；
- 總時間複雜度為 $O(kL \log k)$。

> $O(kL \log k)$

## 空間複雜度

- 字元碼緩衝區與字母對照表皆為固定或線性規模，需 $O(n)$；
- 剖析過程中的累積集合、笛卡爾積陣列與去重集合，最多同時保存 $O(kL)$ 的字串內容；
- 遞迴深度受巢狀括號層數限制，最多為 $O(n)$；
- 總空間複雜度為 $O(kL + n)$。

> $O(kL + n)$
