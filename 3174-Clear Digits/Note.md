# 3174. Clear Digits

You are given a string `s`.

Your task is to remove all digits by doing this operation repeatedly:

- Delete the first digit and the closest non-digit character to its left.

Return the resulting string after removing all digits.

**Constraints:**

- `1 <= s.length <= 100`
- `s` consists only of lowercase English letters and digits.
- The input is generated such that it is possible to delete all digits.

## 基礎思路

這題可以轉換成典型 Stack 的問題，利用 Stack 的先進後出（LIFO）特性，可以很自然地達成這個需求。

- 若遇到字母：將字母 push 到 Stack 中。
- 若遇到數字：代表要刪除該數字左側最近的字母，因此從 Stack pop 出一個元素（如果 Stack 非空）。

遍歷完所有字元後，Stack 中剩下的字母即為最終結果。只需將它們依序組合成字串返回即可。

**圖示如下**： (以 `s = "ab123c"` 為例)

- **Iteration 1**：讀取 `'a'` → Stack = `['a']`
- **Iteration 2**：讀取 `'b'` → Stack = `['a', 'b']`
- **Iteration 3**：讀取 `'1'` → pop `'b'` → Stack = `['a']`
- **Iteration 4**：讀取 `'2'` → pop `'a'` → Stack = `[]`
- **Iteration 5**：讀取 `'3'` → Stack 為空，不做動作 → Stack = `[]`
- **Iteration 6**：讀取 `'c'` → Stack = `['c']`

**最終結果**：`"c"`

> Tips:
> - 從題目中辨識適合用 Stack 的關鍵在於觀察問題是否涉及「回溯」或「撤銷」前一個操作。
> - 在本題中，每當遇到一個數字，就需要刪除該數字左側最近的一個字母，這正好符合 Stack 的先進後出（LIFO）特性。
> - 因此，當你看到類似「刪除上一個」、「撤銷最近」等操作時，考慮使用 Stack 來解題通常是個不錯的選擇。

## 解題步驟

### Step 1: 初始化 Stack 並遍歷字串

```typescript
const stack: string[] = [];
for (const char of s) {
  if (isNaN(parseInt(char))) {
    // 如果是字母，將字母 push 到 Stack 中
    stack.push(char);
  } else {
    // 如果是數字，代表要刪除該數字左側最近的字母
    stack.pop();
  }
}
```

### Step 2: 將 Stack 中的字母組合成字串

```typescript
return stack.join('');
```

## 時間複雜度

- 我們只需遍歷一次字串，因此時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 最壞情況下，Stack 中會存放所有字母，因此空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
