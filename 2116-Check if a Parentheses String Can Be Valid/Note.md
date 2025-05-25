# 2116. Check if a Parentheses String Can Be Valid

A parentheses string is a non-empty string consisting only of `'('` and `')'`. 
It is valid if any of the following conditions is true:

- It is `()`.
- It can be written as `AB` (`A` concatenated with `B`), where `A` and `B` are valid parentheses strings.
- It can be written as `(A)`, where `A` is a valid parentheses string.

You are given a parentheses string `s` and a string `locked`, both of length `n`. 
`locked` is a binary string consisting only of `'0'`s and `'1'`s. 
For each index `i` of `locked`,

- If `locked[i]` is `'1'`, you cannot change `s[i]`.
- But if `locked[i]` is `'0'`, you can change `s[i]` to either `'('` or `')'`.

Return `true` if you can make `s` a valid parentheses string. Otherwise, return `false`.

**Constraints:**

- `n == s.length == locked.length`
- `1 <= n <= 10^5`
- `s[i]` is either `'('` or `')'`.
- `locked[i]` is either `'0'` or `'1'`.

## 基礎思路

本題要判斷給定的括號字串，搭配「可變與不可變」的限制後，是否有辦法調整未鎖定的字元，使其成為一個有效的括號序列。
題目核心在於：

- 有些括號位置是「鎖定」的（不能變），有些則可自由變更成 `(` 或 `)`。
-有效括號必須配對，每一個 `(` 最終要有對應的 `)`。

我們需要考慮以下幾個要點：

1. **長度判斷**：有效括號一定是偶數長度，否則必不成立。
2. **配對彈性**：遇到可變的位置時，能夠依照需要選擇成 `(` 或 `)`，幫助修正不平衡。
3. **平衡檢查**：無論怎麼變換，都要確保在任一掃描階段，不會有過多的右括號，否則失敗。
4. **存在方案**：只要存在一種選擇方案能讓括號全部配對，即算成立。

本題重點是評估「可調整的彈性」能否化解因原始字串或鎖定造成的括號不平衡，並確保每一處都能維持合法配對的可能性。

## 解題步驟

### Step 1：初始化與長度檢查

首先，取得字串長度並檢查是否為奇數，若為奇數長度，則一定不可能形成有效配對，直接回傳 `false`。

```typescript
const n = s.length;
if ((n & 1) === 1) {
  return false;
}

const charOne = 49;           // '1' 的 ASCII 碼
const charLeftBracket = 40;   // '(' 的 ASCII 碼

let minOpenBalance = 0;       // 可能的最少未關閉左括號數量
let maxOpenBalance = 0;       // 可能的最多未關閉左括號數量
```

### Step 2：逐位掃描並彈性調整平衡範圍

遍歷整個字串，針對每個位置依據鎖定與否，調整能維持的未配對左括號區間，同時做及時剪枝與修正。

```typescript
for (let i = 0; i < n; ++i) {
  const lockCode = locked.charCodeAt(i);
  const charCode = s.charCodeAt(i);

  if (lockCode === charOne) {
    // 已鎖定：必須維持原字元
    if (charCode === charLeftBracket) {
      ++minOpenBalance;
      ++maxOpenBalance;
    } else {
      --minOpenBalance;
      --maxOpenBalance;
    }
  } else {
    // 未鎖定：可選 '(' (+1) 或 ')' (-1)
    --minOpenBalance;
    ++maxOpenBalance;
  }

  // 若在任何時候最理想狀況下左括號仍為負，則必定失敗
  if (maxOpenBalance < 0) {
    return false;
  }

  // 修正最少未配對左括號不低於 0
  if (minOpenBalance < 0) {
    minOpenBalance = 0;
  }
}
```

### Step 3：最終平衡驗證

最後確認是否存在一種合法方案使左括號全部配對完畢，即可得出答案。

```typescript
return minOpenBalance === 0;
```

## 時間複雜度

- 主迴圈僅遍歷字串一次，單次操作皆為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅用固定變數，無需額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
