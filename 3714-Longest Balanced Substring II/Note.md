# 3714. Longest Balanced Substring II

You are given a string `s` consisting only of the characters `'a'`, `'b'`, and `'c'`.

A substring of `s` is called balanced if all distinct characters in the substring appear the same number of times.

Return the length of the longest balanced substring of `s`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` contains only the characters `'a'`, `'b'`, and `'c'`.

## 基礎思路

本題定義「balanced substring」為：子字串中**所有出現過的字元**，其出現次數必須相同。字元只可能是 `'a'`, `'b'`, `'c'`，因此平衡情況只會出現在以下三類：

1. **只含 1 種字元**：例如 `"aaaa"`，只要子字串內僅有一種字元，所有 distinct 字元的次數自然相同，因此任何「單一字元連續段」都平衡。
2. **只含 2 種字元**：例如只含 `a,b`，要平衡則必須 `count(a) = count(b)`；同理只含 `a,c` 或 `b,c` 也一樣。
   關鍵變成：在某段不包含第三個字元的連續區間中，找出兩字母計數差相同的兩個前綴位置，即可得到一段平衡子字串。
3. **同時含 3 種字元**：要平衡則必須 `count(a)=count(b)=count(c)`。
   這等價於同時滿足兩個差值不變：`count(a)-count(b)` 與 `count(a)-count(c)` 在兩個前綴位置相同，則中間子字串三者增量一致，因而平衡。

因此整體策略是：

* 單字元情況：找最長連續段。
* 雙字元情況：在「不含第三字元」的分段內，利用「兩字母差值」找最長平衡段。
* 三字元情況：利用「兩個差值組合狀態」找最長平衡段。

用一次由左到右掃描，同步維護上述三類情況的最佳答案，即可在可接受時間內求解。

## 解題步驟

### Step 1：讀取長度並處理極小輸入

長度為 1 時，整串必然平衡，直接回傳長度即可。

```typescript
const length = s.length;

// 處理極小輸入：整個字串必然平衡
if (length <= 1) {
  return length;
}
```

### Step 2：建立三組「雙字母差值追蹤表」所需的配置

因為差值範圍落在 `[-length, length]`，用 offset 轉成合法索引。
並用「stamp」方式在遇到第三字元時快速重置分段狀態（避免 O(n) 清表）。

```typescript
// 使用 offset 索引配置差值表，讓差值範圍 [-length, length] 可映射到合法索引
const differenceIndexOffset = length;
const differenceArraySize = (length << 1) + 1;

// AB 追蹤器（不含 'c' 的區段），使用 stamp 避免 O(n) 重置
const earliestPrefixIndexForAB = new Int32Array(differenceArraySize);
const seenStampForAB = new Uint32Array(differenceArraySize);
let currentStampForAB = 1;
let differenceAB = 0;
seenStampForAB[differenceIndexOffset] = currentStampForAB;
earliestPrefixIndexForAB[differenceIndexOffset] = 0;

// AC 追蹤器（不含 'b' 的區段），使用 stamp 避免 O(n) 重置
const earliestPrefixIndexForAC = new Int32Array(differenceArraySize);
const seenStampForAC = new Uint32Array(differenceArraySize);
let currentStampForAC = 1;
let differenceAC = 0;
seenStampForAC[differenceIndexOffset] = currentStampForAC;
earliestPrefixIndexForAC[differenceIndexOffset] = 0;

// BC 追蹤器（不含 'a' 的區段），使用 stamp 避免 O(n) 重置
const earliestPrefixIndexForBC = new Int32Array(differenceArraySize);
const seenStampForBC = new Uint32Array(differenceArraySize);
let currentStampForBC = 1;
let differenceBC = 0;
seenStampForBC[differenceIndexOffset] = currentStampForBC;
earliestPrefixIndexForBC[differenceIndexOffset] = 0;
```

### Step 3：輔助函式 `nextPowerOfTwo` — 計算雜湊表容量

此函式回傳大於等於指定值的最小 2 次方，用於開放定址雜湊表容量配置。

```typescript
/**
 * @param value
 * @returns 大於等於 value 的最小 2 次方（最小為 1）
 */
function nextPowerOfTwo(value: number): number {
  // 直接處理小值，避免位移行為不明確
  if (value <= 1) {
    return 1;
  }
  // 用前導零數計算下一個 2 次方
  return 1 << (32 - Math.clz32((value - 1) | 0));
}
```

### Step 4：建立三字母平衡狀態的雜湊表並加入初始前綴狀態

三字母平衡需要追蹤 `(countA-countB, countA-countC)` 這對差值狀態；
用開放定址雜湊表記錄「某狀態最早出現的前綴位置」，以便計算最長距離。

```typescript
// 建立三字母平衡狀態的開放定址雜湊表：(countA-countB, countA-countC)
const expectedPrefixStates = length + 1;
const hashCapacity = nextPowerOfTwo((((expectedPrefixStates << 2) / 3) + 8) | 0);
const hashMask = hashCapacity - 1;

const deltaAminusBKeyTable = new Int32Array(hashCapacity);
const deltaAminusCKeyTable = new Int32Array(hashCapacity);
const earliestPrefixIndexPlusOneTable = new Int32Array(hashCapacity); // 0 表示空槽，否則存 earliestPrefixIndex + 1

// 加入初始前綴狀態，讓從 0 開始的平衡子字串能被偵測
let initialHashIndex = 0;
while (true) {
  const storedEarliestPlusOne = earliestPrefixIndexPlusOneTable[initialHashIndex];
  if (storedEarliestPlusOne === 0) {
    deltaAminusBKeyTable[initialHashIndex] = 0;
    deltaAminusCKeyTable[initialHashIndex] = 0;
    earliestPrefixIndexPlusOneTable[initialHashIndex] = 1;
    break;
  }
  if (deltaAminusBKeyTable[initialHashIndex] === 0 && deltaAminusCKeyTable[initialHashIndex] === 0) {
    break;
  }
  initialHashIndex = (initialHashIndex + 1) & hashMask;
}
```

### Step 5：初始化單字元連續段追蹤器與三字母差值

單字元平衡就是找最大連續段；同時準備三字母差值追蹤用的兩個前綴差。

```typescript
// 追蹤最長單字元連續段，以涵蓋「只含一種字元」的平衡情況
let bestLength = 1;
let previousCharacterCode = (s.charCodeAt(0) - 97) | 0;
let currentRunLength = 1;

// 維護三字母平衡用的前綴差值
let deltaAminusB = 0;
let deltaAminusC = 0;
```

### Step 6：主迴圈骨架 — 逐字掃描並同步更新四種追蹤器

這個單次掃描同時更新：

* 單字元連續段
* 三字母平衡狀態
* 三組雙字母分段平衡（AB / AC / BC）

```typescript
// 單次由左到右掃描，同步更新單字元連續段、三字母平衡、與三組雙字母追蹤器
for (let position = 0; position < length; position += 1) {
  const currentCharacterCode = (s.charCodeAt(position) - 97) | 0;
  const currentPrefixIndex = position + 1;

  // ...
}
```

### Step 7：更新單字元連續段（只含一種字元的平衡情況）

```typescript
for (let position = 0; position < length; position += 1) {
  // Step 6：主迴圈骨架

  const currentCharacterCode = (s.charCodeAt(position) - 97) | 0;
  const currentPrefixIndex = position + 1;

  // 更新單字元連續段追蹤器（只含一種字元必然平衡）
  if (position !== 0) {
    if (currentCharacterCode === previousCharacterCode) {
      currentRunLength += 1;
    } else {
      if (currentRunLength > bestLength) {
        bestLength = currentRunLength;
      }
      currentRunLength = 1;
      previousCharacterCode = currentCharacterCode;
    }
  }

  // ...
}
```

### Step 8：更新三字母前綴差值狀態

```typescript
for (let position = 0; position < length; position += 1) {
  // Step 6：主迴圈骨架

  // Step 7：更新單字元連續段

  // 更新 (countA-countB) 與 (countA-countC)
  if (currentCharacterCode === 0) {
    deltaAminusB += 1;
    deltaAminusC += 1;
  } else if (currentCharacterCode === 1) {
    deltaAminusB -= 1;
  } else {
    deltaAminusC -= 1;
  }

  // ...
}
```

### Step 9：三字母平衡探測（雜湊表查找/插入）

若同一組 `(deltaAminusB, deltaAminusC)` 再次出現，代表中間子字串三字母增量一致，因此平衡；更新最佳長度。

```typescript
for (let position = 0; position < length; position += 1) {
  // Step 6：主迴圈骨架

  // Step 7：更新單字元連續段

  // Step 8：更新三字母前綴差值

  // 三字母平衡：查找最早相同差值狀態，或插入當前狀態
  let hashValue = (Math.imul(deltaAminusB, 73856093) ^ Math.imul(deltaAminusC, 19349663)) | 0;
  hashValue ^= hashValue >>> 16;
  let hashIndex = hashValue & hashMask;

  while (true) {
    const storedEarliestPlusOne = earliestPrefixIndexPlusOneTable[hashIndex];

    // 找到空槽則插入當前狀態
    if (storedEarliestPlusOne === 0) {
      deltaAminusBKeyTable[hashIndex] = deltaAminusB;
      deltaAminusCKeyTable[hashIndex] = deltaAminusC;
      earliestPrefixIndexPlusOneTable[hashIndex] = currentPrefixIndex + 1;
      break;
    }

    // 命中同狀態則可形成平衡子字串，計算長度
    if (deltaAminusBKeyTable[hashIndex] === deltaAminusB && deltaAminusCKeyTable[hashIndex] === deltaAminusC) {
      const earliestPrefixIndex = storedEarliestPlusOne - 1;
      const candidateLength = currentPrefixIndex - earliestPrefixIndex;
      if (candidateLength > bestLength) {
        bestLength = candidateLength;
      }
      break;
    }

    // 線性探測處理碰撞
    hashIndex = (hashIndex + 1) & hashMask;
  }

  // ...
}
```

### Step 10：雙字母分段追蹤 — AB / AC / BC（遇到第三字母就重置分段）

在不含第三字母的分段內，維護兩字母計數差；若差值重現，代表該段中間子字串兩者增量相等，因此平衡。

```typescript
for (let position = 0; position < length; position += 1) {
  // Step 6：主迴圈骨架

  // Step 7：更新單字元連續段

  // Step 8：更新三字母前綴差值

  // Step 9：三字母平衡探測（雜湊表查找/插入）

  // AB 分段追蹤：遇到 'c' 就重置；否則更新差值並查最早出現位置
  if (currentCharacterCode === 2) {
    currentStampForAB += 1;
    differenceAB = 0;
    seenStampForAB[differenceIndexOffset] = currentStampForAB;
    earliestPrefixIndexForAB[differenceIndexOffset] = currentPrefixIndex;
  } else {
    if (currentCharacterCode === 0) {
      differenceAB += 1;
    } else {
      differenceAB -= 1;
    }
    const differenceTableIndexAB = differenceAB + differenceIndexOffset;
    if (seenStampForAB[differenceTableIndexAB] === currentStampForAB) {
      const candidateLength = currentPrefixIndex - earliestPrefixIndexForAB[differenceTableIndexAB];
      if (candidateLength > bestLength) {
        bestLength = candidateLength;
      }
    } else {
      seenStampForAB[differenceTableIndexAB] = currentStampForAB;
      earliestPrefixIndexForAB[differenceTableIndexAB] = currentPrefixIndex;
    }
  }

  // AC 分段追蹤：遇到 'b' 就重置；否則更新差值並查最早出現位置
  if (currentCharacterCode === 1) {
    currentStampForAC += 1;
    differenceAC = 0;
    seenStampForAC[differenceIndexOffset] = currentStampForAC;
    earliestPrefixIndexForAC[differenceIndexOffset] = currentPrefixIndex;
  } else {
    if (currentCharacterCode === 0) {
      differenceAC += 1;
    } else {
      differenceAC -= 1;
    }
    const differenceTableIndexAC = differenceAC + differenceIndexOffset;
    if (seenStampForAC[differenceTableIndexAC] === currentStampForAC) {
      const candidateLength = currentPrefixIndex - earliestPrefixIndexForAC[differenceTableIndexAC];
      if (candidateLength > bestLength) {
        bestLength = candidateLength;
      }
    } else {
      seenStampForAC[differenceTableIndexAC] = currentStampForAC;
      earliestPrefixIndexForAC[differenceTableIndexAC] = currentPrefixIndex;
    }
  }

  // BC 分段追蹤：遇到 'a' 就重置；否則更新差值並查最早出現位置
  if (currentCharacterCode === 0) {
    currentStampForBC += 1;
    differenceBC = 0;
    seenStampForBC[differenceIndexOffset] = currentStampForBC;
    earliestPrefixIndexForBC[differenceIndexOffset] = currentPrefixIndex;
  } else {
    if (currentCharacterCode === 1) {
      differenceBC += 1;
    } else {
      differenceBC -= 1;
    }
    const differenceTableIndexBC = differenceBC + differenceIndexOffset;
    if (seenStampForBC[differenceTableIndexBC] === currentStampForBC) {
      const candidateLength = currentPrefixIndex - earliestPrefixIndexForBC[differenceTableIndexBC];
      if (candidateLength > bestLength) {
        bestLength = candidateLength;
      }
    } else {
      seenStampForBC[differenceTableIndexBC] = currentStampForBC;
      earliestPrefixIndexForBC[differenceTableIndexBC] = currentPrefixIndex;
    }
  }
}
```

### Step 11：合併最後一段單字元連續段並回傳答案

掃描結束後，還需把最後一段連續段長度併入答案，最後回傳。

```typescript
// 合併最後一段單字元連續段
if (currentRunLength > bestLength) {
  bestLength = currentRunLength;
}

return bestLength;
```

## 時間複雜度

- 前置初始化與多個長度為 `O(n)` 的陣列配置：$O(n)$。
- 主迴圈掃描 `n` 次：外層 `for` 為 $O(n)$。
- 但三字母平衡使用**開放定址線性探測雜湊表**：在最壞情況下，每次查找/插入可能探測 $O(n)$ 個槽位，累積最壞可達 $O(n^2)$。
- 三組雙字母分段追蹤在每次迭代皆為常數步驟：$O(1)$ / 次，合計 $O(n)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 三組雙字母差值表與 stamp 表：各為 `O(n)`，合計仍為 $O(n)$。
- 三字母平衡雜湊表（三個 table，容量與 `n` 同階）：$O(n)$。
- 其餘變數為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
