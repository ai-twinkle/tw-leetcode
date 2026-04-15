# 2515. Shortest Distance to Target String in a Circular Array

You are given a 0-indexed circular string array `words` and a string `target`. 
A circular array means that the array's end connects to the array's beginning.

- Formally, the next element of `words[i]` is `words[(i + 1) % n]` and 
  the previous element of `words[i]` is `words[(i - 1 + n) % n]`, 
  where `n` is the length of `words`.

Starting from `startIndex`, you can move to either the next word or the previous word with `1` step at a time.

Return the shortest distance needed to reach the string `target`. 
If the string target does not exist in `words`, return `-1`.

**Constraints:**

- `1 <= words.length <= 100`
- `1 <= words[i].length <= 100`
- `words[i]` and `target` consist of only lowercase English letters.
- `0 <= startIndex < words.length`

## 基礎思路

本題要求在一個環狀字串陣列中，從指定起點出發，找到目標字串的最短距離。由於陣列是環狀的，從任意位置出發都可以選擇向前或向後移動，且最長的有效距離不超過陣列長度的一半。

在思考解法時，可掌握以下核心觀察：

- **環狀結構使得雙向搜尋等價**：
  在環狀陣列中，向前走 `d` 步與向後走 `n - d` 步會抵達同一位置，因此最短距離必定不超過 `⌊n / 2⌋`。

- **同步雙向展開可提前終止**：
  若從起點同時向兩個方向擴展，一旦任一方向命中目標，即可確定此距離為最短，無需繼續搜尋。

- **距離為 0 時兩方向重合**：
  起點本身即為距離 0 的唯一位置，向前與向後的索引相同，只需檢查一次，避免重複判斷。

- **索引的環繞可用分支修正處理**：
  向前超出陣列末端或向後超出陣列開頭時，透過加減陣列長度即可快速修正，避免取模運算的額外開銷。

依據以上特性，可以採用以下策略：

- **從距離 0 開始逐步向外展開**，同時計算正向與反向索引。
- **每一步先檢查正向索引，再檢查反向索引**；若任一命中目標，則立即記錄結果並停止迴圈。
- **若搜尋完所有可能距離後仍未命中，回傳 `-1`**。

此策略保證第一次命中即為最短距離，且能有效避免完整遍歷整個陣列。

## 解題步驟

### Step 1：初始化陣列長度與結果變數

記錄陣列總長度，並將結果預設為 `-1`，表示尚未找到目標；若最終仍為 `-1`，即代表目標不存在於陣列中。

```typescript
const length = words.length;
let result = -1;
```

### Step 2：從起點向外同步展開，計算正向與反向索引

以距離 `distance` 從 `0` 遞增到 `⌊length / 2⌋` 為止：
先計算正向（順時針）索引，若超出陣列尾端則減去長度以環繞；
再計算反向（逆時針）索引，若小於 0 則加上長度以環繞。
當 `result` 不再為 `-1` 時，代表已找到最短距離，即可停止迴圈。

```typescript
// 從 startIndex 向外展開，同時檢查兩個方向
for (let distance = 0; distance <= (length >> 1) && result === -1; distance++) {
  // 正向（順時針）索引，以分支方式處理環繞
  let forwardIndex = startIndex + distance;
  if (forwardIndex >= length) {
    forwardIndex -= length;
  }

  // 反向（逆時針）索引，以分支方式處理環繞
  let backwardIndex = startIndex - distance;
  if (backwardIndex < 0) {
    backwardIndex += length;
  }

  // ...
}
```

### Step 3：優先檢查正向索引，再條件性檢查反向索引

在每次迭代中，先判斷正向索引是否命中目標；
若未命中，且當前距離大於 0（避免 `distance === 0` 時重複檢查同一位置），
再判斷反向索引是否命中目標。
任一命中時，即將 `result` 設為當前距離。

```typescript
for (let distance = 0; distance <= (length >> 1) && result === -1; distance++) {
  // Step 2：計算正向與反向索引並處理環繞

  // 優先檢查正向，若正向不符合則在距離 > 0 時再檢查反向
  if (words[forwardIndex] === target) {
    result = distance;
  } else if (distance > 0 && words[backwardIndex] === target) {
    result = distance;
  }
}
```

### Step 4：回傳最終結果

迴圈結束後，`result` 若已被更新則為最短距離，否則仍為 `-1`，直接回傳即可。

```typescript
return result;
```

## 時間複雜度

- 迴圈最多執行 `⌊n / 2⌋ + 1` 次，其中 `n` 為陣列長度；
- 每次迭代內僅進行常數次比較與索引修正。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的輔助變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
