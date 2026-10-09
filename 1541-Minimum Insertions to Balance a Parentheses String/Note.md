# 1541. Minimum Insertions to Balance a Parentheses String

Given a parentheses string `s` containing only the characters `'('` and `')'`. 
A parentheses string is balanced if:

- Any left parenthesis `'('` must have a corresponding two consecutive right parenthesis `'))'`.
- Left parenthesis `'('` must go before the corresponding two consecutive right parenthesis `'))'`.

In other words, we treat `'('` as an opening parenthesis and `'))'` as a closing parenthesis.

- For example, `"())"`, `"())(())))"` and `"(())())))"` are balanced, 
  `")()"`, `"()))"` and `"(()))"` are not balanced.

You can insert the characters `'('` and `')'` at any position of the string to balance it if needed.

Return the minimum number of insertions needed to make `s` balanced.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists of `'('` and `')'` only.

## 基礎思路

本題將「一個左括號」定義為需要「兩個連續右括號」來閉合，要求以最少的插入次數讓整個字串達成平衡。由於字串長度可達十萬，必須以單次線性掃描完成，不能使用回溯或重複掃描的做法。

在思考解法時，可掌握以下核心觀察：

- **閉合需求具有倍數關係**：
  每遇到一個左括號，就立即產生兩單位的右括號需求；而每遇到一個右括號，只能償還其中一單位。因此可將「尚未償還的右括號需求」視為一個持續累計的債務量。

- **債務的奇偶性決定是否需要補插**：
  若在遇到新的左括號時，債務量為奇數，代表前一個左括號只取得了一個右括號，缺少的那一個必須當場補上，否則後續無法再回頭修正。

- **右括號過剩時需倒補左括號**：
  當債務量被扣成負值，代表此時出現了沒有任何左括號可對應的右括號，必須補插一個左括號；而這個被補上的左括號本身又帶來兩單位需求，其中一單位已被當前的右括號消耗，故剩餘恰好一單位。

- **掃描結束後的剩餘債務即為尾端補字數**：
  所有未被償還的需求，都只能在字串尾端以右括號逐一補齊，因此可直接併入答案。

依據以上特性，可以採用以下策略：

- **以單一計數器追蹤尚未償還的右括號債務**，並以另一計數器累計插入次數。
- **掃描時依字元分流處理**：遇左括號先檢查奇偶性並補齊，再累加兩單位需求；遇右括號先償還一單位，若出現透支則補插左括號並重設債務。
- **掃描結束後，將剩餘債務全數視為必須補上的右括號**，與過程中的插入次數相加即為答案。

此策略僅需一次線性掃描與常數個計數器，即可求得最少插入次數。

## 解題步驟

### Step 1：初始化長度與兩個計數器

先取得字串長度，並準備兩個計數器：一個累計實際插入的字元數，另一個追蹤目前尚未被償還的右括號債務。

```typescript
const length = s.length;
let insertions = 0;
let neededClosings = 0;
```

### Step 2：掃描字串並處理左括號

逐一走訪每個字元，並以原始字元碼判斷類型以避免額外開銷。遇到左括號時，若當前債務為奇數，代表前一個左括號尚缺一個右括號，須立即補上並償還該單位；處理完畢後，再為這個新的左括號累加兩單位的右括號需求。

```typescript
for (let index = 0; index < length; index++) {
  // 直接比較原始字元碼（40 代表 '('），避免逐字元產生字串配置
  if (s.charCodeAt(index) === 40) {
    // 債務為奇數代表前一個 '(' 只取得一個 ')'，必須先補齊
    if ((neededClosings & 1) === 1) {
      neededClosings--;
      insertions++;
    }

    neededClosings += 2;
  } else {
    // ...
  }
}
```

### Step 3：處理右括號與透支情形

遇到右括號時，先償還一單位債務；若償還後債務變為負值，代表此右括號找不到任何可對應的左括號，必須補插一個左括號。該左括號帶來兩單位需求並由當前右括號消耗其一，因此債務重設為一。

```typescript
for (let index = 0; index < length; index++) {
  if (s.charCodeAt(index) === 40) {
    // Step 2：處理左括號並補齊奇數債務
  } else {
    neededClosings--;

    // 已無可消耗的 '(' 來對應此 ')'，因此插入一個仍欠一個 ')' 的 '('
    if (neededClosings < 0) {
      neededClosings = 1;
      insertions++;
    }
  }
}
```

### Step 4：補上尾端剩餘債務並回傳答案

掃描結束後，剩餘的每一單位債務都代表一個必須附加在字串尾端的右括號，將其與過程中的插入次數相加即為最少插入數。

```typescript
// 每一單位剩餘債務都代表一個必須附加的 ')'
return insertions + neededClosings;
```

## 時間複雜度

- 僅對字串進行一次線性掃描，共走訪 $n$ 個字元；
- 每個字元的判斷與計數更新皆為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數計數器；
- 無任何額外陣列、堆疊或遞迴堆疊空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
