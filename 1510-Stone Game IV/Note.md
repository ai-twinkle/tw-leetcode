# 1510. Stone Game IV

Alice and Bob take turns playing a game, with Alice starting first.

Initially, there are `n` stones in a pile. 
On each player's turn, that player makes a move consisting of removing any non-zero square number of stones in the pile.

Also, if a player cannot make a move, he/she loses the game.

Given a positive integer `n`, return `true` if and only if Alice wins the game otherwise return `false`, 
assuming both players play optimally.

**Constraints:**

- `1 <= n <= 10^5`

You're right — the module-level constant declaration was never introduced in any Step, which breaks the 還原性 requirement. Here is the corrected 題解.

## 基礎思路

本題是一個典型的**博弈論（賽局理論）**問題。Alice 與 Bob 輪流從石堆中取走「非零的完全平方數」顆石子，無法行動者判負。我們需要判斷在雙方皆採取最佳策略下，先手的 Alice 是否能取勝。

在思考解法時，可掌握以下核心觀察：

- **必勝與必敗狀態具有遞迴性質**：
  某個狀態是否為必勝，取決於它能否轉移到一個「必敗狀態」。只要存在一種取法能讓對手陷入必敗，當前狀態即為必勝。

- **必敗狀態的定義**：
  若一個狀態的所有合法移動都只能通往「必勝狀態」，則此狀態為必敗，因為無論怎麼取，對手都能取勝。

- **狀態空間有限且可預先計算**：
  由於石子數量上限固定，所有狀態的勝負皆可透過遞推一次算出，之後每次查詢皆為常數時間。

- **正向遞推優於反向枚舉**：
  與其對每個狀態反查所有平方數來源，不如由小到大掃描：每當發現一個必敗狀態，便將它加上各個完全平方數所能到達的狀態全部標記為必勝，如此可自然地擴散必勝資訊。

- **平方數可增量產生**：
  相鄰完全平方數之間的差為連續奇數（$1, 3, 5, \dots$），因此可利用奇數遞增的方式產生下一個平方數，避免使用乘法。

依據以上特性，可以採用以下策略：

- **預先建立一張涵蓋所有石子數量的勝負查找表**。
- **由小到大掃描，凡尚未被標記者即為必敗狀態，並將其可到達的所有狀態標記為必勝**。
- **查詢時直接讀表回傳結果**，達成常數時間應答。

## 解題步驟

### Step 1：定義輸入上界常數

依據約束（`1 <= n <= 1e5`），石子數量的上界固定，先以常數記錄此上界，作為後續建表範圍的依據。

```typescript
/* 由約束給定的輸入上界（1 <= n <= 1e5）。 */
const MAXIMUM_STONES = 100000;
```

### Step 2：建立預計算的勝負查找表並準備由小到大掃描

我們以一個立即執行函數建構查找表，其中 `1` 代表當前行動者必勝、`0` 代表必敗。接著由小到大掃描每個位置，凡是尚未被標記者，代表它無法從任何必敗狀態抵達，因此本身即為必敗狀態。

```typescript
/**
 * 為 [0, MAXIMUM_STONES] 中每個石堆大小預先計算的勝負結果。
 * 值為 1 標記為當前行動者的必勝位置，0 則標記為必敗位置。
 * @returns 用於以 O(1) 回應每次查詢的查找表。
 */
const winningPosition = (function (): Uint8Array {
  const table = new Uint8Array(MAXIMUM_STONES + 1);
  /* 由小到大掃描，凡仍未被標記的位置皆無法從任何必敗狀態抵達，
     代表由它出發的每一步都會通往必勝狀態。 */
  for (let position = 0; position <= MAXIMUM_STONES; position++) {
    if (table[position] !== 0) {
      continue;
    }

    // ...
  }
})();
```

### Step 3：從必敗狀態出發，準備逐一產生完全平方數

當遇到一個必敗狀態時，任何加上完全平方數所到達的狀態皆為必勝狀態。此處先初始化第一個平方數（$1$）與用於產生下一個平方數的奇數步長，並計算第一個目標位置。

```typescript
const winningPosition = (function (): Uint8Array {
  // Step 2：建立查找表並跳過已標記（必勝）的位置

  for (let position = 0; position <= MAXIMUM_STONES; position++) {
    // Step 2：跳過已標記（必勝）的位置

    /* 將任一完全平方數加到必敗狀態上，即產生一個必勝狀態。 */
    let square = 1;
    let oddStep = 3;
    let target = position + square;

    // ...
  }
})();
```

### Step 4：將所有可到達的狀態標記為必勝，並增量推進平方數

透過內層迴圈不斷把 `target` 標記為必勝狀態，接著利用「相鄰平方數差為連續奇數」的性質，以奇數遞增的方式產生下一個平方數，重新計算目標位置，直到超出上界為止。

```typescript
const winningPosition = (function (): Uint8Array {
  // Step 2：建立查找表並跳過已標記（必勝）的位置

  for (let position = 0; position <= MAXIMUM_STONES; position++) {
    // Step 2：跳過已標記（必勝）的位置

    // Step 3：初始化第一個平方數與奇數步長

    while (target <= MAXIMUM_STONES) {
      table[target] = 1;
      /* 不使用乘法即可推進至下一個完全平方數。 */
      square += oddStep;
      oddStep += 2;
      target = position + square;
    }
  }
})();
```

### Step 5：回傳建構完成的查找表

當外層掃描結束後，整張勝負表即已建構完畢，將其回傳以供後續查詢使用。

```typescript
const winningPosition = (function (): Uint8Array {
  // Step 2：建立查找表並跳過已標記（必勝）的位置

  // Step 3 ~ Step 4：對每個必敗狀態標記其可到達的必勝狀態

  return table;
})();
```

### Step 6：查詢時直接讀表回傳結果

先手 Alice 是否獲勝，只需讀取對應石子數量的表格值即可；若標記為 `1` 則代表必勝，回傳 `true`，否則回傳 `false`。

```typescript
/**
 * 判斷先手的 Alice 是否能贏得此石子遊戲。
 * @param n 石堆中初始的石子數量。
 * @returns 當 Alice 在最佳策略下獲勝時回傳 True，否則回傳 False。
 */
function winnerSquareGame(n: number): boolean {
  return winningPosition[n] === 1;
}
```

## 時間複雜度

- 預處理階段對每個必敗狀態，向上標記其可到達的必勝狀態，總標記次數受限於狀態數乘上平方數個數，約為 $O(n \sqrt{n})$；
- 每次查詢僅需讀表，為 $O(1)$。
- 總時間複雜度為 $O(n \sqrt{n})$。

> $O(n\sqrt{n})$

## 空間複雜度

- 使用一張長度為 $n + 1$ 的查找表；
- 除此之外僅使用固定數量的變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
