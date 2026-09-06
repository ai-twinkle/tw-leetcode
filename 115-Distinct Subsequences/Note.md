# 115. Distinct Subsequences

Given two strings `s` and `t`, 
return the number of distinct subsequences of s which equals t.

The test cases are generated so that the answer fits on a 32-bit signed integer.

**Constraints:**

- `1 <= s.length, t.length <= 1000`
- `s` and `t` consist of English letters.

## 基礎思路

本題要求計算來源字串中，有多少個相異的子序列恰好等於目標字串。由於子序列可以任意跳過中間字元，直接枚舉所有組合的數量會呈指數成長，因此必須以「累積計數」的方式，把重疊的子問題合併處理。

在思考解法時，可掌握以下核心觀察：

- **計數的狀態可由目標前綴刻畫**：
  只要記錄「目前為止能組出目標字串各個前綴的方法數」，逐一掃過來源字串的字元並更新這些前綴計數，即可在單次線性掃描中把所有可能性累加完畢。

- **單一來源字元只影響特定位置**：
  當掃到某個來源字元時，它只能用來延伸目標字串中「該字元所在位置」的前綴，其餘位置完全不受影響。因此無需更新整排狀態，只需更新與該字元相同的位置集合，即可大幅減少無效運算。

- **更新順序決定正確性**：
  同一個來源字元在一次掃描中只能被使用一次。若由前往後更新，剛更新過的結果會被同一輪重複沿用而導致重複計數；因此必須依目標位置由後往前更新，確保每次取用的都是上一輪的狀態。

- **大量情境可提早排除**：
  來源字串中不存在於目標字串的字元永遠沒有貢獻，可先行剔除；若某字母在目標中的需求量超過來源的供給量，或有效長度不足，則答案必為零。此外，掃描到第幾個字元也限制了目前可能落在的目標位置範圍，超出上下界者可直接略過或中止。

- **結果保證落在 32 位元帶符號整數內**：
  題目已保證答案可用 32 位元表示，因此以固定寬度的整數容器累加，即使中間過程發生環繞，最終取出的數值仍然精確。

依據以上特性，可以採用以下策略：

- **先做前處理與可行性檢查**，統計目標字串的字母需求並過濾來源字串中無用的字元。
- **將目標字串中每個字母的所有出現位置依字母分桶，並以降冪排列**，讓後續能直接取得需更新的位置集合且順序天然正確。
- **逐一掃過過濾後的來源字元，只更新對應桶中位於合法上下界內的前綴計數**，最後取出完整目標長度的計數即為答案。

此策略把二維的狀態更新壓縮為「僅更新相關位置」的稀疏更新，兼顧正確性與效率。

## 解題步驟

### Step 1：預先定義字母表大小常數

由於題目保證兩個字串僅由英文字母組成，其字元碼皆落在前 128 個 ASCII 位置內，可據此固定各類統計表的大小。

```typescript
// 英文字母皆落在前 128 個 ASCII 位置內。
const ALPHABET_SIZE = 128;
```

### Step 2：取得長度並排除目標過長的情況

先取得兩個字串的長度；若目標字串比來源字串還長，則不可能存在任何子序列與之相等，直接回傳 0。

```typescript
const sourceLength = s.length;
const targetLength = t.length;

if (targetLength > sourceLength) {
  return 0;
}
```

### Step 3：快取目標字串的字元碼並統計字母需求

逐一掃過目標字串，一次性把字元碼記錄下來以免後續重複取值，同時累計每個字母的出現次數，作為後續分桶與供需檢查的依據。

```typescript
// 一次性快取 t 的字元碼，並統計每個字母的出現次數。
const targetCodes = new Uint8Array(targetLength);
const targetCounts = new Int32Array(ALPHABET_SIZE);
for (let index = 0; index < targetLength; index++) {
  const code = t.charCodeAt(index);
  targetCodes[index] = code;
  targetCounts[code]++;
}
```

### Step 4：過濾來源字串中永無貢獻的字元

掃過來源字串，只保留那些在目標字串中確實出現過的字元，並同步統計來源端各字母的供給量。被剔除的字元永遠無法對應到任何目標位置，保留它們只會增加無謂的掃描成本。

```typescript
// 移除 s 中所有永遠無法對應到 t 字元的字元。
const filteredSource = new Uint8Array(sourceLength);
const sourceCounts = new Int32Array(ALPHABET_SIZE);
let filteredLength = 0;
for (let index = 0; index < sourceLength; index++) {
  const code = s.charCodeAt(index);
  if (targetCounts[code] !== 0) {
    filteredSource[filteredLength++] = code;
    sourceCounts[code]++;
  }
}
```

### Step 5：以有效長度與字母供需進行可行性檢查

過濾後若有效長度已不足以覆蓋目標長度，必然無解；再逐一比對每個字母的供需量，只要有任一字母的供給少於需求，同樣無解，皆可直接回傳 0。

```typescript
if (filteredLength < targetLength) {
  return 0;
}

// 若 t 對某字母的需求量超過 s 的供給量，則不可能存在任何匹配。
for (let code = 0; code < ALPHABET_SIZE; code++) {
  if (sourceCounts[code] < targetCounts[code]) {
    return 0;
  }
}
```

### Step 6：以前綴和建立各字母的桶邊界

依字母需求量做前綴累加，得到每個字母在位置陣列中所占區段的起點，使得相鄰兩個邊界值之間即為該字母的所有位置。

```typescript
// 分桶配置：bucketStart[code] .. bucketStart[code + 1] 存放該字母在 t 中的所有位置。
const bucketStart = new Int32Array(ALPHABET_SIZE + 1);
for (let code = 0; code < ALPHABET_SIZE; code++) {
  bucketStart[code + 1] = bucketStart[code] + targetCounts[code];
}
```

### Step 7：由後往前填入各字母的出現位置

複製一份游標以免破壞原始邊界，接著由目標字串的尾端往前掃描並依序寫入。如此各桶內的位置自然呈降冪排列，正是後續更新所需的順序。

```typescript
// 反向走訪 t 來填桶，使各桶內的位置呈降冪排列。
const bucketCursor = bucketStart.slice(0, ALPHABET_SIZE);
const targetPositions = new Int32Array(targetLength);
for (let index = targetLength - 1; index >= 0; index--) {
  const code = targetCodes[index];
  targetPositions[bucketCursor[code]++] = index;
}
```

### Step 8：初始化前綴計數表與位置下界偏移量

建立記錄各目標前綴方法數的計數表，其中空前綴的方法數初始化為 1，作為累加的起點；同時預先算好位置下界所需的偏移量，供主迴圈重複使用。

```typescript
// ways[prefix] = 由已掃描過的 s 片段組出 t[0 .. prefix - 1] 的方法數。
const ways = new Int32Array(targetLength + 1);
ways[0] = 1;

// Int32Array 的儲存會以 2^32 取模環繞，因為答案可用 32 位元帶符號整數表示，故結果仍然精確。
const positionOffset = targetLength - filteredLength;
```

### Step 9：逐一掃描來源字元並計算可更新的位置範圍

依序取出過濾後的每個來源字元，找出其對應桶的結束邊界；同時依目前掃描進度推導出合法的位置上下界：位置不可超過已掃描的字元數，也不可低到讓剩餘字元無法補完目標。

```typescript
for (let index = 0; index < filteredLength; index++) {
  const code = filteredSource[index];
  const bucketEnd = bucketStart[code + 1];
  // 高於此索引的位置無法到達；低於此索引的位置則已無法完成 t。
  const maxPosition = index;
  const minPosition = positionOffset + index;

  // ...
}
```

### Step 10：走訪該字母的位置桶並施加上下界剪枝

在該字母的桶內由降冪順序逐一取出位置：若位置超過上界則略過該筆；若位置低於下界，由於後續位置只會更小，可直接中止此桶的掃描。

```typescript
for (let index = 0; index < filteredLength; index++) {
  // Step 9：取得當前字元的桶邊界與位置上下界

  for (let bucketIndex = bucketStart[code]; bucketIndex < bucketEnd; bucketIndex++) {
    const position = targetPositions[bucketIndex];
    if (position > maxPosition) {
      continue;
    }
    if (position < minPosition) {
      break;
    }

    // ...
  }
}
```

### Step 11：將前一個前綴的方法數累加到當前前綴

通過剪枝的位置代表此來源字元可用來延伸該前綴。由於桶內位置為降冪排列，取用的來源必然仍是上一輪的狀態，因此可安全地把較短前綴的方法數累加到較長前綴上。

```typescript
for (let index = 0; index < filteredLength; index++) {
  // Step 9：取得當前字元的桶邊界與位置上下界

  for (let bucketIndex = bucketStart[code]; bucketIndex < bucketEnd; bucketIndex++) {
    // Step 10：取出位置並施加上下界剪枝

    // 降冪順序保證 ways[position] 仍為上一輪的數值。
    ways[position + 1] += ways[position];
  }
}
```

### Step 12：回傳完整目標長度所對應的方法數

掃描結束後，對應完整目標長度的計數即為所求的相異子序列數量，直接回傳。

```typescript
return ways[targetLength];
```

## 時間複雜度

- 設 `n` 為來源字串長度、`m` 為目標字串長度、`k` 為字母表大小（此處為常數 128）；
- 快取目標字元碼與統計需求為 $O(m)$，過濾來源字串為 $O(n)$；
- 供需檢查與桶邊界前綴和皆為 $O(k)$，填入位置為 $O(m)$；
- 主迴圈掃過至多 `n` 個有效字元，每個字元最多走訪其字母在目標中的所有位置，最壞情況為 $O(m)$，合計 $O(n \times m)$；
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 快取的目標字元碼與位置陣列各為 $O(m)$，過濾後的來源緩衝區為 $O(n)$；
- 各類字母統計表與桶邊界為 $O(k)$，在固定字母表下視為常數；
- 前綴計數表為 $O(m)$；
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
