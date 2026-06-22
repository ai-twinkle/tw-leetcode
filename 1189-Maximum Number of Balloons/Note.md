# 1189. Maximum Number of Balloons

Given a string `text`, you want to use the characters of `text` to form as many instances of the word "balloon" as possible.

You can use each character in `text` at most once. 
Return the maximum number of instances that can be formed.

**Constraints:**

- `1 <= text.length <= 10^4`
- `text` consists of lower case English letters only.

## 基礎思路

本題要求計算字串中最多能組成幾個完整的 "balloon"，每個字元最多只能使用一次。

在思考解法時，可掌握以下核心觀察：

- **字母需求不對等**：
  "balloon" 中 `l` 與 `o` 各需要 2 個，而 `b`、`a`、`n` 各只需要 1 個，因此不能單純計算出現次數，需對 `l` 與 `o` 的頻率進行折半處理。

- **可組成的數量由最稀缺的字母決定**：
  每個必要字元能提供的「份數」即為其頻率除以所需數量，所有字元中份數最少者即為答案的上界。

- **固定字元集允許使用定長陣列替代雜湊表**：
  輸入僅包含小寫英文字母，可以用長度 26 的整數陣列以字元的 ASCII 偏移量作為索引，省去雜湊運算的額外開銷。

依據以上特性，可以採用以下策略：

- **單次遍歷字串，統計所有字元的出現頻率**。
- **對 `l` 與 `o` 的頻率各取一半，換算為可提供的份數**。
- **對五個必要字元的份數取最小值，即為最終答案**。

此策略僅需線性掃描一次，並以常數次比較得出結果，整體簡潔高效。

## 解題步驟

### Step 1：初始化字元頻率表

以長度 26 的整數陣列記錄每個小寫字母的出現次數，索引值為該字母的 ASCII 碼減去 `'a'` 的 ASCII 碼（97），使 `'a'` 對應索引 0、`'z'` 對應索引 25。

```typescript
// 每個小寫字母各一個槽位，以 charCode − 97 作為索引
const frequencyTable = new Int32Array(26);

const textLength = text.length;
```

### Step 2：單次遍歷累計所有字元頻率

依序走訪字串中每個字元，將其對應索引的計數加一，一次掃描即可取得全部頻率資訊。

```typescript
// 單次遍歷：累計所有字元的出現次數
for (let index = 0; index < textLength; index++) {
  frequencyTable[text.charCodeAt(index) - 97]++; // 97 = 'a' 的字元碼
}
```

### Step 3：換算各字元可提供的份數並取最小值回傳

"balloon" 中 `l` 與 `o` 各需 2 個，因此先將兩者的頻率右移一位（等同除以 2）換算為可提供的份數；再對全部五個必要字元的份數取最小值，即為最多能組成的 "balloon" 數量。

```typescript
// "balloon" 中 l×2 與 o×2 — 取最小值前先將這兩者折半
return Math.min(
  frequencyTable[1],       // b = 索引 1
  frequencyTable[0],       // a = 索引 0
  frequencyTable[11] >> 1, // l = 索引 11，每個 balloon 需要 2 個
  frequencyTable[14] >> 1, // o = 索引 14，每個 balloon 需要 2 個
  frequencyTable[13]       // n = 索引 13
);
```

## 時間複雜度

- 單次遍歷字串，長度為 $n$，每次操作為常數時間；
- 最後的 `Math.min` 比較固定五個值，為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定長度 26 的整數陣列儲存頻率，與輸入大小無關；
- 無任何額外動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
