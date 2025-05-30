# 1400. Construct K Palindrome Strings

Given a string s and an integer k, return true if you can use all the characters in s to construct k palindrome strings or false otherwise.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists of lowercase English letters.
- `1 <= k <= 10^5`

## 基礎思路

在這題中，我們需要判斷是否可以將字串 `s` 中所有字元分割成 `k` 個回文子串，且每個字元都必須用到。**關鍵觀察**在於回文的構造性質：

- 一個回文字串最多只能有一個字元出現奇數次（作為中心），其餘字元都必須成對出現。
- 因此，若字串中有 $x$ 種字元出現奇數次，則至少需要 $x$ 個回文串來安置這些中心字元，否則無法組成全部回文。
- 另外，每個回文串至少需要 1 個字元，因此如果 $s$ 的長度小於 $k$，一定不可能劃分成功。

所以我們可以用以下步驟來解決這個問題：

1. 統計所有字元出現奇偶數，得到奇數次的字元數 $x$。
2. 判斷 $x \leq k \leq s.length$ 是否成立。

若成立，則可以分配；否則無法分配。

## 解題步驟

### Step 1：長度檢查，若長度不足直接返回

這裡直接判斷 `s` 的長度是否小於 `k`，如果是，代表每個回文串至少都分不到一個字元，直接返回 `false`。

```typescript
const stringLength = s.length;
// 快速檢查：若字串長度小於 k，無法分配每個回文至少一個字元
if (stringLength < k) {
  return false;
}
```

### Step 2：利用位元運算計算每個字母出現的奇偶性

用一個 26 位的整數，每個位元記錄對應字母目前出現的奇偶狀態（偶數次為 0，奇數次為 1）。
這種寫法可以讓我們 $O(1)$ 時間檢查 26 個字母的奇偶分布，效率極高。

```typescript
// 準備 26 個位元的遮罩，每一位代表一個字母的奇偶性
const baseCharCode = 97; // 'a'
let letterParityBitmask = 0;

for (let i = 0; i < stringLength; ++i) {
  const letterIndex = s.charCodeAt(i) - baseCharCode;
  letterParityBitmask ^= (1 << letterIndex);
}
```

### Step 3：計算奇數次出現的字元數，並提前中斷

這裡利用「清除最低位 1」的位元操作快速計算 1 的個數，即奇數次出現的字母數。
每發現一個就遞增計數，若計數超過 $k$ 可立刻返回 `false`，否則最後返回 `true`。

```typescript
// 統計有幾個字母出現奇數次
let oddCharacterCount = 0;
while (letterParityBitmask !== 0) {
  // 清除最低位的 1
  letterParityBitmask &= (letterParityBitmask - 1);
  ++oddCharacterCount;

  // 如果已超過 k，直接返回 false
  if (oddCharacterCount > k) {
    return false;
  }
}

return true;
```

## 時間複雜度

- 遍歷字串計算奇偶遮罩：$O(n)$。
- 統計 1 的個數最多 26 次，視為常數 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數與變數，沒有額外陣列或集合。
- 總空間複雜度為 $O(1)$。

> $O(1)$$
