# 3499. Maximize Active Section with Trade I

You are given a binary string s of length `n`, where:

- `'1'` represents an active section.
- `'0'` represents an inactive section.

You can perform at most one trade to maximize the number of active sections in `s`. 
In a trade, you:

- Convert a contiguous block of `'1'`s that is surrounded by `'0'`s to all `'0'`s.
- Afterward, convert a contiguous block of `'0'`s that is surrounded by `'1'`s to all `'1'`s.

Return the maximum number of active sections in `s` after making the optimal trade.

Note: Treat `s` as if it is augmented with a `'1'` at both ends, forming `t = '1' + s + '1'`. 
The augmented `'1'`s do not contribute to the final count.

**Constraints:**

- `1 <= n == s.length <= 10^5`
- `s[i]` is either `'0'` or `'1'`

## 基礎思路

本題要求在一個二進位字串中，透過**至多一次交易**來最大化「活躍區段」（即 `'1'`）的數量。所謂交易的定義為：先將某個被 `'0'` 包夾的連續 `'1'` 區塊全部轉為 `'0'`，再將某個被 `'1'` 包夾的連續 `'0'` 區塊全部轉為 `'1'`。

在思考解法時，可掌握以下核心觀察：

- **交易的淨效果是「合併」**：
  將一個 `'1'` 區塊變為 `'0'`，會使其兩側原本被此區塊隔開的 `'0'` 區塊相連；接著再把這段合併後的 `'0'` 區塊全部變為 `'1'`。整體來看，原本的 `'1'` 數量不變（挪走多少又補回多少），真正的增益來自於「被合併的兩段 `'0'` 一次補滿為 `'1'`」。

- **增益來源為相鄰兩段 `'0'` 的總長**：
  對於任一被 `'1'` 區塊夾在中間的兩段 `'0'`（即 `0...0 1...1 0...0` 的結構），交易能讓這兩段 `'0'` 全部轉為 `'1'`。因此每一個「非空的 `'1'` 區塊、且左右皆存在 `'0'` 區塊」都對應一個候選增益，其值為左右兩段 `'0'` 的長度總和。

- **首尾補 `'1'` 的等價處理**：
  題目提示將字串視為兩端各補上 `'1'`，形成 `t = '1' + s + '1'`。這保證了字串邊界處的 `'0'` 區塊也能被視為「被 `'1'` 包夾」，使邊界情況與中間情況統一處理，而補上的 `'1'` 不計入最終答案。

- **最終答案的組成**：
  結果為「原始 `'1'` 的總數」加上「所有候選增益中的最大值」。

依據以上特性，可以採用以下策略：

- **線性掃描字串，交替計數連續的 `'1'` 區塊與 `'0'` 區塊**。
- **維護前一段 `'0'` 的長度**，當遇到「前段 `'0'`、非空 `'1'` 區塊、後段 `'0'`」三者皆存在時，計算兩段 `'0'` 的合併長度並更新最大可合併值。
- **最後回傳 `'1'` 總數加上最大可合併的 `'0'` 長度**。

此策略僅需一次線性掃描即可完成，效率極高。

## 解題步驟

### Step 1：初始化字串長度與相關統計變數

先取得字串長度，並預先定義 `'1'` 的 ASCII 碼以便後續快速比對；同時初始化 `'1'` 總數、前一段 `'0'` 的長度，以及最大可合併的 `'0'` 長度。

```typescript
const length = s.length;
const CHAR_ONE = 49; // '1' 的 ASCII 碼

let totalNumberOfOnes = 0;
let previousZeroRunLength = 0;
let maxMergeableZeros = 0;
```

### Step 2：以外層迴圈逐段掃描，並先計數連續的 `'1'` 區塊

使用 `index` 從頭掃描整個字串。每一輪先計數一段連續的 `'1'`，記錄其長度以判斷此區塊是否非空，並將其累加到 `'1'` 的總數中。

```typescript
let index = 0;
while (index < length) {
  // 計數一段連續的 '1'，並追蹤其是否為非空區塊
  let onesRunLength = 0;
  while (index < length && s.charCodeAt(index) === CHAR_ONE) {
    ++index;
    ++onesRunLength;
  }
  totalNumberOfOnes += onesRunLength;

  // ...
}
```

### Step 3：接著計數緊隨其後的連續 `'0'` 區塊

在 `'1'` 區塊之後，繼續計數緊接著的一段連續 `'0'`，記錄其長度作為當前這一段的 `'0'` 長度。

```typescript
while (index < length) {
  // Step 2：計數連續的 '1' 區塊並累加至總數

  // 計數緊隨其後的連續 '0' 區塊
  let currentZeroRunLength = 0;
  while (index < length && s.charCodeAt(index) !== CHAR_ONE) {
    ++index;
    ++currentZeroRunLength;
  }

  // ...
}
```

### Step 4：檢查是否構成有效交易並更新最大可合併長度

當「前一段 `'0'`」、「非空的 `'1'` 區塊」、「當前段 `'0'`」三者同時存在時，代表存在合法交易；此時計算左右兩段 `'0'` 的合併長度，並更新最大可合併值。

```typescript
while (index < length) {
  // Step 2：計數連續的 '1' 區塊並累加至總數

  // Step 3：計數緊隨其後的連續 '0' 區塊

  // 一次有效交易需要非空 '1' 區塊的左右兩側皆存在 '0'
  if (previousZeroRunLength > 0 && onesRunLength > 0 && currentZeroRunLength > 0) {
    const combinedZeros = previousZeroRunLength + currentZeroRunLength;
    if (combinedZeros > maxMergeableZeros) {
      maxMergeableZeros = combinedZeros;
    }
  }

  // ...
}
```

### Step 5：更新前一段 `'0'` 的長度，供下一輪比對使用

在每一輪結尾，將當前段的 `'0'` 長度記錄為「前一段 `'0'` 長度」，以便下一次迴圈判斷是否構成有效交易。

```typescript
while (index < length) {
  // Step 2：計數連續的 '1' 區塊並累加至總數

  // Step 3：計數緊隨其後的連續 '0' 區塊

  // Step 4：檢查有效交易並更新最大可合併長度

  previousZeroRunLength = currentZeroRunLength;
}
```

### Step 6：回傳最終結果

最終答案為原始 `'1'` 的總數，加上所有候選交易中能合併的最大 `'0'` 長度。

```typescript
return totalNumberOfOnes + maxMergeableZeros;
```

## 時間複雜度

- 外層迴圈與內層兩個計數迴圈合計，每個字元恰好被 `index` 掃描一次；
- 所有比對與更新皆為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數，未配置任何額外陣列或動態空間；
- 空間用量不隨輸入長度增長。
- 總空間複雜度為 $O(1)$。

> $O(1)$
