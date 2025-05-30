# 1358. Number of Substrings Containing All Three Characters

Given a string `s` consisting only of characters a, b and c.

Return the number of substrings containing at least one occurrence of all these characters a, b and c.

**Constraints:**

- `3 <= s.length <= 5 x 10^4`
- `s` only consists of a, b or c characters.

## 基礎思路

這題要求計算字串中**同時包含 a、b、c 的所有子字串數量**。
直接枚舉每個子字串檢查是否包含三個字母，會導致過高的時間複雜度。

我們觀察題目要求的子字串特性：

- 注意到子字串若同時包含 a、b、c，一定是在三個字母最早都出現過之後才可能成立。
- 我們可以將問題轉化為：如何快速判斷一個子字串是否同時包含 a、b、c，並統計這類子字串的數量。
- 由於字元種類只有三種，這讓我們有機會用更簡單的方式來追蹤三個字母的出現狀況，進而有效避開暴力窮舉的瓶頸。
- 因此，解題核心是尋找一種可以在線性時間內，快速判斷並統計每個區間是否同時包含三個字母的方法。

### 範例分析

Input: s = "abcabc"

- **lastPositions**：用一個長度為 3 的 `Uint16Array` 儲存字元 a、b、c 的最後出現位置（採用 1-indexed 表示法），初始值皆為 0
- **totalSubstrings**：子字串總數，初始為 0

| i (索引) | 當前字元 | 更新後的 lastPositions | 計算 min(lastPositions) | 當前有效子字串數 | 累加後 totalSubstrings |
|--------|------|--------------------|-----------------------|----------|---------------------|
| 0      | 'a'  | [1, 0, 0]          | min(1, 0, 0) = 0      | 0        | 0 + 0 = 0           |
| 1      | 'b'  | [1, 2, 0]          | min(1, 2, 0) = 0      | 0        | 0 + 0 = 0           |
| 2      | 'c'  | [1, 2, 3]          | min(1, 2, 3) = 1      | 1        | 0 + 1 = 1           |
| 3      | 'a'  | [4, 2, 3]          | min(4, 2, 3) = 2      | 2        | 1 + 2 = 3           |
| 4      | 'b'  | [4, 5, 3]          | min(4, 5, 3) = 3      | 3        | 3 + 3 = 6           |
| 5      | 'c'  | [4, 5, 6]          | min(4, 5, 6) = 4      | 4        | 6 + 4 = 10          |

Output: 10

## 解題步驟

### Step 1: 初始化變數

我們先紀錄字串長度，並初始化 `lastPositions` 和 `totalSubstrings`。

```typescript
const n = s.length;

const lastPositions = new Uint16Array(3);
let totalSubstrings = 0;
```

### Step 2: 遍歷字串

我們遍歷字串，並根據當前字元更新 `lastPositions` 和 `totalSubstrings`。

```typescript
for (let i = 0; i < n; i++) {
  // 更新當前字元的最後出現位置
  const charIndex = s.charCodeAt(i) - 97; // 'a' 的 ASCII 碼為 97
  lastPositions[charIndex] = i + 1;

  // 利用 lastPositions 中的最小值，計算當前位置的有效子字串數量
  totalSubstrings += Math.min(lastPositions[0], lastPositions[1], lastPositions[2]);
}
```

## 時間複雜度

- 我們只需遍歷一次字串，時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們使用了一個長度為 3 的 `Uint16Array`，空間複雜度為 $O(1)$。
- 其他變數的空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
