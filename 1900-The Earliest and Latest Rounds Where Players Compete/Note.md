# 1900. The Earliest and Latest Rounds Where Players Compete

There is a tournament where `n` players are participating. 
The players are standing in a single row and are numbered from `1` to `n` based on their initial standing position 
(player `1` is the first player in the row, player `2` is the second player in the row, etc.).

The tournament consists of multiple rounds (starting from round number `1`). 
In each round, the $i^{th}$ player from the front of the row competes against the $i^{th}$ player from the end of the row, 
and the winner advances to the next round. 
When the number of players is odd for the current round, the player in the middle automatically advances to the next round.

- For example, if the row consists of players `1, 2, 4, 6, 7`
  - Player `1` competes against player `7`.
  - Player `2` competes against player `6`.
  - Player `4` automatically advances to the next round.

After each round is over, the winners are lined back up in the row based on the original ordering assigned to them initially (ascending order).

The players numbered `firstPlayer` and `secondPlayer` are the best in the tournament. 
They can win against any other player before they compete against each other. If any two other players compete against each other, either of them might win, and thus you may choose the outcome of this round.

Given the integers `n`, `firstPlayer`, and `secondPlayer`, 
return an integer array containing two values, the earliest possible round number and the latest possible round number 
in which these two players will compete against each other, respectively.

**Constraints:**

- `2 <= n <= 28`
- `1 <= firstPlayer < secondPlayer <= n`

## 基礎思路

本題的核心是模擬一個錦標賽的對戰過程，以決定兩個特定玩家（`firstPlayer` 與 `secondPlayer`）最早與最晚可能相遇的回合數。

我們需要考量以下重點：

- 在每個回合中，前端的第 $i$ 位玩家會與後端第 $i$ 位玩家進行比賽，贏家晉級下一回合。若當前回合玩家數量為奇數，中間的玩家將自動晉級。
- 由於除了兩個目標玩家之外，其餘玩家的勝負是可以自由調整的，我們必須列舉所有可能的晉級情況，並透過遞迴探索所有可能的情境，以確定兩位目標玩家對戰的最早與最晚回合數。
- 使用動態規劃搭配記憶化遞迴（memoization）儲存每個情況下的結果，避免重複計算。

透過上述方式，我們可以有效且完整地探索所有可能的情況，得出答案。

## 解題步驟

### Step 1：初始化動態規劃（DP）儲存結構

我們透過三維陣列來儲存每個情況的最早與最晚對戰回合數：

```typescript
// dpEarliest[p][l][r] = 當有 p 名玩家，firstPlayer 在 l，secondPlayer 在 r 時，最早對戰回合
// dpLatest[p][l][r] = 當有 p 名玩家，firstPlayer 在 l，secondPlayer 在 r 時，最晚對戰回合
const dpEarliest: Int8Array[][] = [];
const dpLatest: Int8Array[][] = [];

// 預先為所有可能狀態配置記憶體空間
for (let playerCount = 0; playerCount <= playerCountTotal; playerCount++) {
  dpEarliest[playerCount] = [];
  dpLatest[playerCount] = [];
  for (let leftPlayerPosition = 0; leftPlayerPosition <= playerCount; leftPlayerPosition++) {
    // 陣列大小 = playerCount+1，讓 index 對應玩家編號
    const size = playerCount + 1;
    dpEarliest[playerCount][leftPlayerPosition] = new Int8Array(size);
    dpEarliest[playerCount][leftPlayerPosition].fill(-1); // -1 代表尚未拜訪
    dpLatest[playerCount][leftPlayerPosition] = new Int8Array(size); // 預設為0
  }
}
```

### Step 2：定義遞迴函式 `computeRounds`

#### Step 2.1：處裡已計算過的狀態與變數初始化

每次進入新狀態時，先判斷此狀態是否已計算過，若有則直接取出回傳；否則初始化本次計算用的變數。

```typescript
function computeRounds(
  currentPlayerCount: number,
  firstPosition: number,
  secondPosition: number
): [number, number] {
  // 如果此狀態已計算過，直接回傳快取
  const memoMin = dpEarliest[currentPlayerCount][firstPosition][secondPosition];
  if (memoMin !== -1) {
    return [
      memoMin,
      dpLatest[currentPlayerCount][firstPosition][secondPosition],
    ];
  }

  let earliestRound = Infinity; // 初始化最早回合為無窮大
  let latestRound = 0; // 初始化最晚回合為0
}
```

#### Step 2.2：判斷基礎情況（兩玩家本回合直接對戰）

若本回合兩玩家剛好一頭一尾（編號互為鏡像），則他們馬上對戰，直接回傳 1。

```typescript
function computeRounds(
  currentPlayerCount: number,
  firstPosition: number,
  secondPosition: number
): [number, number] {
  // Step 2.1：處裡已計算過的狀態與變數初始化

  // 基礎情況：兩人本回合直接對戰
  if (firstPosition + secondPosition === currentPlayerCount + 1) {
    // 此回合兩人被配對
    earliestRound = latestRound = 1;

    // 儲存計算結果以便未來重用
    dpEarliest[currentPlayerCount][firstPosition][secondPosition] = earliestRound;
    dpLatest[currentPlayerCount][firstPosition][secondPosition] = latestRound;
    return [earliestRound, latestRound];
  }

  // 進入下一回合，分析其他玩家所有可能結果
}
```

#### Step 2.3：分析並歸類本回合的比賽情況

將所有玩家依據與目標玩家位置分成三個區段（左、中、右），分析每場比賽可能產生的晉級情況：

- 計算每個區段必定晉級的玩家數。
- 統計跨區段比賽數量，這些比賽的結果會影響下一輪兩位目標玩家的相對位置。

```typescript
function computeRounds(
  currentPlayerCount: number,
  firstPosition: number,
  secondPosition: number
): [number, number] {
  // Step 2.1：處裡已計算過的狀態與變數初始化

  // Step 2.2：判斷基礎情況（兩玩家本回合直接對戰）

  // 本回合的比賽場數（每場兩人）
  const halfMatchCount = currentPlayerCount >> 1;
  // 判斷是否為奇數人，有人輪空
  const hasBye = (currentPlayerCount & 1) === 1;

  // 統計必定晉級的三區人數（不含目標兩人）
  let leftSegmentSurvivors = 0;    // 左區必定晉級人數
  let middleSegmentSurvivors = 0;  // 中間必定晉級人數
  let rightSegmentSurvivors = 0;   // 右區必定晉級人數

  // 統計跨區比賽次數（這些勝負可任意分配）
  let crossLeftMiddleMatches = 0;   // 左-中比賽數
  let crossLeftRightMatches = 0;    // 左-右比賽數
  let crossMiddleRightMatches = 0;  // 中-右比賽數

  // 逐場比賽分類與計數
  for (let i = 1; i <= halfMatchCount; i++) {
    const j = currentPlayerCount - i + 1;

    // Helper: 判斷玩家位置區段
    //   0 = 完全在 firstPlayer 左側
    //   1 = firstPlayer 的位置
    //   2 = 在 firstPlayer 跟 secondPlayer 中間
    //   3 = secondPlayer 的位置
    //   4 = 完全在 secondPlayer 右側
    const segmentOf = (playerIndex: number) => 
      playerIndex < firstPosition ? 0
        : playerIndex === firstPosition ? 1
          : playerIndex < secondPosition ? 2
            : playerIndex === secondPosition ? 3
              : 4;

    const segmentA = segmentOf(i);
    const segmentB = segmentOf(j);

    // 跳過涉及任一目標玩家的比賽，因他們必勝
    if (segmentA === 1 || segmentA === 3 || segmentB === 1 || segmentB === 3) {
      continue;
    }

    // 分群計算每場配對落於哪一類
    const smallerSegment = segmentA < segmentB ? segmentA : segmentB;
    const largerSegment = segmentA < segmentB ? segmentB : segmentA;

    // 同區段配對，必有一人晉級
    if (smallerSegment === 0 && largerSegment === 0) {
      leftSegmentSurvivors++;
    } else if (smallerSegment === 2 && largerSegment === 2) {
      middleSegmentSurvivors++;
    } else if (smallerSegment === 4 && largerSegment === 4) {
      rightSegmentSurvivors++;
    } else if (smallerSegment === 0 && largerSegment === 2) {
      // 跨區對戰，晉級人選可自由指定
      crossLeftMiddleMatches++;
    } else if (smallerSegment === 0 && largerSegment === 4) {
      crossLeftRightMatches++;
    } else if (smallerSegment === 2 && largerSegment === 4) {
      crossMiddleRightMatches++;
    }
  }

  // ...
}
```

#### Step 2.4：處理「輪空」情況

當人數為奇數時，中間位置玩家自動晉級：

```typescript
function computeRounds(
  currentPlayerCount: number,
  firstPosition: number,
  secondPosition: number
): [number, number] {
  // Step 2.1：處裡已計算過的狀態與變數初始化

  // Step 2.2：判斷基礎情況（兩玩家本回合直接對戰）
  
  // Step 2.3：分析並歸類本回合的比賽情況

  // 若有輪空，判斷輪空者歸屬哪區並累加
  if (hasBye) {
    const middlePosition = (currentPlayerCount + 1) >> 1;
    const byeSegment = middlePosition < firstPosition ? 0
      : middlePosition === firstPosition ? 1
        : middlePosition < secondPosition ? 2
          : middlePosition === secondPosition ? 3
            : 4;

    // 該區晉級人數+1
    if (byeSegment === 0) {
      leftSegmentSurvivors++;
    } else if (byeSegment === 2) {
      middleSegmentSurvivors++;
    } else if (byeSegment === 4) {
      rightSegmentSurvivors++;
    }
    // (若輪空為1或3則代表目標玩家，本來就會晉級)
  }

  // ...
}
```

#### Step 2.5：遞迴枚舉下一回合的所有可能情境

窮舉所有跨區段比賽勝負可能，並遞迴計算下一回合的結果：

```typescript
function computeRounds(
  currentPlayerCount: number,
  firstPosition: number,
  secondPosition: number
): [number, number] {
  // Step 2.1：處裡已計算過的狀態與變數初始化

  // Step 2.2：判斷基礎情況（兩玩家本回合直接對戰）

  // Step 2.3：分析並歸類本回合的比賽情況
  
  // Step 2.4：處理「輪空」情況


  // 枚舉所有跨區對戰的勝負情況
  for (let leftMiddleWinners = 0; leftMiddleWinners <= crossLeftMiddleMatches; leftMiddleWinners++) {
    for (let leftRightWinners = 0; leftRightWinners <= crossLeftRightMatches; leftRightWinners++) {
      for (let middleRightWinners = 0; middleRightWinners <= crossMiddleRightMatches; middleRightWinners++) {
        // 計算各區晉級人數
        const survivorsLeft = leftSegmentSurvivors
          + leftMiddleWinners
          + leftRightWinners;

        const survivorsMiddle = middleSegmentSurvivors
          + (crossLeftMiddleMatches - leftMiddleWinners)
          + middleRightWinners;

        const survivorsRight = rightSegmentSurvivors
          + (crossLeftRightMatches - leftRightWinners)
          + (crossMiddleRightMatches - middleRightWinners);

        // 下一輪總人數 + 兩位目標玩家
        const nextPlayerCount = survivorsLeft + survivorsMiddle + survivorsRight + 2;
        // 兩人排序後在下一輪的新位置
        const nextFirstPosition = survivorsLeft + 1;
        const nextSecondPosition = survivorsLeft + survivorsMiddle + 2;

        // 遞迴計算下個狀態
        const [subMin, subMax] = computeRounds(
          nextPlayerCount,
          nextFirstPosition,
          nextSecondPosition
        );

        // 彙總所有情境的最小和最大
        earliestRound = Math.min(earliestRound, subMin + 1);
        latestRound = Math.max(latestRound, subMax + 1);
      }
    }
  }

  // 儲存計算結果到備忘錄
  dpEarliest[currentPlayerCount][firstPosition][secondPosition] = earliestRound;
  dpLatest[currentPlayerCount][firstPosition][secondPosition] = latestRound;
  return [earliestRound, latestRound];
}
```

### Step 3：計算並返回結果

```typescript
// 初始呼叫，帶入全體人數與兩目標初始位置
return computeRounds(playerCountTotal, firstPlayerPosition, secondPlayerPosition);
```

## 時間複雜度

- 狀態數量約為 $O(n^3)$，每個狀態需進行最多 $O(n^3)$ 的枚舉。
- 總時間複雜度為 $O(n^6)$。

> $O(n^6)$

## 空間複雜度

- 使用兩個三維陣列儲存動態規劃結果。
- 總空間複雜度為 $O(n^3)$。

> $O(n^3)$
