# 1758. Minimum Changes To Make Alternating Binary String

You are given a string `s` consisting only of the characters `'0'` and `'1'`. 
In one operation, you can change any `'0'` to `'1'` or vice versa.

The string is called alternating if no two adjacent characters are equal. 
For example, the string `"010"` is alternating, while the string `"0100"` is not.

Return the minimum number of operations needed to make s alternating.

**Constraints:**

- `1 <= s.length <= 10^4`
- `s[i]` is either `'0'` or `'1'`.

## 基礎思路

本題要將只包含 `0` 與 `1` 的字串，透過最少翻轉次數變成「相鄰字元不相同」的交錯字串。由於每次操作只能翻轉單一位置的位元，因此答案等同於「需要被翻轉的位置數量」。

核心觀察如下：

* **交錯字串只可能有兩種固定型態**
  對於任意長度，交錯字串必然是：

    * 以 `0` 開頭的型態：`0101...`
    * 以 `1` 開頭的型態：`1010...`

* **最少操作數等於與目標型態的錯配數量**
  若選定某一型態作為目標，只要統計目前字串中與該型態不一致的位置數量，該數量就是需要翻轉的次數。

* **兩種型態互為完全相反**
  在固定長度下，某位置若符合 `0101...`，就必然不符合 `1010...`，反之亦然，因此兩者的錯配數量加總必為字串長度。

解題策略：

* 先統計字串相對於 `0101...` 的錯配數量。
* 利用互補關係直接得到 `1010...` 的錯配數量。
* 回傳兩者較小值，即為最少操作次數。

## 解題步驟

### Step 1：取得字串長度並初始化錯配計數器

先取得字串長度，並準備一個計數器用來統計「以 `0` 開頭」交錯型態的錯配數量。

```typescript
const length: number = s.length;

// 統計若期望型態為 "0101..."（偶數索引 -> '0'，奇數索引 -> '1'）的錯配數量
let mismatchCountPatternZeroFirst = 0;
```

### Step 2：掃描字串並計算每個位置在目標型態下的期望值

逐一走訪所有位置，根據索引的奇偶性決定該位置在 `0101...` 型態下的期望字元，為後續比較做準備。

```typescript
for (let index = 0; index < length; index++) {
  // 透過索引奇偶性計算期望位元（避免額外配置）
  const expectedCharCode = ((index & 1) === 0) ? 48 : 49; // '0' : '1'
  
  // ...
}
```

### Step 3：比較當前字元與期望值並累加錯配數量

若當前位置的字元不符合 `0101...` 的期望值，代表該位置必須翻轉一次，因此將錯配計數加一。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：計算當前位置在目標型態下的期望值

  if (s.charCodeAt(index) !== expectedCharCode) {
    mismatchCountPatternZeroFirst++;
  }
}
```

### Step 4：利用互補關係得到另一型態的錯配數量並回傳最小值

由於兩種交錯型態在每個位置的期望值完全相反，因此另一型態 `1010...` 的錯配數量可由「長度減去第一型態錯配數」直接得到，最後回傳兩者較小者。

```typescript
// 對固定長度而言，另一型態 "1010..." 的錯配位置恰為 "0101..." 的匹配位置，因此其錯配數為 `length - mismatchCountPatternZeroFirst`。
const mismatchCountPatternOneFirst = length - mismatchCountPatternZeroFirst;
return mismatchCountPatternZeroFirst < mismatchCountPatternOneFirst
  ? mismatchCountPatternZeroFirst
  : mismatchCountPatternOneFirst;
```

## 時間複雜度

- 只需走訪字串一次以統計錯配數量。
- 其餘運算皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數變數作為計數與暫存。
- 不需額外陣列或與輸入大小相關的空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
