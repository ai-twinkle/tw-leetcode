# 1807. Evaluate the Bracket Pairs of a String

You are given a string s that contains some bracket pairs, with each pair containing a non-empty key.

- For example, in the string `"(name)is(age)yearsold"`, 
  there are two bracket pairs that contain the keys `"name"` and `"age"`.

You know the values of a wide range of keys. 
This is represented by a 2D string array `knowledge` where each `knowledge[i] = [key_i, value_i]` indicates 
that key `key_i` has a value of `value_i`.

You are tasked to evaluate all of the bracket pairs. 
When you evaluate a bracket pair that contains some key `key_i`, you will:

- Replace `key_i` and the bracket pair with the key's corresponding `value_i`.
- If you do not know the value of the key, you will replace `key_i` and the bracket pair with a question mark `"?"` 
  (without the quotation marks).

Each key will appear at most once in your `knowledge`. 
There will not be any nested brackets in `s`.

Return the resulting string after evaluating all of the bracket pairs.

**Constraints:**

- `1 <= s.length <= 10^5`
- `0 <= knowledge.length <= 10^5`
- `knowledge[i].length == 2`
- `1 <= key_i.length, value_i.length <= 10`
- `s` consists of lowercase English letters and round brackets `'('` and `')'`.
- Every open bracket `'('` in `s` will have a corresponding close bracket `')'`.
- The key in each bracket pair of `s` will be non-empty.
- There will not be any nested bracket pairs in s.
- `key_i` and `value_i` consist of lowercase English letters.
- Each `key_i` in `knowledge` is unique.

## 基礎思路

本題要求將字串中所有括號包住的鍵替換為對應的值，若查無該鍵則替換為問號。
字串長度與知識表筆數皆可達 $10^5$，若對每個括號都線性掃過整份知識表，將退化為平方級的成本，因此必須以雜湊查表的方式把查找壓到常數時間。

在思考解法時，可掌握以下核心觀察：

- **括號不巢狀且成對**：
  這代表只需一次由左到右的線性掃描，即可完整切出所有「字面片段」與「待替換片段」，不需要堆疊或遞迴。

- **真正需要的鍵只是字串中出現過的那些**：
  知識表可能遠大於實際用到的鍵數量，因此應該反過來以字串中出現的鍵為主體建表，再讓知識表逐筆來「認領」自己的位置，避免把用不到的條目也塞進表中。

- **鍵的長度與字元集都極小**：
  每個鍵僅由小寫英文字母構成且長度不超過 10，因此可用進位編碼把整個鍵壓成單一數值，使比較成為一次數值相等判斷，而非逐字元字串比較。

- **大量知識條目可被廉價過濾**：
  若某條目的鍵長度、或其首字母，從未在字串的任何鍵中出現過，則它必然無用。以位元遮罩記錄「出現過的長度集合」與「出現過的首字母集合」，即可用兩次位元運算迅速淘汰絕大多數無關條目。

- **輸出應避免反覆的字串串接**：
  逐次串接會造成大量中介字串，改以片段收集後一次合併，可將成本維持在線性。

依據以上特性，可以採用以下策略：

- **第一輪掃描原字串**，切出每一組括號的起訖位置，同時把其中的鍵編碼並登錄進一張開放定址的雜湊表，並順手累積長度與首字母的過濾遮罩。
- **第二輪掃描知識表**，先以兩道遮罩快速淘汰不可能用到的條目，其餘條目才編碼並探測雜湊表；命中時只記錄該條目的列索引，值字串留到需要時再取。
- **第三輪組裝輸出**，沿著先前記錄的括號位置交錯放入字面片段與解析結果，最後一次性合併成答案。

此策略讓字串與知識表各自只被線性掃描一次，且所有查找皆為常數時間，整體效率穩定。

## 解題步驟

### Step 1：預先定義編碼與雜湊所需的常數

先集中定義括號字元碼、字母編碼基底與偏移、雜湊乘數與混合子、問號字元，以及雜湊表的最小容量，供後續各輪流程共用。

```typescript
const OPEN_BRACKET_CODE = 40;
const CLOSE_BRACKET_CODE = 41;
const LETTER_BASE = 27;
const LETTER_OFFSET = 96;
const FIRST_LETTER_CODE = 97;
const HASH_MULTIPLIER = 31;
const HASH_MIXER = 2246822519;
const QUESTION_MARK = '?';
const MINIMUM_TABLE_CAPACITY = 16;
```

### Step 2：估算括號對數量的上界

取得原字串長度後，利用「一組括號至少佔用三個字元」的事實推得括號對數量的上界，作為後續各陣列的配置依據。

```typescript
const sourceLength = s.length;

// 一組括號至少佔用 3 個字元，因此可據此推得括號對數量的上界。
const maximumPairCount = ((sourceLength / 3) | 0) + 1;
```

### Step 3：決定雜湊表容量並計算遮罩

將容量自最小值起持續倍增，直到達到括號對上界的兩倍以上，以維持足夠低的負載率；容量為 2 的冪次，故可用減一後的遮罩取代取模運算。

```typescript
let tableCapacity = MINIMUM_TABLE_CAPACITY;
while (tableCapacity < maximumPairCount * 2) {
  tableCapacity *= 2;
}
const tableMask = tableCapacity - 1;
```

### Step 4：配置雜湊表與括號資訊的儲存空間

準備開放定址表所需的鍵欄位與值索引欄位，另外配置三個陣列分別記錄每組括號對應的槽位、起始位置與結束位置。

```typescript
// 開放定址表，只收錄 `s` 實際會查詢到的鍵。
const slotKeys = new Float64Array(tableCapacity);
const slotValueIndex = new Int32Array(tableCapacity);
const pairSlots = new Int32Array(maximumPairCount);
const pairStarts = new Int32Array(maximumPairCount);
const pairEnds = new Int32Array(maximumPairCount);
```

### Step 5：初始化過濾遮罩與計數並展開第一輪掃描的鍵編碼

初始化兩道過濾遮罩與括號對計數後展開第一輪掃描：跳過非左括號的位置，遇到左括號則自其後一格起逐字元推進，同時以進位編碼把鍵壓成單一數值，並一併累積該鍵的原始雜湊值，直到遇見右括號為止。

```typescript
let keyLengthMask = 0;
let firstLetterMask = 0;
let pairCount = 0;

// 第一輪：記錄每一組括號，並登錄其所需的鍵。
for (let index = 0; index < sourceLength; index += 1) {
  if (s.charCodeAt(index) !== OPEN_BRACKET_CODE) {
    continue;
  }

  let scanIndex = index + 1;
  let encodedKey = 0;
  let rawHash = 0;
  let charCode = s.charCodeAt(scanIndex);
  const firstCharCode = charCode;

  // 每位數字為 1..26，因此 27 進位打包具單射性且可容納於 2^53 內。
  while (charCode !== CLOSE_BRACKET_CODE) {
    encodedKey = encodedKey * LETTER_BASE + (charCode - LETTER_OFFSET);
    rawHash = (Math.imul(rawHash, HASH_MULTIPLIER) + charCode) | 0;
    scanIndex += 1;
    charCode = s.charCodeAt(scanIndex);
  }

  // ...
}
```

### Step 6：累積過濾遮罩並將鍵放入開放定址表

以鍵長與首字母各自設定一個位元，供第二輪快速淘汰無關條目；接著將原始雜湊經位移與乘法混合後取得起始槽位，若該槽已被其他鍵佔用則線性往後探測，最後寫入編碼後的鍵。

```typescript
for (let index = 0; index < sourceLength; index += 1) {
  // Step 5：定位左括號並逐字元編碼鍵

  // 供下方知識表掃描使用的廉價淘汰過濾器。
  keyLengthMask |= 1 << (scanIndex - index - 1);
  firstLetterMask |= 1 << (firstCharCode - FIRST_LETTER_CODE);

  const mixedHash = Math.imul(rawHash ^ (rawHash >>> 15), HASH_MIXER);
  let slot = ((mixedHash ^ (mixedHash >>> 13)) >>> 0) & tableMask;

  while (slotKeys[slot] !== 0 && slotKeys[slot] !== encodedKey) {
    slot = (slot + 1) & tableMask;
  }
  slotKeys[slot] = encodedKey;

  // ...
}
```

### Step 7：記錄此組括號的槽位與區間並跳過已處理範圍

將該括號對應的槽位、起始與結束位置寫入三個平行陣列並累加計數；最後把外層索引直接推進到右括號的位置，避免重複掃描括號內部。

```typescript
for (let index = 0; index < sourceLength; index += 1) {
  // Step 5：定位左括號並逐字元編碼鍵

  // Step 6：累積過濾遮罩並登錄鍵至雜湊表

  pairSlots[pairCount] = slot;
  pairStarts[pairCount] = index;
  pairEnds[pairCount] = scanIndex;
  pairCount += 1;
  index = scanIndex;
}
```

### Step 8：無括號時直接回傳原字串

若整個字串中不存在任何括號對，則無任何替換需要進行，原字串即為答案。

```typescript
// 沒有任何括號對時，答案即為輸入本身。
if (pairCount === 0) {
  return s;
}
```

### Step 9：第二輪掃描知識表並以雙重遮罩淘汰無關條目

逐筆取出知識條目的鍵，先檢查其長度是否曾在字串的任一鍵中出現，再檢查其首字母是否出現過；任一項未命中即代表此條目不可能被用到，可立即跳過。

```typescript
// 第二輪：掃描知識表，跳過不可能被用到的條目。
const knowledgeCount = knowledge.length;
for (let index = 0; index < knowledgeCount; index += 1) {
  const entry = knowledge[index];
  const key = entry[0];
  const keyLength = key.length;

  if (((keyLengthMask >>> keyLength) & 1) === 0) {
    continue;
  }

  const firstCharCode = key.charCodeAt(0);
  if (((firstLetterMask >>> (firstCharCode - FIRST_LETTER_CODE)) & 1) === 0) {
    continue;
  }

  // ...
}
```

### Step 10：為通過過濾的條目編碼並回填其列索引

以與第一輪完全相同的規則對鍵進行進位編碼與雜湊，再探測出對應槽位；若該槽確實存放著同一個鍵，則記下此條目的列索引（採一為起點以便將零保留為「未知」的標記），值字串本身留待實際需要時再取。

```typescript
for (let index = 0; index < knowledgeCount; index += 1) {
  // Step 9：以長度與首字母遮罩淘汰無關條目

  let encodedKey = 0;
  let rawHash = 0;
  for (let charIndex = 0; charIndex < keyLength; charIndex += 1) {
    const charCode = key.charCodeAt(charIndex);
    encodedKey = encodedKey * LETTER_BASE + (charCode - LETTER_OFFSET);
    rawHash = (Math.imul(rawHash, HASH_MULTIPLIER) + charCode) | 0;
  }

  const mixedHash = Math.imul(rawHash ^ (rawHash >>> 15), HASH_MIXER);
  let slot = ((mixedHash ^ (mixedHash >>> 13)) >>> 0) & tableMask;

  while (slotKeys[slot] !== 0 && slotKeys[slot] !== encodedKey) {
    slot = (slot + 1) & tableMask;
  }

  // 僅儲存列索引，值字串等到需要時再取。
  if (slotKeys[slot] === encodedKey) {
    slotValueIndex[slot] = index + 1;
  }
}
```

### Step 11：第三輪組裝輸出並放入括號前的字面片段

準備片段收集容器與字面起點後，依序走訪每一組括號：若該括號起點之前仍有尚未輸出的字面內容，先將這段原文切出並放入結果片段。

```typescript
// 第三輪：拼接字面片段與解析後的值，無須重新掃描鍵。
const outputParts: string[] = [];
let literalStart = 0;

for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
  const pairStart = pairStarts[pairIndex];

  if (pairStart > literalStart) {
    outputParts.push(s.slice(literalStart, pairStart));
  }

  // ...
}
```

### Step 12：依查表結果放入對應的值或問號

取出該括號槽位上記錄的列索引：若仍為零代表此鍵未被任何知識條目認領，放入問號；否則依索引取回對應的值字串。最後將字面起點推進到右括號之後，準備處理下一段。

```typescript
for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
  // Step 11：放入此括號之前的字面片段

  const valueIndex = slotValueIndex[pairSlots[pairIndex]];
  if (valueIndex === 0) {
    outputParts.push(QUESTION_MARK);
  } else {
    outputParts.push(knowledge[valueIndex - 1][1]);
  }

  literalStart = pairEnds[pairIndex] + 1;
}
```

### Step 13：補上尾端字面片段並合併回傳

最後一組括號之後可能仍有未輸出的原文，需補上；接著將所有片段一次合併為最終字串回傳。

```typescript
if (literalStart < sourceLength) {
  outputParts.push(s.slice(literalStart));
}

return outputParts.join('');
```

## 時間複雜度

- 令 $n$ 為字串長度、$m$ 為知識表筆數；
- 第一輪對字串做單次線性掃描，每個字元至多被讀取常數次，為 $O(n)$；
- 第二輪對每筆知識條目先做兩次位元判斷，通過者再編碼其鍵，而鍵長受限於常數 10，故為 $O(m)$；
- 開放定址表的容量維持在元素數量的兩倍以上，探測次數期望為常數；
- 第三輪走訪所有括號對並切出字面片段，各片段互不重疊，合併輸出亦為 $O(n)$；
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 雜湊表與括號資訊陣列的大小皆正比於括號對數量上界，為 $O(n)$；
- 輸出片段容器所存放的內容總長度正比於結果字串長度，為 $O(n)$；
- 兩道過濾遮罩與其餘輔助變數皆為固定數量；
- 總空間複雜度為 $O(n)$。

> $O(n)$
