# 3360. Stone Removal Game

Alice and Bob are playing a game where they take turns removing stones from a pile, with Alice going first.

Alice starts by removing exactly 10 stones on her first turn.
For each subsequent turn, each player removes exactly 1 fewer stone than the previous opponent.
The player who cannot make a move loses the game.

Given a positive integer `n`, return `true` if Alice wins the game and `false` otherwise.

**Constraints:**

- `1 <= n <= 50`

## 基礎思路

本題描述一個取石子遊戲：Alice 先手且第一回合固定取走 10 顆，之後每位玩家都必須比對手上一回合少取 1 顆，無法依規定取石的一方落敗。
題目要求判斷在給定的初始石子數下，Alice 是否能獲勝。

在思考解法時，可掌握以下核心觀察：

- **整場遊戲的取石序列是完全固定的**：
  每回合的取石數依序為 10、9、8、7……，玩家沒有任何選擇空間，因此勝負只取決於初始石子數。

- **勝負由「哪一回合無法取石」決定**：
  若某回合輪到的玩家所需的石子數超過剩餘數量，該玩家即落敗。因此只要追蹤每回合結束後的累計移除量，就能判斷遊戲在何處結束。

- **Alice 獲勝的初始石子數會形成連續區間**：
  當 Alice 完成某次取石後，若剩餘石子不足以讓 Bob 完成下一回合，Alice 即獲勝。
  這些初始石子數恰好落在「Alice 本回合後的累計量」到「Bob 下回合後的累計量減一」之間。

- **輸入範圍極小且固定**：
  初始石子數最多僅 50，因此可一次性模擬整個固定序列，預先建立所有可能輸入的勝負結果。

依據以上特性，可以採用以下策略：

- **預先模擬固定的取石序列**，逐回合累計已移除的石子數。
- **每當輪到 Alice 取石後，將對應的獲勝區間整段標記**於勝負表中。
- **查詢時直接讀取預先計算的結果**，達到常數時間判斷。

此策略將遊戲模擬與查詢分離，使每次判斷都不需要重新模擬。

## 解題步驟

### Step 1：定義石子數上限與勝負表

先依約束條件定義最大石子數，並配置一張足以涵蓋所有可能輸入的勝負表，以 1 表示 Alice 獲勝、0 表示落敗。

```typescript
/** 約束條件允許的最大石子數 */
const MAXIMUM_PILE_SIZE = 50;

/** 預先計算的勝負表：該石子數下 Alice 獲勝則為 1，否則為 0 */
const aliceWinTable = new Uint8Array(MAXIMUM_PILE_SIZE + 1);
```

### Step 2：初始化模擬狀態並計算各回合後的累計移除量

在建表函數中，先初始化已移除的石子總數、本回合應取的石子數（首回合為 10），以及目前是否輪到 Alice。
進入迴圈後，只要本回合仍需取石，且累計移除量尚未超過上限，就持續模擬。每一輪先算出本回合結束後的累計量，以及下一位玩家完成取石後的累計量。

```typescript
/**
 * 模擬一次固定的取石序列，並標記所有 Alice 獲勝的石子數。
 * @param maximumPileSize - 勝負表需要填寫的最大石子數
 */
function buildAliceWinTable(maximumPileSize: number): void {
  let stonesRemovedSoFar = 0;
  let stonesThisTurn = 10;
  let isAliceTurn = true;

  while (stonesThisTurn > 0 && stonesRemovedSoFar <= maximumPileSize) {
    const totalAfterThisTurn = stonesRemovedSoFar + stonesThisTurn;
    const totalAfterNextTurn = totalAfterThisTurn + stonesThisTurn - 1;

    // ...
  }
}
```

### Step 3：在 Alice 的回合標記其獲勝區間

若本回合由 Alice 取石，則凡是初始石子數足以讓 Alice 完成本回合、卻不足以讓 Bob 完成下一回合者，皆為 Alice 獲勝。
因此將「本回合後累計量」到「下一回合後累計量減一」這段區間標記為獲勝，並以最大石子數限制上界，避免超出表格範圍。

```typescript
/**
 * 模擬一次固定的取石序列，並標記所有 Alice 獲勝的石子數。
 * @param maximumPileSize - 勝負表需要填寫的最大石子數
 */
function buildAliceWinTable(maximumPileSize: number): void {
  // Step 2：初始化模擬狀態

  while (stonesThisTurn > 0 && stonesRemovedSoFar <= maximumPileSize) {
    // Step 2：計算本回合與下一回合後的累計移除量

    // Alice 取石後，凡是不足以讓 Bob 完成下一步的石子數，皆為 Alice 獲勝
    if (isAliceTurn) {
      const upperBound = Math.min(totalAfterNextTurn - 1, maximumPileSize);
      for (let pileSize = totalAfterThisTurn; pileSize <= upperBound; pileSize++) {
        aliceWinTable[pileSize] = 1;
      }
    }

    // ...
  }
}
```

### Step 4：推進至下一回合

完成本回合的判斷後，更新累計移除量，將下一回合的取石數減 1，並切換為另一位玩家，繼續模擬直到序列結束或超出上限。

```typescript
/**
 * 模擬一次固定的取石序列，並標記所有 Alice 獲勝的石子數。
 * @param maximumPileSize - 勝負表需要填寫的最大石子數
 */
function buildAliceWinTable(maximumPileSize: number): void {
  // Step 2：初始化模擬狀態

  while (stonesThisTurn > 0 && stonesRemovedSoFar <= maximumPileSize) {
    // Step 2：計算本回合與下一回合後的累計移除量

    // Step 3：在 Alice 的回合標記其獲勝區間

    stonesRemovedSoFar = totalAfterThisTurn;
    stonesThisTurn--;
    isAliceTurn = !isAliceTurn;
  }
}
```

### Step 5：預先建立勝負表

在任何查詢發生之前，先以最大石子數呼叫建表函數一次，使所有可能輸入的結果都已就緒。

```typescript
buildAliceWinTable(MAXIMUM_PILE_SIZE);
```

### Step 6：直接查表回傳結果

主函數只需讀取勝負表中對應初始石子數的位置，判斷其是否標記為獲勝即可。

```typescript
// 透過預先計算的勝負表進行 O(1) 查詢
return aliceWinTable[n] === 1;
```

## 時間複雜度

- 建表時取石序列最多模擬 10 回合，標記的區間總長不超過石子數上限 50，屬於固定的常數成本；
- 每次查詢僅讀取一次勝負表，為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 勝負表大小固定為石子數上限加一，與輸入無關；
- 模擬過程只使用固定數量的變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
