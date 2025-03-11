# 1358. Number of Substrings Containing All Three Characters

Given a string `s` consisting only of characters a, b and c.

Return the number of substrings containing at least one occurrence of all these characters a, b and c.

## 基礎思路

首先，我們先思考一個問題：怎麼知道一個以當前位置為結尾的子字串裡面，是否包含了 a、b、c 這三個字母呢？

答案是只有當這三個字母都出現過後，才能保證子字串中包含它們。
重點在於，我們只需要找出這三個字母中最早出現的那個位置。
換句話說，如果這個最小值是 m（這裡 m 是以 one-based index 表示），那麼以當前位置為結尾的子字串中，所有從起始位置 1 到 m 開始的子字串，都一定包含 a、b、c。
這個幫助我們快速判斷並累加符合條件的子字串數量。

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

- 我們只需遍歷一次字串，時間複雜度為 $O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 我們使用了一個長度為 3 的 `Uint16Array`，空間複雜度為 $O(1)$
- 其他變數的空間複雜度為 $O(1)$
- 總空間複雜度為 $O(1)$

> $O(1)$
