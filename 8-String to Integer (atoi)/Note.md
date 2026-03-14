# 8. String to Integer (atoi)

Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.

The algorithm for `myAtoi(string s)` is as follows:

1. Whitespace: Ignore any leading whitespace (`" "`).
2. Signedness: Determine the sign by checking if the next character is `'-'` or `'+'`, assuming positivity if neither present.
3. Conversion: Read the integer by skipping leading zeros until a non-digit character is encountered or the end of the string is reached. 
   If no digits were read, then the result is 0.
4. Rounding: If the integer is out of the 32-bit signed integer range `[-2^31, 2^31 - 1]`, 
   then round the integer to remain in the range. 
   Specifically, integers less than `-2^31` should be rounded to `-2^31`, 
   and integers greater than `2^31 - 1` should be rounded to `2^31 - 1`.

Return the integer as the final result.

**Constraints:**

- `0 <= s.length <= 200`
- `s` consists of English letters (lower-case and upper-case), digits (`0-9`), `' '`, `'+'`, `'-'`, and `'.'`.

## 基礎思路

本題要求模擬字串轉整數的過程，依序處理前導空白、正負號、數字讀取，以及 32 位元整數範圍的截斷。重點不在於一次性轉換整段字串，而是要按照題目規則，從左到右逐步解析，並在遇到非法情況時立即停止。

在思考解法時，可掌握以下核心觀察：

* **轉換流程具有明確的階段性**：
  必須先略過前導空白，再判斷符號，接著才開始讀取連續數字；任何階段一旦遇到不符合條件的內容，就需依規則停止後續處理。

* **有效數值只來自最前面的連續數字段**：
  一旦開始讀取數字，只能持續接受連續的數字字元；當遇到第一個非數字字元時，後方內容都不再影響結果。

* **溢位判斷不能等到完整轉換後才處理**：
  若先完整構造數值，再檢查是否超界，可能會在中間過程產生不必要的超大值；更穩定的方式是在每次加入新位數前，就先判斷是否即將超出 32 位元整數範圍。

* **正負邊界並不完全對稱**：
  正數上界是 `2^31 - 1`，負數下界是 `-2^31`，因此在邊界判斷時，正負情況最後一位可接受的範圍不同，必須分開處理。

依據以上特性，可以採用以下策略：

* **先依序完成前導空白與符號解析，確定真正開始讀取數字的位置**。
* **從左到右逐位建立整數值，遇到非數字立即停止**。
* **在每次擴展結果前先做邊界檢查，若即將溢位就直接回傳對應的上下界**。
* **最後再依照符號還原最終結果**。

此策略能完整符合題目指定的解析順序，並確保整個過程始終維持在合法的 32 位元整數範圍內。

## 解題步驟

### Step 1：初始化邊界、狀態與起始位置

先準備字串長度、32 位元整數上下界、溢位判斷用的門檻值，以及掃描位置、符號與目前累積的數值，作為後續解析流程的基礎。

```typescript
const length = s.length
const maxInt = 2147483647
const minInt = -2147483648
const overflowThreshold = 214748364
let index = 0
let sign = 1
let value = 0
```

### Step 2：略過前導空白字元

依照題意，所有開頭的空白都不應納入數值解析，因此先持續向右移動，直到遇到第一個非空白字元或字串結束。

```typescript
// 略過前導空白字元
while (index < length && s.charCodeAt(index) === 32) {
  index++
}
```

### Step 3：判斷是否存在正負號

在前導空白處理完後，接著檢查目前位置是否為符號字元。若為負號，則記錄結果應為負數；若為正號，則直接略過；若兩者皆非，則預設維持正數。

```typescript
// 處理可選的正負號
if (index < length) {
  const firstCharacterCode = s.charCodeAt(index)

  if (firstCharacterCode === 45) {
    sign = -1
    index++
  } else if (firstCharacterCode === 43) {
    index++
  }
}
```

### Step 4：逐位讀取數字，並在遇到非數字時停止

接下來從目前位置開始讀取連續數字。每一輪先取得當前字元所代表的數值；若發現不是合法數字，代表數字區段結束，便立即停止解析。

```typescript
// 直接建構數值，並在解析過程中進行截斷
while (index < length) {
  const currentCharacterCode = s.charCodeAt(index)
  const digit = currentCharacterCode - 48

  if (digit < 0 || digit > 9) {
    break
  }

  // ...
}
```

### Step 5：在擴展結果前先檢查是否會溢位

當前位數確定合法後，不能立刻併入結果，而是要先判斷若將它接到尾端，是否會超出 32 位元整數範圍。若會超界，則直接依符號回傳對應的最大值或最小值。

```typescript
while (index < length) {
  // Step 4：逐位讀取數字，並在遇到非數字時停止

  // 在乘上 10 前先截斷，避免不必要的後續運算
  if (value > overflowThreshold || (value === overflowThreshold && digit > (sign === 1 ? 7 : 8))) {
    return sign === 1 ? maxInt : minInt
  }

  // ...
}
```

### Step 6：通過檢查後，將目前位數併入結果

若確認加入新位數後仍在合法範圍內，就可安全地更新目前結果，並將掃描位置移到下一個字元，繼續後續解析。

```typescript
while (index < length) {
  // Step 4：逐位讀取數字，並在遇到非數字時停止

  // Step 5：在擴展結果前先檢查是否會溢位

  value = value * 10 + digit
  index++
}
```

### Step 7：依照符號回傳最終結果

當數字讀取完成後，將前面累積出的數值套用對應符號，即可得到最終答案。

```typescript
return value * sign
```

## 時間複雜度

- 需要從左到右掃描字串，最多處理每個字元一次；
- 前導空白、符號判斷與數字讀取皆屬單次線性流程；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數來記錄位置、符號、邊界與目前結果；
- 未使用任何額外陣列、字串或動態資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
