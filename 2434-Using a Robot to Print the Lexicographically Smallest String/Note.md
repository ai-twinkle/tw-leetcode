# 2434. Using a Robot to Print the Lexicographically Smallest String

You are given a string `s` and a `robot` that currently holds an empty string `t`. 
Apply one of the following operations until `s` and `t` are both empty:

- Remove the first character of a string `s` and give it to the robot. 
  The robot will append this character to the string `t`.
- Remove the last character of a string `t` and give it to the robot. 
  The robot will write this character on paper.

Return the lexicographically smallest string that can be written on the paper.

**Constraints:**

- 1 <= s.length <= 10^5
- `s` consists of only English lowercase letters.

## 基礎思路

本題的核心概念是要透過兩個操作（將原始字串 $s$ 字元推入暫存字串 $t$ 以及從 $t$ 的末端彈出字元寫到紙上）來達到輸出的字串在字典序上最小。
因此，我們必須妥善決定每個字元何時應該保留在暫存區，何時又該寫到紙上。

為確保輸出字串最小，我們應當：

1. **盡早寫出字典序較小的字元**。
2. **當暫存區 $t$ 頂端的字元字典序不會大於後續可能出現的字元時，即刻寫出此字元到紙上**。

為了實現上述策略，我們需要維護：

- 原始字串中剩餘未處理字元的頻率，以掌握未來可能出現的最小字元。
- 一個堆疊來模擬暫存區 $t$。

透過此方式，能確保最終輸出字串必定是字典序最小的可能結果。

## 解題步驟

### Step 1：取得輸入字串長度，建立輔助陣列及變數

首先取得字串 $s$ 的長度，後續用於迴圈及陣列大小。

```typescript
// 1. Length of the input string
const stringLength = s.length;
```

### Step 2：計算字串中各字母的頻率

建立一個長度為 26 的陣列，儲存字母在原字串中的頻率。

```typescript
// 2. Count frequencies of each letter (0..25) in a Uint32Array.
//    This loop does one pass: charCodeAt → minus 97 → increment freq.
const letterFrequencies = new Uint32Array(26);
for (let index = 0; index < stringLength; index++) {
  const code = s.charCodeAt(index) - 97;
  letterFrequencies[code]++;
}
```

### Step 3：找出當前最小尚存字元

找出當前最小的且尚未用完的字母。

```typescript
// 3. Find the smallest letter‐code that still appears in s.
let minRemainingCharCode = 0;
while (
  minRemainingCharCode < 26 &&
  letterFrequencies[minRemainingCharCode] === 0
) {
  minRemainingCharCode++;
}
```

### Step 4：建立堆疊模擬暫存區 $t$

使用堆疊儲存從 $s$ 推入的字元，模擬暫存區的行為。

```typescript
// 4. Use a Uint8Array as a stack of codes (max size = stringLength).
const stackBuffer = new Uint8Array(stringLength);
let stackPointer = -1; // –1 means “empty stack.”
```

### Step 5：準備輸出緩衝區

預先配置輸出陣列，用以儲存將寫到紙上的字元。

```typescript
// 5. Preallocate output array of bytes (will store ASCII codes of 'a'..'z').
const outputCharCodes = new Uint8Array(stringLength);
let outputPointer = 0; // next free position in outputCharCodes
```
### Step 6：建立字串解碼器

最後將輸出緩衝區轉成字串用。

```typescript
// 6. Create a single TextDecoder for final conversion
const textDecoder = new TextDecoder();
```

### Step 7：逐一處理原字串的每個字元，推入堆疊並適時彈出

每處理一個字元，就更新頻率，必要時更新最小字母代碼，然後判斷是否可立即從堆疊彈出到輸出陣列，以維持字典序最小。

```typescript
// 7. Process each character of s in order (no extra inputCharCodes array)
for (let index = 0; index < stringLength; index++) {
  const currentCharCode = s.charCodeAt(index) - 97;

  const remainingCount = --letterFrequencies[currentCharCode];

  if (
    currentCharCode === minRemainingCharCode &&
    remainingCount === 0
  ) {
    minRemainingCharCode++;
    while (
      minRemainingCharCode < 26 &&
      letterFrequencies[minRemainingCharCode] === 0
    ) {
      minRemainingCharCode++;
    }
  }

  stackBuffer[++stackPointer] = currentCharCode;

  while (
    stackPointer >= 0 &&
    (
      minRemainingCharCode === 26 ||
      stackBuffer[stackPointer] <= minRemainingCharCode
    )
  ) {
    const poppedCode = stackBuffer[stackPointer--];
    outputCharCodes[outputPointer++] = poppedCode + 97;
  }
}
```
### Step 8：處理剩餘堆疊內字元

將剩餘堆疊中的字元依序彈出並存入輸出陣列。

```typescript
// 8. Finally, if anything remains in the stack, pop all and append.
while (stackPointer >= 0) {
  const poppedCode = stackBuffer[stackPointer--];
  outputCharCodes[outputPointer++] = poppedCode + 97;
}
```

### Step 9：將輸出陣列轉成字串後返回

最終將輸出陣列解碼為字串。

```typescript
// 9. Convert the entire byte‐array (ASCII 'a'..'z') into a string at once.
return textDecoder.decode(outputCharCodes);
```

## 時間複雜度

- 對字串 $s$ 遍歷一次，每個字元進行固定次數操作，因此為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小的輔助陣列（如字母頻率陣列，大小固定為 26）。
- 使用與輸入字串同長度的堆疊與輸出陣列，因此空間複雜度為 $O(n)$。

> $O(n)$
