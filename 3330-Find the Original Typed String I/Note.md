# 3330. Find the Original Typed String I

Alice is attempting to type a specific string on her computer. 
However, she tends to be clumsy and may press a key for too long, resulting in a character being typed multiple times.

Although Alice tried to focus on her typing, she is aware that she may still have done this at most once.

You are given a string `word`, which represents the final output displayed on Alice's screen.

Return the total number of possible original strings that Alice might have intended to type.

**Constraints:**

- `1 <= word.length <= 100`
- `word` consists only of lowercase English letters.

## 基礎思路

本題的核心是找出 Alice 原本打算輸入的字串可能有多少種情況。根據題意，Alice 在輸入過程中最多只有一次「長按」，導致某個字符重複出現多次。因此：

- 若 Alice 從未失誤，則原始字串與輸出的字串完全相同。
- 若 Alice 有一次失誤，則原始字串中某個連續重複字符區塊（例如 `aa` 或 `ccc`）本來應只有一個字符，但卻因為長按變成多個。

因此，要計算可能的原始字串數量，只需觀察字串中連續字符區塊的個數即可，因為每個區塊皆可能獨立地由長按所形成，故原始可能字串的數量即為連續字符區塊的數量。

透過上述邏輯，我們可以簡化問題為：

- 統計給定字串有多少個「連續相同字符區塊」。
- 計算區塊數目，即為可能的原始字串數量。

## 解題步驟

### Step 1：初始化輔助變數

初始化字串長度與紀錄字符變化次數的變數：

```typescript
const characterCount = word.length;
let transitionCount = 0;  // 計算相鄰字符不同的次數
```

### Step 2：逐一檢查相鄰字符差異

從字串第二個字符開始，逐一比對與前一個字符是否相同，以計算連續字符區塊之間的邊界數：

```typescript
// 計算相鄰字符不同的次數（即字符區塊的邊界）
for (let currentIndex = 1; currentIndex < characterCount; currentIndex++) {
  // 為提升效能，直接比較字符的 char code
  if (word.charCodeAt(currentIndex) !== word.charCodeAt(currentIndex - 1)) {
    transitionCount++;
  }
}
```

### Step 3：根據區塊數計算可能的原始字串數量

連續字符區塊數量即為字串長度減去字符變化次數：

```typescript
// 最終答案 = 總字符數 - 字符轉換（transition）次數
return characterCount - transitionCount;
```

## 時間複雜度

- 僅需遍歷字串一次，每次操作皆為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的輔助變數，未使用任何額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
