# 678. Valid Parenthesis String

Given a string `s` containing only three types of characters: 
`'('`, `')'` and `'*'`, return `true` if `s` is valid.

The following rules define a valid string:

- Any left parenthesis `'('` must have a corresponding right parenthesis `')'`.
- Any right parenthesis `')'` must have a corresponding left parenthesis `'('`.
- Left parenthesis `'('` must go before the corresponding right parenthesis `')'`.
- `'*'` could be treated as a single right parenthesis `')'` or a single left parenthesis `'('` or an empty string `""`.

**Constraints:**

- `1 <= s.length <= 100`
- `s[i]` is `'('`, `')'` or `'*'`.

## 基礎思路

本題要求判斷一個僅含左括號、右括號與萬用字元的字串，是否存在某種萬用字元的解讀方式，使整體成為合法的括號序列。由於每個萬用字元都有三種可能的身分，若逐一枚舉所有組合將呈指數級成長，因此必須尋找能一次掃描即完成判斷的方法。

在思考解法時，可掌握以下核心觀察：

- **合法性只取決於未匹配左括號的數量**：
  由左至右掃描時，真正重要的資訊只有「目前尚未被配對的左括號有幾個」，而非它們各自的位置。

- **萬用字元使該數量成為一個區間而非定值**：
  由於萬用字元可同時扮演三種角色，掃描到任一位置時，未匹配左括號的可能數量會形成一段連續範圍；只要維護這段範圍的下界與上界，即可涵蓋所有解讀方式。

- **上界歸零代表必然失敗**：
  若即使把所有萬用字元都當成左括號，未匹配數仍為負，代表右括號在此處已經過多，無論如何解讀都不可能合法，可立即終止。

- **下界不得為負，需截斷為零**：
  下界為負代表多餘的右括號已被萬用字元以空字串身分吸收，實際上並未真的產生負數，因此應回歸到零。

- **首尾字元具有不可挽回的性質**：
  以右括號開頭者永遠找不到配對，以左括號結尾者永遠無法被關閉，這兩種情況可在掃描前直接排除。

依據以上特性，可以採用以下策略：

- **以一組下界與上界表示未匹配左括號的可能數量區間**，取代對萬用字元的窮舉。
- **由左至右單次掃描，依字元種類分別更新上界與下界**，並在每一步檢查上界是否已失效、修正下界的負值。
- **掃描結束後，若區間涵蓋零，代表存在一種解讀方式使所有括號完全配對**。

此策略以線性時間與常數空間完成判斷，避免了對萬用字元組合的指數級搜尋。

## 解題步驟

### Step 1：預先定義字元碼常數

為避免在掃描過程中反覆建立單字元字串，先將兩種括號的字元碼定義為常數，後續一律以數值比較進行判斷。

```typescript
/**
 * 三種可能輸入字元所對應的字元碼常數。
 * 以數值字元碼比較可避免每個索引都產生字串切片配置。
 */
const OPEN_PAREN_CODE = 40;
const CLOSE_PAREN_CODE = 41;
```

### Step 2：取得長度並排除首尾必然失敗的情況

先取得字串長度，接著檢查首尾字元：若開頭即為右括號，它永遠找不到前方的左括號；若結尾為左括號，它永遠等不到後方的右括號。兩者皆可直接判定為不合法。

```typescript
const length = s.length;

// 開頭的 ')' 永遠無法被配對，結尾的 '(' 永遠無法被關閉。
if (s.charCodeAt(0) === CLOSE_PAREN_CODE || s.charCodeAt(length - 1) === OPEN_PAREN_CODE) {
  return false;
}
```

### Step 3：初始化未匹配左括號的可能區間

以兩個變數分別記錄目前尚未匹配的左括號數量的最小與最大可能值，掃描開始時兩者皆為零。

```typescript
// 目前尚未被配對的 '(' 數量的最小與最大可能值。
let minimumOpen = 0;
let maximumOpen = 0;
```

### Step 4：逐字元掃描並更新區間上界

由左至右取出每個字元的字元碼。在最樂觀的解讀下，萬用字元會被視為左括號，因此只有遇到右括號時上界才會減少，其餘情況一律增加。

```typescript
for (let index = 0; index < length; index++) {
  const characterCode = s.charCodeAt(index);

  // '(' 必定開啟一組；'*' 也可能開啟，因此兩者皆使上界增加。
  if (characterCode === CLOSE_PAREN_CODE) {
    maximumOpen--;
  } else {
    maximumOpen++;
  }

  // ...
}
```

### Step 5：更新區間下界

在最保守的解讀下，萬用字元會被視為右括號，因此只有確定為左括號時下界才會增加，右括號與萬用字元皆使其減少。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取出字元碼並更新區間上界

  // 只有真正的 '(' 必定開啟一組；')' 與 '*' 都可能關閉一組。
  if (characterCode === OPEN_PAREN_CODE) {
    minimumOpen++;
  } else {
    minimumOpen--;
  }

  // ...
}
```

### Step 6：檢查上界失效並修正下界的負值

每一輪更新後立即校正區間：若上界已為負，代表即使把所有萬用字元都當成左括號，右括號仍然過多，可直接判定失敗；若下界為負，代表多餘的右括號已被萬用字元以空字串身分吸收，應將其截斷回零。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取出字元碼並更新區間上界

  // Step 5：更新區間下界

  // 即使把所有萬用字元都視為 '('，此處的 ')' 仍然過多。
  if (maximumOpen < 0) {
    return false;
  }

  // 多餘的右括號已由扮演空字串的萬用字元吸收。
  if (minimumOpen < 0) {
    minimumOpen = 0;
  }
}
```

### Step 7：以區間是否涵蓋零決定最終結果

掃描結束後，下界即為可達到的最小未匹配左括號數量；若它為零，代表存在一種解讀方式使所有括號完全配對。

```typescript
// 僅當區間內可達到零個未匹配的 '(' 時才算合法。
return minimumOpen === 0;
```

## 時間複雜度

- 首尾字元的檢查為常數時間；
- 主迴圈對字串進行單次由左至右掃描，每個字元僅做常數次比較與加減；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數維護區間上下界與當前字元碼；
- 全程未配置任何額外陣列或字串；
- 總空間複雜度為 $O(1)$。

> $O(1)$
