# 3498. Reverse Degree of a String

Given a string `s`, calculate its reverse degree.

The reverse degree is calculated as follows:

1. For each character, multiply its position in the reversed alphabet 
   (`'a'` = 26, `'b'` = 25, ..., `'z'` = 1) with its position in the string (1-indexed).
2. Sum these products for all characters in the string.

Return the reverse degree of `s`.

**Constraints:**

- `1 <= s.length <= 1000`
- `s` contains only lowercase English letters.

## 基礎思路

本題要求計算字串的「反轉度」：將每個字元在反轉字母表中的名次，乘上它在字串中的位置（由 1 起算），再把所有乘積加總。題目本身定義直觀，因此重點在於如何以最精簡的方式完成計算。

在思考解法時，可掌握以下核心觀察：

- **反轉名次與原始字元編碼呈線性關係**：
  反轉字母表的名次可由一個固定常數減去該字元的編碼得到，兩者之間僅相差一個平移與取負，並非需要額外查表的映射。

- **總和可依線性關係拆成兩部分**：
  既然每一項都是「位置 ×（常數 − 編碼）」，整個總和便能拆成「常數 × 所有位置之和」與「位置加權的編碼總和」兩塊，兩者相減即為答案。

- **位置之和具有封閉公式**：
  所有位置的總和即為等差級數（三角形數），可用公式直接求得，無須在迴圈中逐次累加。

- **僅有編碼加權和需要實際掃描**：
  因為編碼隨字元而異，無法以公式取代，這是唯一必須逐字處理的部分。

依據以上特性，可以採用以下策略：

- **以單一次掃描累積位置加權的字元編碼總和**，作為扣除項。
- **將常數項提出，並以等差級數公式一次算出所有位置之和**，乘上該常數作為主項。
- **兩者相減後直接回傳**，即可在線性時間內完成計算。

此策略避免了任何字母表查詢與額外的資料結構，將計算壓縮為一次掃描加上常數次運算。

## 解題步驟

### Step 1：取得字串長度

先取出字串長度，供後續掃描與等差級數公式使用。

```typescript
const length = s.length;
```

### Step 2：累積位置加權的字元編碼總和

逐一走訪字串中的每個字元，將其位置（由 1 起算）乘上該字元的原始編碼後累加，得到扣除項所需的總和。

```typescript
// 累積位置加權的原始字元編碼總和
let weightedCodeSum = 0;
for (let index = 0; index < length; index++) {
  weightedCodeSum += (index + 1) * s.charCodeAt(index);
}
```

### Step 3：以等差級數公式補齊常數項並回傳結果

由於反轉後的名次等於固定常數減去原始編碼，可將該常數提出，乘上由三角形數公式求得的所有位置總和，再減去前一步累積的加權編碼總和，即為答案。

```typescript
// 反轉後的值為 (123 - 編碼)，因此把 123 提出，並以三角形數 n(n + 1) / 2 計算位置總和
return 123 * ((length * (length + 1)) >> 1) - weightedCodeSum;
```

## 時間複雜度

- 僅以一次線性掃描走訪字串中的每個字元，為 $O(n)$；
- 等差級數公式與最終運算皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數；
- 未配置任何額外陣列或查表結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
