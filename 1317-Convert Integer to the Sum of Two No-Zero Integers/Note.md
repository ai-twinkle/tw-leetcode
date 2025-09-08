# 1317. Convert Integer to the Sum of Two No-Zero Integers

No-Zero integer is a positive integer that does not contain any `0` in its decimal representation.

Given an integer `n`, return a list of two integers `[a, b]` where:

- `a` and `b` are No-Zero integers.
- `a + b = n`

The test cases are generated so that there is at least one valid solution. 
If there are many valid solutions, you can return any of them.

**Constraints:**

- `2 <= n <= 10^4`

## 基礎思路

題目希望將一個正整數 `n` 拆成兩個不含 `0` 的整數 `a` 與 `b`，且滿足 $a + b = n$。
我們可以觀察出這是一個構造題，只要找到**任意一組**合法的 `a`、`b` 即可，不需要找出所有組合或最佳答案。

考慮以下策略：

- 從 `1` 開始遍歷所有可能的 `a` 值，對應的 `b = n - a`。
- 檢查 `a` 和 `b` 是否皆不含數字 `0`。
- 第一組符合條件的即為解，立即回傳。

這樣的暴力策略在本題是可行的，原因是：

- `n` 最大為 $10^4$，最多嘗試 $n-1$ 次，效能可接受。
- 題目保證至少存在一組合法解，因此一定可以提早停止。

## 解題步驟

### Step 1: 嘗試所有可能拆法並回傳第一組合法結果

使用 `for` 迴圈從 `1` 遍歷到 `n - 1`，並檢查是否 `a` 與 `b` 都是不含 0 的整數。

- 利用 `toString().includes("0")` 判斷是否含有 `0`
- 一旦找到符合條件的組合即回傳 `[a, b]`

```typescript
for (let firstCandidate = 1; firstCandidate < n; firstCandidate++) {
  const secondCandidate = n - firstCandidate;
  if (!firstCandidate.toString().includes("0") && !secondCandidate.toString().includes("0")) {
    return [firstCandidate, secondCandidate];
  }
}
```

### Step 2: 回傳空陣列（理論上不會發生）

由於題目保證一定有解，此行純粹作為保險機制存在。

```typescript
return [];
```

## 時間複雜度

- 最多嘗試 $n - 1$ 種可能，每種需轉字串並檢查是否含 `0`。
- 每次檢查約需 $O(\log n)$ 時間。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 僅使用常數額外空間（少量變數與字串操作）。
- 總空間複雜度為 $O(1)$。

> $O(1)$
