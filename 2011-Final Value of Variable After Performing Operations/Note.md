# 2011. Final Value of Variable After Performing Operations

There is a programming language with only four operations and one variable `X`:

- `++X` and `X++` increments the value of the variable `X` by `1`.
- `--X` and `X--` decrements the value of the variable `X` by `1`.

Initially, the value of `X` is `0`.

Given an array of strings `operations` containing a list of operations, return the final value of `X` after performing all the operations.

**Constraints:**

- `1 <= operations.length <= 100`
- `operations[i]` will be either `"++X"`, `"X++"`, `"--X"`, or `"X--"`.

## 基礎思路

本題要求模擬一個僅有變數 `X` 的簡化語言，其中允許的操作僅有四種：

- `++X`、`X++`：將 `X` 增加 `1`。
- `--X`、`X--`：將 `X` 減少 `1`。

初始條件為 `X = 0`，最終需返回執行完所有操作後的 `X` 值。

在分析問題時，我們可以觀察到以下重點：

- 四種操作本質上僅有「加一」與「減一」兩種效果；
- 由於每個字串長度固定且格式一致，因此不需解析整個字串內容，只需確認中間符號即可；
- 由於操作數量上限為 100，單次掃描即可完成運算，無需額外資料結構。

為了達成最簡潔且高效的解法，可採取以下策略：

- **狀態模擬**：使用變數 `result` 代表 `X` 的當前值，初始為 `0`。
- **符號辨識**：利用字元編碼（ASCII code）判斷操作類型，若中間字元為 `'+'`，則代表加一，否則為減一。
- **單次遍歷**：逐一掃描每個操作並更新結果。

此方法能在 $O(n)$ 的時間內完成所有操作，且空間僅使用常數級變數，極為高效。

## 解題步驟

### Step 1：定義常數與初始化變數

定義 `'+'` 的 ASCII 代碼常數以利比較，並初始化 `result` 為 `0`。

```typescript
const PLUS_CHAR_CODE = 43; // '+' 的 ASCII 代碼

// 初始化結果變數 X = 0
let result = 0;
const length = operations.length;
```

### Step 2：遍歷所有操作並判斷符號

對每個操作字串檢查其中間字元（索引為 1）。若為 `'+'`，則遞增；否則遞減。

```typescript
for (let index = 0; index < length; index++) {
  // 判斷操作中間字元是否為 '+'
  if (operations[index].charCodeAt(1) === PLUS_CHAR_CODE) {
    // 若為 '+'，執行遞增操作
    result++;
  } else {
    // 若非 '+'，則為 '-'，執行遞減操作
    result--;
  }
}
```

### Step 3：返回最終結果

執行完所有操作後，回傳變數 `result` 即為最終的 `X` 值。

```typescript
// 回傳執行完所有操作後的結果
return result;
```

## 時間複雜度

- 需遍歷一次 `operations` 陣列，每次操作判斷皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數變數 `result` 與 `length`。
- 總空間複雜度為 $O(1)$。

> $O(1)$
