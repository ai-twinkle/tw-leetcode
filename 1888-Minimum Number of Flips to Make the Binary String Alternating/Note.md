# 1888. Minimum Number of Flips to Make the Binary String Alternating

You are given a binary string `s`. 
You are allowed to perform two types of operations on the string in any sequence:

- Type-1: Remove the character at the start of the string `s` and append it to the end of the string.
- Type-2: Pick any character in `s` and flip its value, i.e., if its value is `'0'` it becomes `'1'` and vice-versa.

Return the minimum number of type-2 operations you need to perform such that s becomes alternating.

The string is called alternating if no two adjacent characters are equal.

- For example, the strings `"010"` and `"1010"` are alternating, while the string `"0100"` is not.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s[i]` is either `'0'` or `'1'`.

## 基礎思路

本題除了可以翻轉字元外，還允許把字串開頭字元移到尾端，因此實際上不是只檢查原字串，而是要在所有可能的輪轉結果中，找出轉成交錯字串所需的最少翻轉次數。

可從以下幾個核心觀察切入：

* **交錯字串只有兩種合法型態**
  任意長度的二元交錯字串，必然只會是以 `0` 開頭的型態，或以 `1` 開頭的型態。因此對任一固定排列，只需比較這兩種目標型態的差異數量即可。

* **翻轉次數等於與目標型態的不匹配數量**
  若某個位置應為 `0` 卻是 `1`，或應為 `1` 卻是 `0`，就必須翻轉一次。因此，某排列變成交錯字串的最少翻轉次數，就是它對某個交錯型態的錯位數。

* **偶數長度下，輪轉不改變交錯結構的奇偶對齊**
  當字串長度為偶數時，整體左移後，各位置的奇偶性對應不會改變成另一種本質不同的排列，因此原本計算出的最小翻轉次數已足夠。

* **奇數長度下，輪轉會改變每個字元對應的奇偶角色**
  對奇數長度字串做一次左移，相當於所有其餘字元的目標位置奇偶性全部翻轉，而被移動的那個字元則落到最後一格。這使得我們可以利用前一輪的錯位數，常數時間更新下一輪的錯位數，而不必重新整串比對。

依據上述觀察，可採用以下策略：

* 先計算原字串相對於其中一種交錯型態的錯位數；
* 由此立即得到相對於另一種交錯型態的錯位數，取兩者較小值作為目前答案；
* 若長度為偶數，直接回傳；
* 若長度為奇數，則模擬每一次左輪轉，並用遞推方式快速更新新的錯位數，持續維護全域最小值。

這樣便能在一次初始統計與一次線性輪轉更新中求出答案。

## 解題步驟

### Step 1：初始化字串長度與第一種交錯型態的錯位計數

先取得字串長度，並準備一個計數器，用來統計目前字串相對於以 `0` 開頭交錯型態的錯位數量。

```typescript
const length = s.length;
let mismatchCount = 0;
```

### Step 2：統計原字串相對於 `"010101..."` 型態的錯位數

逐一掃描字串，把每個字元轉成數值後，與該位置在 `"010101..."` 型態下應有的值比較；若不同，就累加到錯位數中。

```typescript
// 統計與模式 "010101..." 的不匹配數量
for (let index = 0; index < length; index++) {
  const currentDigit = s.charCodeAt(index) & 1;
  mismatchCount += currentDigit ^ (index & 1);
}
```

### Step 3：用兩種交錯型態的較小錯位數初始化答案

已知其中一種交錯型態的錯位數後，另一種交錯型態的錯位數可由總長度扣除得到；接著取兩者較小值，作為目前最小翻轉次數。

```typescript
// 同時考慮兩種交錯模式下的最小翻轉次數
let minimumFlipCount = mismatchCount;
const oppositeMismatchCount = length - mismatchCount;

if (oppositeMismatchCount < minimumFlipCount) {
  minimumFlipCount = oppositeMismatchCount;
}
```

### Step 4：偶數長度時直接回傳答案

若字串長度為偶數，輪轉不會改變交錯型態的奇偶對齊方式，因此前面算出的最小值已是所有輪轉情況中的最佳答案。

```typescript
// 對於偶數長度，輪轉不會改變奇偶位置對齊
if ((length & 1) === 0) {
  return minimumFlipCount;
}
```

### Step 5：為奇數長度的輪轉更新準備最後索引

若長度為奇數，後續要依序模擬左輪轉；先記下最後一個索引，方便用來表示輪轉後的新尾端位置。

```typescript
const lastIndex = length - 1;
```

### Step 6：逐次模擬左輪轉並更新新的錯位數

對奇數長度字串，依序把每個前綴字元視為被移到尾端的字元。每次輪轉後，其餘字元的奇偶角色會整體翻轉，因此可用上一輪的錯位數直接推得下一輪的錯位數，而不必重新逐位比對。

```typescript
for (let startIndex = 0; startIndex < lastIndex; startIndex++) {
  const movedDigit = s.charCodeAt(startIndex) & 1;

  // 在左輪轉一次後更新不匹配數量（奇數長度情況）
  mismatchCount = lastIndex - mismatchCount + (movedDigit << 1);

  // ...
}
```

### Step 7：計算當前輪轉結果的最佳翻轉次數

對目前這個輪轉結果，仍需同時比較兩種交錯型態，因此取目前錯位數與其補數中的較小值，作為這一輪的最佳翻轉次數。

```typescript
for (let startIndex = 0; startIndex < lastIndex; startIndex++) {
  // Step 6：逐次模擬左輪轉並更新新的錯位數

  const currentBestFlipCount =
    mismatchCount < (length - mismatchCount)
      ? mismatchCount
      : (length - mismatchCount);

  // ...
}
```

### Step 8：用每次輪轉結果持續更新全域最小答案

若目前輪轉結果所需的翻轉次數更小，就更新全域答案，保留到目前為止的最佳值。

```typescript
for (let startIndex = 0; startIndex < lastIndex; startIndex++) {
  // Step 6：逐次模擬左輪轉並更新新的錯位數

  // Step 7：計算當前輪轉結果的最佳翻轉次數

  if (currentBestFlipCount < minimumFlipCount) {
    minimumFlipCount = currentBestFlipCount;
  }
}
```

### Step 9：回傳最終最小翻轉次數

所有可能的輪轉情況都檢查完後，回傳記錄下來的最小翻轉次數。

```typescript
return minimumFlipCount;
```

## 時間複雜度

- 先掃描一次字串以統計原始排列相對於交錯型態的錯位數，耗時為 $O(n)$。
- 若長度為奇數，後續再線性枚舉所有可能的左輪轉起點，每次僅做常數次更新，總耗時為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數來維護長度、錯位數與答案。
- 沒有額外建立與字串長度成比例的輔助陣列。
- 總空間複雜度為 $O(1)$。

> $O(1)$
