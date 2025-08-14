# 2264. Largest 3-Same-Digit Number in String

You are given a string `num` representing a large integer. 
An integer is good if it meets the following conditions:

- It is a substring of `num` with length `3`.
- It consists of only one unique digit.

Return the maximum good integer as a string or an empty string `""` if no such integer exists.

Note:

- A substring is a contiguous sequence of characters within a string.
- There may be leading zeroes in `num` or a good integer.

**Constraints:**

- `3 <= num.length <= 1000`
- `num` only consists of digits.

## 基礎思路

本題要求找出在字串 `num` 中所有「長度為 3 且由同一個數字組成」的子字串，回傳數值上最大的那一組三位數字字串（如 `"777"`），若無則回傳空字串 `""`。

解題的關鍵在於：

- 只需線性掃描字串一次，即可用常數空間記錄目前連續數字的長度與當前最大數字。
- 每當連續出現三個相同數字時，更新最大數字。
- 若出現 `"999"` 可立即回傳，因為沒有更大的可能。
- 透過預先建立長度為 3 的相同數字字串（如 `"111"`, `"222"`...），可在最後直接 O(1) 取出結果，避免每次手動拼接字串。

## 解題步驟

### Step 1：預先建立三位數字串陣列

首先預先定義所有可能的「三個相同數字」的字串（`"000"` 到 `"999"`），方便之後直接回傳。

```typescript
const PRECOMPUTED_TRIPLES = [
  "000","111","222","333","444","555","666","777","888","999"
] as const;
```

### Step 2：初始化追蹤變數

- `bestDigit`：紀錄目前找到最大的三連數字（-1 表示尚未找到）。
- `previousCharCode`：上一個字元的 ASCII 碼，用來判斷連續性。
- `consecutiveCount`：連續相同數字出現的次數。

```typescript
let bestDigit = -1; // 尚未找到三連數字時為 -1
let previousCharCode = -1; // 初始化為 -1 保證第一輪比較能成立
let consecutiveCount = 0; // 記錄連續相同數字的次數
```

### Step 3：單次線性掃描

依序檢查每個字元，維護連續相同數字的次數：

1. 取得目前字元的 ASCII 碼。
2. 若與上一字元相同，`consecutiveCount++`，否則重設為 1。
3. 若連續出現達 3 次以上，計算該數字，若為 9 則直接回傳 `"999"`，否則若比目前記錄的最大值還大則更新 `bestDigit`。

```typescript
for (let index = 0; index < num.length; index++) {
  const currentCharCode = num.charCodeAt(index); // '0'..'9' => 48..57

  if (currentCharCode === previousCharCode) {
    consecutiveCount++;
  } else {
    previousCharCode = currentCharCode;
    consecutiveCount = 1;
  }

  if (consecutiveCount >= 3) {
    const currentDigit = currentCharCode - 48; // 轉為數字
    if (currentDigit === 9) {
      // 最佳情況，直接回傳
      return PRECOMPUTED_TRIPLES[9];
    }
    if (currentDigit > bestDigit) {
      bestDigit = currentDigit;
    }
    // 之後若遇更長的連續，僅需繼續維護 bestDigit 即可
  }
}
```

### Step 4：回傳結果

- 若 `bestDigit` 大於等於 0，直接從預建陣列回傳對應字串。
- 否則回傳空字串 `""`。

```typescript
return bestDigit >= 0 ? PRECOMPUTED_TRIPLES[bestDigit] : "";
```

## 時間複雜度

- **單次掃描**：對 `num` 做一次線性遍歷，每次操作皆為常數時間，總時間複雜度為 $O(n)$，其中 $n$ 為字串長度。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **預建陣列**：固定長度 10，不隨輸入成長。
- 其他僅用到數個變數，皆為常數空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
