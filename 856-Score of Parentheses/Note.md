# 856. Score of Parentheses

Given a balanced parentheses string `s`, return the score of the string.

The score of a balanced parentheses string is based on the following rule:

- `"()"` has score `1`.
- `AB` has score `A + B`, where `A` and `B` are balanced parentheses strings.
- `(A)` has score `2 * A`, where `A` is a balanced parentheses string.

**Constraints:**

- `2 <= s.length <= 50`
- `s` consists of only `'('` and `')'`.
- `s` is a balanced parentheses string.

## 基礎思路

本題給定一個保證合法的括號字串，要求依照「最小單位計 1 分、並列相加、外包一層則加倍」的規則計算總分。字串長度上限僅 50，因此重點不在於極端效能，而在於找到一個不需遞迴、也不需輔助堆疊的簡潔計算方式。

在思考解法時，可掌握以下核心觀察：

- **分數的來源只有最小單位**：
  規則中真正產生分數的只有最小的那一對括號，其餘規則都只是把既有分數相加或加倍，因此總分可視為所有最小單位各自貢獻值的總和。

- **加倍次數等於被包覆的層數**：
  每多被一層括號包住，該最小單位的貢獻就會翻倍一次。因此一個位於第 d 層的最小單位，其最終貢獻恰好是 2 的 d 次方。

- **最小單位可由相鄰字元辨識**：
  只要一個右括號緊接在一個左括號之後，就代表中間沒有任何其他內容，必然是一個最小單位；這讓辨識工作不需要任何額外結構。

- **深度可在掃描過程中即時維護**：
  遇到左括號深度加一、遇到右括號深度減一，因此在掃描到某個位置時，當下的深度即為該處的巢狀層數。

- **數值範圍安全無虞**：
  由於字串長度受限，巢狀深度不會過大，以位移方式計算 2 的次方不會超出整數可表示範圍。

依據以上特性，可以採用以下策略：

- **以單次線性掃描同時維護巢狀深度**，不使用遞迴或堆疊。
- **僅在偵測到最小單位時累計貢獻**，貢獻值直接由當下深度換算而得。
- **保留前一個字元的資訊**，讓最小單位的判定不需要重複讀取字串。

此策略將原本看似遞迴的定義轉化為封閉形式的加總，使整體計算一次掃描即可完成。

## 解題步驟

### Step 1：預先定義左括號的字元碼常數

為了在掃描時以字元碼比較取代字串比較，先將左括號的字元碼定義為常數。

```typescript
const OPEN_PAREN_CODE = 40;
```

### Step 2：初始化掃描所需的狀態變數

取得字串長度，並準備三項狀態：累計總分、目前的巢狀深度，以及前一個字元的字元碼（初始化為不可能與括號相符的 0）。

```typescript
const length = s.length;
let score = 0;
let depth = 0;
let previousCode = 0;
```

### Step 3：逐字掃描並依括號方向更新深度與分數

以單一迴圈走訪整個字串：取得當前字元碼後，若為左括號則深度加一；若為右括號則先將深度減一，再判斷前一個字元是否為左括號——若是，代表此處構成一個最小單位，其貢獻恰為以當下深度換算的 2 的次方，直接累加進總分。

```typescript
for (let index = 0; index < length; index++) {
  const currentCode = s.charCodeAt(index);

  if (currentCode === OPEN_PAREN_CODE) {
    depth++;
  } else {
    depth--;

    // 緊接在 "(" 之後的 ")" 構成最內層配對，其值為 2^depth
    if (previousCode === OPEN_PAREN_CODE) {
      score += 1 << depth;
    }
  }

  // ...
}
```

### Step 4：將當前字元碼向後傳遞

每輪結束前把當前字元碼記錄下來，使下一輪的最小單位判定不需再次讀取字串。

```typescript
for (let index = 0; index < length; index++) {
  // Step 3：依括號方向更新深度並累計最內層配對的分數

  // 將字元碼向後傳遞，使最內層配對的檢查不需額外讀取
  previousCode = currentCode;
}
```

### Step 5：回傳累計完成的總分

掃描結束後，所有最小單位的貢獻皆已累加完畢，直接回傳總分。

```typescript
return score;
```

## 時間複雜度

- 僅對字串進行一次線性掃描，每個字元處理一次；
- 每個字元內的判斷、深度更新與位移運算皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數維護分數、深度與前一字元；
- 未使用遞迴堆疊或任何額外陣列。
- 總空間複雜度為 $O(1)$。

> $O(1)$
