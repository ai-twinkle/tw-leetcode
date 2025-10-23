# 3461. Check If Digits Are Equal in String After Operations I

You are given a string `s` consisting of digits. 
Perform the following operation repeatedly until the string has exactly two digits:

- For each pair of consecutive digits in `s`, starting from the first digit, calculate a new digit as the sum of the two digits modulo 10.
- Replace `s` with the sequence of newly calculated digits, maintaining the order in which they are computed.

Return `true` if the final two digits in `s` are the same; otherwise, return `false`.

**Constraints:**

- `3 <= s.length <= 100`
- `s` consists of only digits.

## 基礎思路

本題要求對一個由數字字元組成的字串 `s`，重複進行「相鄰數字求和取模 10」的操作，直到字串僅剩下兩位數為止。最後判斷這兩位是否相同。

我們可以模擬這個過程：
若輸入 `s = "1234"`，則轉換過程如下：

- 第一次：`[1,2,3,4] → [(1+2)%10, (2+3)%10, (3+4)%10] → [3,5,7]`
- 第二次：`[3,5,7] → [(3+5)%10, (5+7)%10] → [8,2]`
  結果 `[8,2]` 不相等 → 回傳 `false`。

在思考解法時，我們需要特別注意：

- 每輪會使長度減少 1，直到剩 2 位為止；
- 每一位的新數字僅與當前相鄰兩位相關，無需保留整個過程歷史；
- 操作僅涉及數字加法與取模，能以整數運算快速完成；
- 長度上限為 100，故可直接以模擬法處理。

為了解決這個問題，我們可以採用以下策略：

- **數值轉換**：先將輸入字串轉為整數陣列，以便進行快速數值運算；
- **迭代縮減**：每次建立新的陣列 `next`，由相鄰兩數求和後取模 10 得出新序列；
- **覆寫更新**：每輪完成後令 `current = next`，並使長度減 1；
- **最終判斷**：當剩下兩位時，直接比較是否相等並回傳結果。

## 解題步驟

### Step 1：轉換輸入字串為數字陣列

將輸入字串 `s` 轉為 `Uint8Array` 型態的數值陣列，方便進行數值加總與取模操作。

```typescript
// 將輸入字串轉為數字陣列，以提升算術效率
const length = s.length;
let current = new Uint8Array(length);
for (let i = 0; i < length; i++) {
  current[i] = s.charCodeAt(i) - 48; // 字元 '0' 的 ASCII 為 48
}
```

### Step 2：重複縮減數列至僅剩兩位

當前長度大於 2 時，不斷重複以下步驟：

1. 生成長度為 `n-1` 的新陣列；
2. 對每對相鄰數字取和並模 10；
3. 用新陣列覆蓋舊序列。

```typescript
// 迭代縮減序列，直到僅剩兩位
let effectiveLength = length;
while (effectiveLength > 2) {
  const next = new Uint8Array(effectiveLength - 1);

  // 每個新數字為相鄰兩位的和取模 10
  for (let i = 0; i < effectiveLength - 1; i++) {
    next[i] = (current[i] + current[i + 1]) % 10;
  }

  // 更新至下一輪縮減後的序列
  current = next;
  effectiveLength--;
}
```

### Step 3：比較最後兩位是否相等

縮減完成後，僅剩兩位數，直接比較是否相等。

```typescript
// 回傳最後兩位是否相等
return current[0] === current[1];
```

## 時間複雜度

- 每輪需遍歷當前長度 $n$，總長度每輪減 1。
- 總計操作次數為 $n + (n-1) + (n-2) + \dots + 3 = O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 每次僅維護當前與下一輪的兩個陣列，長度最多為 $n$。
- 空間使用不隨縮減次數增加，維持線性級別。
- 總空間複雜度為 $O(n)$。

> $O(n)$
