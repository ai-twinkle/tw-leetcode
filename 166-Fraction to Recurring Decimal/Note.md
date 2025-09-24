# 166. Fraction to Recurring Decimal

Given two integers representing the `numerator` and `denominator` of a fraction, return the fraction in string format.

If the fractional part is repeating, enclose the repeating part in parentheses.

If multiple answers are possible, return any of them.

It is guaranteed that the length of the answer string is less than `10^4` for all the given inputs.

**Constraints:**

- `-2^31 <= numerator, denominator <= 2^31 - 1`
- `denominator != 0`

## 基礎思路

本題要求我們將一個分數表示為字串，若存在循環小數，則需將循環部分以括號括起。具體來說，輸入是一組整數 `numerator` 與 `denominator`，我們需回傳其小數表示形式，格式符合下列條件：

- 若為整數，直接輸出整數字串；
- 若有小數但最終會結束，則直接輸出有限小數；
- 若小數出現循環，則將循環段以 `()` 包住，例如：`1/3 → "0.(3)"`、`1/6 → "0.1(6)"`。

在思考解法時，我們需要特別注意幾個關鍵點：

- **正負號判斷**：結果的正負與分子、分母的正負組合有關；
- **整除特例**：若能整除，不需處理小數；
- **循環偵測**：小數若出現循環，需偵測並標示循環段；
- **字串處理與效率**：答案長度最多不超過 $10^4$，表示演算法需高效且無無窮迴圈。

為了解決這個問題，我們可以採用以下策略：

- **符號處理與整數部分**：先計算整數部分並處理符號，再判斷是否有餘數，若無則直接回傳；
- **餘數追蹤**：使用 `Map` 記錄每個餘數第一次出現的位置，若餘數重複出現則表示循環開始；
- **長除法模擬**：透過乘以 10 取下一位小數，並更新餘數，重複此過程直到餘數為 0 或出現循環；
- **組裝輸出**：將整數部分與小數部分組合，並在循環處插入括號，最後轉成字串輸出。

## 解題步驟

### Step 1：處理分子為 0 的情況

若分子為 0，代表結果必為 0，直接回傳。

```typescript
// 若分子為 0，則整體結果為 "0"，直接回傳
if (numerator === 0) {
  return "0";
}
```

### Step 2：處理正負號

當分子與分母符號相異，結果為負；需加上負號字首。

```typescript
// 判斷正負號：當分子與分母正負相異時，結果為負數
const isNegative = (numerator > 0) !== (denominator > 0);
const signPrefix = isNegative ? "-" : "";
```

### Step 3：轉為正整數，避免負數影響運算

將分子與分母都轉為正整數，簡化後續除法與餘數計算。

```typescript
// 取分子與分母的絕對值，避免負數干擾後續除法與餘數運算
const numeratorAbs = Math.abs(numerator);
const denominatorAbs = Math.abs(denominator);
```

### Step 4：計算整數部分與整除判斷

先計算整數部分並取餘數，若餘數為 0，表示無小數部分，直接回傳結果。

```typescript
// 計算整數部分（商）
const integralPart = Math.floor(numeratorAbs / denominatorAbs);

// 計算初始餘數
let remainder = numeratorAbs % denominatorAbs;

// 若無餘數（能整除），直接回傳整數結果
if (remainder === 0) {
  return signPrefix + integralPart.toString();
}
```

### Step 5：初始化輸出結構與餘數追蹤表

建立初始輸出字串、儲存小數片段，並使用映射表紀錄每個餘數第一次出現的位置。

```typescript
// 建立初始輸出字串（含正負號與整數部分及小數點）
const head = signPrefix + integralPart.toString() + ".";
const outputSegments: string[] = [head];

// 建立映射：餘數 → 對應字串位置，用來偵測循環
const firstIndexByRemainder = new Map<number, number>();

// 記錄目前輸出字串長度，用來標示循環起點
let currentLength = head.length;
```

### Step 6：模擬長除法，逐位構建小數並偵測循環

每次將餘數乘以 10 取得下一位數字，若該餘數已出現則表示循環，插入括號並回傳。

```typescript
// 模擬長除法過程，逐位處理小數
while (remainder !== 0) {
  // 若餘數已出現，表示進入循環，插入括號
  const seenAt = firstIndexByRemainder.get(remainder);
  if (seenAt !== undefined) {
    const built = outputSegments.join("");
    return built.slice(0, seenAt) + "(" + built.slice(seenAt) + ")";
  }

  // 紀錄該餘數第一次出現的位置
  firstIndexByRemainder.set(remainder, currentLength);

  // 將餘數乘 10，準備計算下一位數字
  remainder *= 10;

  // 取得下一位小數（整除部分）
  const digit = Math.floor(remainder / denominatorAbs);

  // 將數字轉為字元並加入輸出陣列
  outputSegments.push(String.fromCharCode(48 + digit));
  currentLength += 1;

  // 計算新的餘數，進入下一輪
  remainder %= denominatorAbs;
}
```

### Step 7：小數有限的情況，直接輸出

若最終餘數為 0，表示為有限小數，將所有片段組裝為字串並回傳。

```typescript
// 小數非循環（餘數歸零），組裝所有片段並回傳
return outputSegments.join("");
```

## 時間複雜度

- 每個餘數最多出現一次，迴圈最多執行 $n$ 次，其中 $n$ 為分母的絕對值。
- 其餘操作皆為常數或與餘數數量等量。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用 `Map` 儲存每個餘數第一次出現的位置，最多儲存 $O(n)$ 筆。
- 小數位數最長亦為 $O(n)$，存於輸出陣列中。
- 總空間複雜度為 $O(n)$。

> $O(n)$

